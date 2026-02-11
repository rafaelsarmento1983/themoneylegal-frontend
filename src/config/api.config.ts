/**
 * Base URL da API
 */
export const API_BASE_URL = "/api/v1";

/**
 * Endpoints de autenticação
 * Usado para evitar refresh/renew em requests de auth
 */
export const AUTH_PATHS = new Set([
  "/auth/login",
  "/auth/register",
  "/auth/refresh",
  "/auth/logout",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/auth/resend-verification",
  "/auth/check-email",
  "/auth/pre-register",
  "/auth/verify-reset-code",
]);

/**
 * IDs de toasts relacionados à sessão
 */
export const SESSION_TOAST_IDS = {
  EXPIRING: "session-expiring",
  EXPIRED: "session-expired",
  RENEWED: "session-renewed",
} as const;

/**
 * Configuração de monitoramento/renovação de sessão
 */
export const SESSION_CONFIG = {
  EXPIRING_WARNING_WINDOW_MINUTES: 5,
  TICK_INTERVAL_MS: 5_000,

  // auto-renovar via atividade (mesma janela do toast)
  RENEW_ON_ACTIVITY_WINDOW_MINUTES: 5,
  MIN_REFRESH_INTERVAL_MS: 60_000,

  REDIRECT_DELAY_MS: 1200,
} as const;
