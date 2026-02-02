import { useEffect, useRef, useState } from "react";

export type EmailStatus = "idle" | "checking" | "available" | "exists" | "error";

type AnyResp =
  | { exists: boolean; message?: string }
  | boolean
  | { data?: any };

type UseEmailCheckCallbackPayload = { email: string; message?: string };

export type UseEmailCheckOptions = {
  email: string;
  enabled?: boolean;
  debounceMs?: number;
  isValidEmail?: (email: string) => boolean;

  // pode retornar {exists}, AxiosResponse({data}), ou boolean
  checkEmailAvailability: (email: string) => Promise<AnyResp>;

  invalidEmailMessage?: string;
  checkingMessage?: string;
  errorMessage?: string;

  /** callbacks opcionais (útil para toast no Register) */
  onExists?: (payload: UseEmailCheckCallbackPayload) => void;
  onAvailable?: (payload: UseEmailCheckCallbackPayload) => void;
  onError?: (payload: UseEmailCheckCallbackPayload) => void;

  /**
   * evita disparar callbacks repetidas vezes (StrictMode/duplicated renders)
   * chave usada: `${status}:${email}:${message}`
   */
  dedupeNotify?: boolean;
};

const defaultIsValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

function normalize(resp: AnyResp): { exists: boolean; message?: string } {
  // boolean direto
  if (typeof resp === "boolean") return { exists: resp };

  // AxiosResponse-like
  const maybeData = (resp as any)?.data;
  if (maybeData !== undefined) {
    if (typeof maybeData === "boolean") return { exists: maybeData };
    if (typeof maybeData?.exists === "boolean") {
      return { exists: maybeData.exists, message: maybeData.message };
    }
  }

  // objeto padrão
  if (typeof (resp as any)?.exists === "boolean") {
    return { exists: (resp as any).exists, message: (resp as any).message };
  }

  // fallback seguro
  return { exists: false };
}

export function useEmailCheck(options: UseEmailCheckOptions) {
  const {
    email,
    enabled = true,
    debounceMs = 600,
    isValidEmail = defaultIsValidEmail,
    checkEmailAvailability,
    invalidEmailMessage = "Digite um e-mail válido para continuar.",
    checkingMessage = "Verificando disponibilidade...",
    errorMessage = "Não foi possível verificar agora. Tente novamente.",
    onExists,
    onAvailable,
    onError,
    dedupeNotify = true,
  } = options;

  const [status, setStatus] = useState<EmailStatus>("idle");
  const [message, setMessage] = useState("");

  const timerRef = useRef<number | null>(null);
  const lastNotifyKeyRef = useRef<string>("");

  const reset = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = null;
    setStatus("idle");
    setMessage("");
  };

  const notifyOnce = (nextStatus: EmailStatus, nextEmail: string, nextMessage?: string) => {
    const key = `${nextStatus}:${nextEmail}:${nextMessage || ""}`;
    if (dedupeNotify && lastNotifyKeyRef.current === key) return;
    lastNotifyKeyRef.current = key;

    const payload: UseEmailCheckCallbackPayload = { email: nextEmail, message: nextMessage };

    if (nextStatus === "exists") onExists?.(payload);
    if (nextStatus === "available") onAvailable?.(payload);
    if (nextStatus === "error") onError?.(payload);
  };

  useEffect(() => {
    if (!enabled) {
      reset();
      return;
    }

    const e = (email || "").trim();

    if (!e) {
      setStatus("idle");
      setMessage("");
      return;
    }

    if (!isValidEmail(e)) {
      setStatus("idle");
      setMessage(invalidEmailMessage);
      return;
    }

    if (timerRef.current) window.clearTimeout(timerRef.current);
    let cancelled = false;

    timerRef.current = window.setTimeout(async () => {
      setStatus("checking");
      setMessage(checkingMessage);

      try {
        const raw = await checkEmailAvailability(e);
        if (cancelled) return;

        const result = normalize(raw);

        if (result.exists) {
          const msg = result.message || "E-mail já cadastrado.";
          setStatus("exists");
          setMessage(msg);
          notifyOnce("exists", e, msg);
        } else {
          const msg = result.message || "E-mail disponível.";
          setStatus("available");
          setMessage(msg);
          notifyOnce("available", e, msg);
        }
      } catch (_err) {
        if (cancelled) return;
        setStatus("error");
        setMessage(errorMessage);
        notifyOnce("error", e, errorMessage);
      }
    }, debounceMs);

    return () => {
      cancelled = true;
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email, enabled, debounceMs]);

  return {
    status,
    message,
    reset,
    isChecking: status === "checking",
    isAvailable: status === "available",
    exists: status === "exists",
    hasError: status === "error",
  };
}
