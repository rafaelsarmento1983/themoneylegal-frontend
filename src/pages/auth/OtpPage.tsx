import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Loader2, ArrowLeft, RefreshCw, XCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/Button";
import { authService } from "@/services/authService";
import logo from "@/assets/logo.png";
import { toastError } from "@/lib/toast/toast";
import { HeaderCardsAuth } from "@/components/ui/HeaderCardsAuth";
import { useShake } from "@/hooks/useShake";

const ease = [0.16, 1, 0.3, 1] as const;

const fadeSlide = {
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease } },
};

const OTP_LENGTH = 6;
const RESEND_TIMEOUT_SEC = 60;

function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}

function formatMMSS(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export const OtpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state as any) ?? {};
  const email = state?.email as string | undefined;

  // "reset" (padrão) mantém o fluxo atual de esqueci minha senha.
  // "register" reaproveita esta tela no cadastro (passo 2.1).
  const flow: "reset" | "register" = state?.flow ?? "reset";

  const backTo: string = state?.backTo ?? (flow === "register" ? "/register" : "/forgot-password");
  const successTo: string = state?.successTo ?? (flow === "register" ? "/register" : "/reset-password");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(RESEND_TIMEOUT_SEC);

  // Erro mostrado inline (abaixo dos campos)
  const [error, setError] = useState<string | null>(null);

  // refs dos inputs segmentados
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // Se caiu aqui sem email, volta pro início do fluxo
  useEffect(() => {
    if (!email) navigate(backTo, { replace: true });
  }, [email, backTo, navigate]);

  // Countdown para liberar "Reenviar"
  useEffect(() => {
    if (timeLeft <= 0) return;

    const t = window.setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => window.clearTimeout(t);
  }, [timeLeft]);

  const canResend = timeLeft <= 0 && !resendLoading && !loading;

  const otpComplete = useMemo(() => otp.length === OTP_LENGTH, [otp]);

  const resetTimer = () => setTimeLeft(RESEND_TIMEOUT_SEC);

  const focusIndex = (i: number) => {
    const el = inputsRef.current[i];
    if (el) el.focus();
  };

  const setOtpAt = (index: number, digit: string) => {
    const chars = otp.split("");
    while (chars.length < OTP_LENGTH) chars.push("");
    chars[index] = digit;
    const next = chars.join("").slice(0, OTP_LENGTH);
    setOtp(next);
  };

  const handleChangeDigit = (index: number, raw: string) => {
    setError(null);

    const d = onlyDigits(raw);
    if (!d) {
      setOtpAt(index, "");
      return;
    }

    // Se o usuário digitou mais de 1 char (alguns teclados fazem isso),
    // tratamos como paste começando do index.
    if (d.length > 1) {
      const chars = otp.split("");
      while (chars.length < OTP_LENGTH) chars.push("");

      for (let k = 0; k < d.length && index + k < OTP_LENGTH; k++) {
        chars[index + k] = d[k];
      }

      const next = chars.join("").slice(0, OTP_LENGTH);
      setOtp(next);

      const nextFocus = Math.min(index + d.length, OTP_LENGTH - 1);
      focusIndex(nextFocus);
      return;
    }

    setOtpAt(index, d[0]);

    // auto-avanço
    if (index < OTP_LENGTH - 1) focusIndex(index + 1);
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    setError(null);

    if (e.key === "Backspace") {
      // se o campo atual está vazio, volta foco e apaga anterior
      if (!otp[index] && index > 0) {
        e.preventDefault();
        setOtpAt(index - 1, "");
        focusIndex(index - 1);
      } else {
        // apaga o atual
        setOtpAt(index, "");
      }
    }

    // setas para navegar
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      focusIndex(index - 1);
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      e.preventDefault();
      focusIndex(index + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    const d = onlyDigits(text).slice(0, OTP_LENGTH);

    if (!d) return;

    e.preventDefault();
    setOtp(d.padEnd(OTP_LENGTH, "").slice(0, OTP_LENGTH));

    // foca último preenchido
    const last = Math.min(d.length - 1, OTP_LENGTH - 1);
    focusIndex(Math.max(last, 0));
  };

  const [otpInvalid, setOtpInvalid] = useState(false);

  const handleSubmit = async () => {

    if (!email || !otpComplete || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await authService.validatePasswordResetOtp({ email, otp });

      // só avança se backend afirmar explicitamente que é válido
      const isValid =
        res?.data === true ||
        res?.data?.valid === true ||
        res?.data?.success === true;

      if (!isValid) {

        setError("Código OTP inválido ou expirado.");
        setOtpInvalid(true);

        /*toastError({
          id: "otp-error-invalido",
          title: "Falha no OTP",
          description: "Código OTP inválido ou expirado.",
        });*/

        return;
      }

      if (flow === "register") {
        // Volta ao cadastro já liberando o passo de senha.
        navigate(successTo, {
          replace: true,
          state: {
            step: "password",
            otpVerified: true,
            email,
            name: state?.name,
          },
        });
        return;
      }

      navigate(successTo, {
        state: { email, otp, logout: true },
        replace: true,
      });
} catch (err: any) {

      setError(err?.response?.data?.message || "Código OTP inválido ou expirado.");
      setOtpInvalid(true);

    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email || !canResend) return;

    setResendLoading(true);
    setError(null);

    try {
      // ✅ Reenvia usando o mesmo endpoint que /forgot-password
      await authService.requestPasswordReset({ email });

      // limpa otp e reinicia timer
      setOtp("");
      resetTimer();

      // foca primeiro campo
      setTimeout(() => focusIndex(0), 0);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Não foi possível reenviar o código.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-blue-10)] via-white to-[var(--color-secondary-blue-10)]" />
            <HeaderCardsAuth
              variant="centered"
              title="Money Legal"
              subTitle=""
              shake={useShake(!email || otpInvalid)}
            >
      
        <p className="mt-2 text-center text-sm text-neutral-500">
          Digite o código de {OTP_LENGTH} dígitos enviado para seu e-mail.
        </p>

        <motion.div {...fadeSlide} className="mt-6 space-y-2">
          {/* OTP segmentado */}
          <div className="flex items-center justify-center gap-1">
            {Array.from({ length: OTP_LENGTH }).map((_, i) => {
              const hasError = !!error;
              const base =
                "w-12 h-14 text-center text-xl font-bold rounded-xl border outline-none transition";
              const border = hasError
                ? "!border-2 border-danger-300 focus:border-danger-400 focus:ring-2 focus:ring-danger-400/20"
                : "!border-2 border-neutral-300 focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/20";

              return (
                <input
                  key={i}
                  ref={(el) => (inputsRef.current[i] = el)}
                  value={otp[i] || ""}
                  onChange={(e) => handleChangeDigit(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  className={`${base} ${border}`}
                  aria-label={`Dígito ${i + 1}`}
                />
              );
            })}
          </div>

          {/* erro inline */}
          {error && (
            <p className="justify-center text-center text-sm text-danger-600 dark:text-danger-400 flex items-center gap-1.5 animate-slide-in-down">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </p>
          )}

          {/* feedback do timer */}
          <div className="text-center text-sm text-neutral-500">
            {timeLeft > 0
              ? `Você pode reenviar o código em ${formatMMSS(timeLeft)}`
              : "Não recebeu o código?"}
          </div>

          <div className="pt-2 space-y-3 flex flex-col items-center">
            <Button
              type="button"
              variant="outline"
              tone="filledLight"
              className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
              onClick={handleSubmit}
              disabled={!otpComplete || loading || resendLoading}
              loading={loading}
              rightIcon={
                loading ? <Loader2 className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />
              }
            >
              Verificar código
            </Button>

            <Button
              type="button"
              variant="outline"
              tone="plain"
              className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
              onClick={handleResend}
              disabled={!canResend}
              loading={resendLoading}
              rightIcon={<RefreshCw className="w-4 h-4" />}
            >
              Reenviar código
            </Button>

            <Button
              variant="outline"
              tone="plain"
              onClick={() => navigate("/forgot-password", { replace: true })}
              disabled={loading || resendLoading}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Voltar
            </Button>
          </div>
        </motion.div>
      </HeaderCardsAuth >
    </div>
  );
};

export default OtpPage;
