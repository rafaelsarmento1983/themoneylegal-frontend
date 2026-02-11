import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  XCircle,
  KeyRound,
  RotateCcw
} from "lucide-react";
import confetti from "canvas-confetti";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import logo from "@/assets/logo.png";
import { HeaderCardsAuth } from "@/components/ui/HeaderCardsAuth";
import { useShake } from "@/hooks/useShake";
import { toastSuccess } from "@/lib/toast/toast";

const ease = [0.16, 1, 0.3, 1] as const;

const fadeSlide = {
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease },
  },
};

interface LocationState {
  email?: string;
  otp?: string;
  logout?: boolean;
}

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuth } = useAuthStore();

  const [shake, setShake] = useState(false);

  const { email, otp, logout } = (location.state || {}) as LocationState;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 🔒 Proteção de rota:
   * não permite acesso direto ao reset sem OTP
   */
  useEffect(() => {
    if (!email || !otp) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, otp, navigate]);

  /**
   * 🔐 Requisitos de senha
   */
  const passwordRules = useMemo(
    () => [
      { label: "Mínimo de 8 caracteres", ok: password.length >= 8 },
      { label: "Uma letra maiúscula", ok: /[A-Z]/.test(password) },
      { label: "Uma letra minúscula", ok: /[a-z]/.test(password) },
      { label: "Um número", ok: /[0-9]/.test(password) },
      {
        label: "As senhas coincidem",
        ok: password === confirmPassword && !!password,
      },
    ],
    [password, confirmPassword]
  );

  const allRulesOk = passwordRules.every((r) => r.ok);

  /**
   * 🔁 Submit final
   */
  const handleSubmit = async () => {
    if (!email || !otp || !allRulesOk || loading) return;

    setLoading(true);
    setError(null);

    try {
      await authService.confirmPasswordReset({
        email,
        otp,
        password,
      });

      /**
       * 🔐 Força logout global no front
       * (mesmo que o backend já tenha invalidado tokens)
       */
      if (logout) {
        clearAuth();
      }

      confetti({
        particleCount: 160,
        spread: 80,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { message: "Sua senha foi alterada! Agora você pode entrar com a nova senha cadastrada.", type: "success" },
        });
      }, 1800);
    } catch (err: any) {

      setError(
        err?.response?.data?.message ||
        "Não foi possível redefinir a senha."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-[var(--color-secondary-blue-10)] to-white" />

      <HeaderCardsAuth
        variant="centered"
        title="Money Legal"
        subTitle=""
        shake={useShake(error)}
      >

        <p className="mt-2 text-center text-sm text-neutral-500">
          Defina uma nova senha de acesso à sua conta.
        </p>

        <motion.div {...fadeSlide} className="mt-6 space-y-2">
          {/* Nova senha */}
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Nova senha"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            customRounded="rounded-xl"
            customBorder="border-2 border-gray-200"
            customBg="bg-white"
            leftIcon={<Lock className="w-5 h-5" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-neutral-400 hover:text-neutral-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            }
          />

          {/* Confirmar senha */}
          <Input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirmar nova senha"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              setError(null);
            }}
            customRounded="rounded-xl"
            customBorder="border-2 border-gray-200"
            customBg="bg-white"
            leftIcon={<Lock className="w-5 h-5" />}
            rightIcon={
              <button
                type="button"
                onClick={() =>
                  setShowConfirmPassword((v) => !v)
                }
                className="text-neutral-400 hover:text-neutral-600"
                tabIndex={-1}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            }
          />

          {/* Regras de senha */}
          <div className="rounded-xl border border-neutral-200/70 bg-neutral-50 p-3">
            {passwordRules.map((rule) => (
              <div
                key={rule.label}
                className="flex items-center gap-2 text-xs"
              >
                {rule.ok ? (
                  <CheckCircle className="w-4 h-4 text-success-600" />
                ) : (
                  <XCircle className="w-4 h-4 text-neutral-400" />
                )}
                <span
                  className={
                    rule.ok
                      ? "text-success-600 font-medium"
                      : "text-neutral-500"
                  }
                >
                  {rule.label}
                </span>
              </div>
            ))}
          </div>

          {/* Erro */}
          {error && (
            <p className="justify-center text-sm text-danger-600 dark:text-danger-400 flex items-center gap-1.5 animate-slide-in-down">
              <XCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </p>
          )}

          <div className="pt-2 space-y-3 md:flex md:flex-col md:items-center">
            {/* Ação */}
            <Button
              type="button"
              variant="outline"
              tone="filledLight"
              className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
              onClick={handleSubmit}
              disabled={!allRulesOk || loading}
              loading={loading}
              rightIcon={
                loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4" />
                )
              }
            >
              Redefinir senha
            </Button>

            <Button
              variant="outline"
              tone="plain"
              onClick={() => navigate(-1)}
              disabled={!allRulesOk || loading}
              className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
              rightIcon={<RotateCcw className="w-4 h-4" />}
            >
              Reiniciar
            </Button>
          </div>
        </motion.div>
      </HeaderCardsAuth >
    </div>
  );
};

export default ResetPasswordPage;
