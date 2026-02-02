import React, { useMemo, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { HeaderCardsAuth } from "@/components/ui/HeaderCardsAuth";
import { useShake } from "@/hooks/useShake";

import { Mail, ArrowRight, ArrowLeft, Loader2, Rocket } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authService } from "@/services/authService";
import { useEmailCheck } from "@/hooks/useEmailCheck";

import logo from "@/assets/logo.png";

const ease = [0.16, 1, 0.3, 1] as const;

const fadeSlide = {
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease } },
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export const RecoveryPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const emailFromRoute = (location.state as { email?: string } | null)?.email ?? "";

  useEffect(() => {
    if (emailFromRoute) {
      setEmail(emailFromRoute);
    }
  }, [emailFromRoute]);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const emailValid = useMemo(() => isValidEmail(email), [email]);

  const emailCheck = useEmailCheck({
    email,
    enabled: true,
    debounceMs: 500,
    isValidEmail,
    checkEmailAvailability: (email) =>
      authService.checkEmailAvailability(email),

    invalidEmailMessage: "Digite um e-mail válido.",
    checkingMessage: "Verificando e-mail...",
    errorMessage: "Não foi possível verificar agora.",
    dedupeNotify: true,
  });

  const emailExists = emailCheck.status === "exists";
  const emailNotFound = emailCheck.status === "available";
  const emailChecking = emailCheck.status === "checking";
  const emailErrored = emailCheck.status === "error";

  const handleSubmit = async () => {
    // precisa existir + ser válido (igual Login/Register)
    if (!emailValid || !emailExists) return;

    setLoading(true);
    setError(null);

    try {
      await authService.requestPasswordReset({ email });

      navigate("/otp", {
        state: { email },
        replace: true,
      });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Encontramos sua conta, mas no momento não foi possível verificar.";

      setOtpError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-blue-10)] via-white to-[var(--color-secondary-blue-10)]" />

      <HeaderCardsAuth
        variant="centered"
        shake={useShake(emailNotFound || emailErrored)}
      >

        <p className="mt-2 text-center text-[15px] font-medium text-neutral-500">
          Informe seu e-mail cadastrado para receber o código de recuperação.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-danger-200 bg-danger-50 p-3 text-sm text-danger-700">
            {error}
          </div>
        )}

        <motion.div {...fadeSlide} className="mt-6 space-y-4">
          <Input
            type="email"
            placeholder="Seu e-mail"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              emailCheck.reset();
              setOtpError(null);
            }}
            required
            customRounded="rounded-xl"
            customBorder="border-2 border-gray-200"
            customBg="bg-white"
            leftIcon={<Mail className="w-5 h-5" />}
            rightIcon={
              emailChecking ? (
                <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
              ) : undefined
            }
            error={
              otpError
                ? otpError
                : emailNotFound
                  ? "E-mail não encontrado."
                  : undefined
            }
            success={emailExists ? "Conta encontrada. Podemos enviar o código." : undefined}
          />

          {emailNotFound && (
            <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50 p-4">
              <div className="text-sm font-semibold text-neutral-900">
                Não achamos essa conta.
              </div>
              <div className="text-sm font-medium text-neutral-600 mt-1">
                Se for seu primeiro acesso, crie sua conta em poucos passos.
              </div>
              <div className="mt-3 flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  tone="filledLight"
                  className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
                  rightIcon={<Rocket />}
                  onClick={() => navigate("/register")}
                >
                  Criar Conta
                </Button>
              </div>
            </div>
          )}

          <div className="pt-2 space-y-3 md:flex md:flex-col md:items-center">
            <Button
              type="button"
              variant="outline"
              tone="filledLight"
              className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
              onClick={handleSubmit}
              disabled={!emailValid || !emailExists || loading || emailChecking}
              loading={loading}
              rightIcon={loading ? <Loader2 /> : <ArrowRight />}
            >
              Enviar código
            </Button>

            <Button
              type="button"
              variant="outline"
              tone="plain"
              className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
              onClick={() => navigate("/login")}
              leftIcon={<ArrowLeft />}
            >
              Voltar
            </Button>
          </div>
        </motion.div>
      </HeaderCardsAuth>
    </div>
  );
};

export default RecoveryPasswordPage;
