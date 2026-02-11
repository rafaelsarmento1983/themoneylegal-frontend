// api.ts
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { toastDismiss, toastError, toastSuccess, toastWarning } from "@/lib/toast/toast";
import { forceLogout } from "@/lib/auth/logout";

import {
  API_BASE_URL,
  AUTH_PATHS,
  SESSION_CONFIG as SESSION,
  SESSION_TOAST_IDS as TOAST_IDS,
} from "@/config/api.config";

import { messageByCode } from "@/config/auth.config";

/**
 * =========================================================
 * Types
 * =========================================================
 */

type BackendErrorPayload = {
  code?: string;
  message?: string;
};

type ApiError = AxiosError<BackendErrorPayload>;

type ToastPayload = {
  id: string;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
};

declare module "axios" {
  // para permitir originalRequest._retry sem any
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

/**
 * =========================================================
 * Helpers (pequenos e reutilizáveis)
 * =========================================================
 */

function isAuthRequest(url?: string) {
  if (!url) return false;
  for (const path of AUTH_PATHS) {
    if (url.includes(path)) return true;
  }
  return false;
}

/**
 * =========================================================
 * Single Toast Manager (garante 1 toast visível por vez)
 * =========================================================
 */

class SingleToast {
  private lastToastId: string | null = null;

  success(payload: ToastPayload) {
    // ✅ Regra: ao exibir qualquer success, fecha todos os toasts imediatamente
    toastDismiss();

    // ✅ Regra específica: ao exibir RENEWED, mata os dois IDs críticos (redundante, mas garante)
    if (payload.id === TOAST_IDS.RENEWED) {
      toastDismiss(TOAST_IDS.EXPIRING);
      toastDismiss(TOAST_IDS.EXPIRED);
    }

    this.lastToastId = payload.id;
    toastSuccess(payload as any);
  }

  warning(payload: ToastPayload) {
    // mantém 1 toast gerenciado por vez (opcional)
    if (this.lastToastId && this.lastToastId !== payload.id) toastDismiss(this.lastToastId);
    this.lastToastId = payload.id;
    toastWarning(payload as any);
  }

  error(payload: ToastPayload) {
    // mantém 1 toast gerenciado por vez (opcional)
    if (this.lastToastId && this.lastToastId !== payload.id) toastDismiss(this.lastToastId);
    this.lastToastId = payload.id;
    toastError(payload as any);
  }
}

/**
 * =========================================================
 * Token Storage (centraliza localStorage)
 * =========================================================
 */

class TokenStorage {
  private accessKey = "accessToken";
  private refreshKey = "refreshToken";

  getAccessToken() {
    return localStorage.getItem(this.accessKey);
  }
  getRefreshToken() {
    return localStorage.getItem(this.refreshKey);
  }

  setTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem(this.accessKey, accessToken);
    localStorage.setItem(this.refreshKey, refreshToken);
  }

  clear() {
    localStorage.removeItem(this.accessKey);
    localStorage.removeItem(this.refreshKey);
  }
}

/**
 * =========================================================
 * JWT Utils (sem console, com falha segura)
 * =========================================================
 */

class JwtUtils {
  static getExpMs(token: string): number | null {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    try {
      const payloadJson = this.decodeBase64Url(parts[1]);
      const payload = JSON.parse(payloadJson) as { exp?: number };
      if (!payload?.exp) return null;
      return payload.exp * 1000;
    } catch {
      return null;
    }
  }

  private static decodeBase64Url(input: string) {
    let str = input.replace(/-/g, "+").replace(/_/g, "/");
    const pad = str.length % 4;
    if (pad) str += "=".repeat(4 - pad);
    return atob(str);
  }
}

/**
 * =========================================================
 * Auth Flow / Redirect (centraliza logout)
 * =========================================================
 */

class AuthFlow {
  clearAuthAndRedirect(reason?: "expired") {
    forceLogout(reason === "expired" ? "expired" : "unauthorized");
  }
}

/**
 * =========================================================
 * Refresh Manager (single-flight + cooldown externo)
 * =========================================================
 */

class RefreshManager {
  private inFlight: Promise<boolean> | null = null;

  constructor(
    private api: AxiosInstance,
    private tokens: TokenStorage,
    private toasts: SingleToast,
    private authFlow: AuthFlow
  ) {}

  /**
   * - deduplica refresh (single-flight)
   * - retorna true se atualizou tokens
   */
  refreshNow(): Promise<boolean> {
    if (this.inFlight) return this.inFlight;

    this.inFlight = this.doRefresh().finally(() => {
      this.inFlight = null;
    });

    return this.inFlight;
  }

  private async doRefresh(): Promise<boolean> {
    const refreshToken = this.tokens.getRefreshToken();
    if (!refreshToken) {
      this.toasts.error({
        id: TOAST_IDS.EXPIRED,
        title: "Ooops! 👀",
        description: "Conta desconectada. Faça login novamente.",
        duration: 10_000,
      });
      this.authFlow.clearAuthAndRedirect();
      return false;
    }

    try {
      const { data } = await this.api.post("/auth/refresh", { refreshToken });

      // espera-se { accessToken, refreshToken }
      this.tokens.setTokens(data.accessToken, data.refreshToken);

      this.toasts.success({
        id: TOAST_IDS.RENEWED,
        title: "Woohoo! 🎉",
        description: `Seja bem-vindo de volta! Bom te ver novamente!`,
        duration: 10_000,
      });

      return true;
    } catch (err) {
      const e = err as ApiError;
      const code = e.response?.data?.code;
      const msg = e.response?.data?.message;

      this.toasts.error({
        id: TOAST_IDS.EXPIRED,
        title: "Ooops! 👀",
        description: messageByCode(code ?? "AUTH_TOKEN_EXPIRED", msg),
        duration: 10_000,
      });

      this.authFlow.clearAuthAndRedirect();
      return false;
    }
  }

  isRefreshing() {
    return !!this.inFlight;
  }
}

/**
 * =========================================================
 * Session Monitor (tick + expiring toast + expired flow)
 * =========================================================
 */

class SessionMonitor {
  private started = false;
  private timer: number | null = null;

  // evita repetir "expired" várias vezes
  private expiredHandled = false;

  // evita update excessivo
  private lastShownRemainingMin: number | null = null;

  constructor(
    private tokens: TokenStorage,
    private toasts: SingleToast,
    private authFlow: AuthFlow,
    private refresh: RefreshManager
  ) {}

  start() {
    if (this.started) return;
    this.started = true;

    const tick = () => this.tick();
    tick();
    this.timer = window.setInterval(tick, SESSION.TICK_INTERVAL_MS);
  }

  stop() {
    if (this.timer) window.clearInterval(this.timer);
    this.timer = null;
    this.started = false;
  }

  onTokensRenewed() {
    // reset de estado após refresh OK
    this.expiredHandled = false;
    this.lastShownRemainingMin = null;
  }

  private tick() {
    const token = this.tokens.getAccessToken();
    if (!token) {
      // aguardando login
      this.expiredHandled = false;
      this.lastShownRemainingMin = null;
      return;
    }

    const expMs = JwtUtils.getExpMs(token);
    if (!expMs) return;

    const remainingMs = expMs - Date.now();
    const remainingMinutes = Math.ceil(remainingMs / 60_000);

    if (remainingMs <= 0) {
      if (this.expiredHandled) return;
      this.expiredHandled = true;

      this.toasts.error({
        id: TOAST_IDS.EXPIRED,
        title: "Ooops! 👀",
        description: "Como você não estava aqui, desconectamos sua conta.",
        duration: Infinity,
      });

      this.authFlow.clearAuthAndRedirect("expired");
      return;
    }

    // expiring toast (apenas quando muda o minuto, reduz spam)
    if (remainingMinutes <= SESSION.EXPIRING_WARNING_WINDOW_MINUTES) {
      if (this.lastShownRemainingMin === remainingMinutes) return;
      this.lastShownRemainingMin = remainingMinutes;

      const description =
        remainingMinutes === 1
          ? `Você ainda está por aí?`
          : `Em breve sua conta será desconectada. Você ainda está por aí?`;

      this.toasts.warning({
        id: TOAST_IDS.EXPIRING,
        title: "Ooops! 👀",
        description,
        duration: 70_000,
        action: {
          label: "Continuar conectado!",
          onClick: () => void this.refresh.refreshNow(),
        },
      });
    }
  }
}

/**
 * =========================================================
 * Activity Renew (renova automaticamente com atividade)
 * =========================================================
 */

class ActivityRenew {
  private listenersInstalled = false;
  private debounceTimer: number | null = null;
  private lastRefreshAt = 0;

  constructor(
    private tokens: TokenStorage,
    private refresh: RefreshManager,
    private monitor: SessionMonitor
  ) {}

  installOnce() {
    if (this.listenersInstalled) return;
    this.listenersInstalled = true;

    const onActivity = (evtName: string) => {
      if (this.debounceTimer) window.clearTimeout(this.debounceTimer);
      this.debounceTimer = window.setTimeout(() => {
        void this.maybeRenewOnActivity(evtName);
      }, 250);
    };

    window.addEventListener("focus", () => onActivity("focus"));
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") onActivity("visibilitychange");
    });

    window.addEventListener("click", () => onActivity("click"));
    window.addEventListener("keydown", () => onActivity("keydown"));
    window.addEventListener("mousemove", () => onActivity("mousemove"));
    window.addEventListener("scroll", () => onActivity("scroll"));
  }

  /**
   * Também pode ser chamado por request interceptor (atividade via API)
   */
  signal(reason: string) {
    if (this.debounceTimer) window.clearTimeout(this.debounceTimer);
    this.debounceTimer = window.setTimeout(() => {
      void this.maybeRenewOnActivity(reason);
    }, 250);
  }

  private getRemainingMs(): number | null {
    const token = this.tokens.getAccessToken();
    if (!token) return null;
    const expMs = JwtUtils.getExpMs(token);
    if (!expMs) return null;
    return expMs - Date.now();
  }

  private async maybeRenewOnActivity(reason: string) {
    const remainingMs = this.getRemainingMs();
    if (remainingMs == null) return;

    if (remainingMs <= 0) {
      // já expirou: deixa monitor/interceptor agir
      return;
    }

    const windowMs = SESSION.RENEW_ON_ACTIVITY_WINDOW_MINUTES * 60_000;

    // ainda longe de expirar
    if (remainingMs > windowMs) return;

    const now = Date.now();

    // cooldown
    if (now - this.lastRefreshAt < SESSION.MIN_REFRESH_INTERVAL_MS) return;

    // não paraleliza
    if (this.refresh.isRefreshing()) return;

    const ok = await this.refresh.refreshNow();
    if (ok) {
      this.lastRefreshAt = Date.now();
      this.monitor.onTokensRenewed();
    }
  }
}

/**
 * =========================================================
 * Error Reader (centraliza leitura de erro do backend)
 * =========================================================
 */

class ErrorReader {
  static getCode(err: unknown): string | undefined {
    const e = err as ApiError;
    return e?.response?.data?.code;
  }

  static getMessage(err: unknown): string | undefined {
    const e = err as ApiError;
    return e?.response?.data?.message;
  }

  static getStatus(err: unknown): number | undefined {
    const e = err as ApiError;
    return e?.response?.status;
  }
}

/**
 * =========================================================
 * API Client Factory
 * =========================================================
 */

function createApiClient(): {
  api: AxiosInstance;
  initSessionMonitor: () => void;
} {
  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
  });

  const tokens = new TokenStorage();
  const toasts = new SingleToast();
  const authFlow = new AuthFlow();
  const refresh = new RefreshManager(api, tokens, toasts, authFlow);
  const monitor = new SessionMonitor(tokens, toasts, authFlow, refresh);
  const activity = new ActivityRenew(tokens, refresh, monitor);

  /**
   * ----------------------
   * Request interceptor
   * ----------------------
   */
  api.interceptors.request.use(
    (config) => {
      const token = tokens.getAccessToken();
      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      // request conta como atividade (exceto endpoints de auth)
      const url = (config.url ?? "").toString();
      if (token && !isAuthRequest(url)) {
        activity.signal(`request:${url}`);
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  /**
   * ----------------------
   * Response interceptor
   * ----------------------
   */
  api.interceptors.response.use(
    (res) => res,
    async (error: any) => {
      // rede/cors/timeout: sem response
      if (!error?.response) return Promise.reject(error);

      const status = ErrorReader.getStatus(error);
      const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
      const url = (originalRequest?.url as string | undefined) ?? "";
      const code = ErrorReader.getCode(error);
      const backendMessage = ErrorReader.getMessage(error);

      // se for rota de auth, não tenta refresh aqui
      if (isAuthRequest(url)) return Promise.reject(error);

      // regras atuais
      if (status === 403) return Promise.reject(error);
      if (status !== 401) return Promise.reject(error);

      // códigos que exigem logout imediato
      const mustLogoutCodes = new Set([
        "AUTH_TOKEN_INVALID_SIGNATURE",
        "AUTH_TOKEN_MALFORMED",
        "AUTH_TOKEN_UNSUPPORTED",
        "AUTH_TOKEN_INVALID",
        "AUTH_TOKEN_MISSING",
        "AUTH_UNAUTHORIZED",
      ]);

      if (code && mustLogoutCodes.has(code)) {
        toasts.error({
          id: TOAST_IDS.EXPIRED,
          title: "Ooops! 👀",
          description: messageByCode(code, backendMessage),
          duration: 10_000,
        });
        authFlow.clearAuthAndRedirect();
        return Promise.reject(error);
      }

      // tenta refresh 1x por request
      if (!originalRequest._retry) {
        originalRequest._retry = true;

        const ok = await refresh.refreshNow();
        if (!ok) return Promise.reject(error);

        monitor.onTokensRenewed();

        const accessToken = tokens.getAccessToken();
        originalRequest.headers = originalRequest.headers ?? {};
        if (accessToken) (originalRequest.headers as any).Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      }

      // 401 após retry: força logout
      toasts.error({
        id: TOAST_IDS.EXPIRED,
        title: "Ooops! 👀",
        description: messageByCode("AUTH_TOKEN_EXPIRED", backendMessage),
        duration: 10_000,
      });

      authFlow.clearAuthAndRedirect();
      return Promise.reject(error);
    }
  );

  /**
   * ----------------------
   * init
   * ----------------------
   */
  const initSessionMonitor = () => {
    monitor.start();
    activity.installOnce();
  };

  return { api, initSessionMonitor };
}

/**
 * =========================================================
 * Exports
 * =========================================================
 */

const { api, initSessionMonitor } = createApiClient();

export { initSessionMonitor };
export default api;
