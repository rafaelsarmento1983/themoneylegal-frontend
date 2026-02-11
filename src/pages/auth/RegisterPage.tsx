import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Mail,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle,
  LogIn, XCircle
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import api from "@/services/api"; // ✅ NOVO: para chamar /auth/pre-register
import { useEmailCheck } from "@/hooks/useEmailCheck";
import { useShake } from "@/hooks/useShake";
import logo from "@/assets/logo.png";
import confetti from "canvas-confetti";
import { HeaderCardsAuth } from "../../components/ui/HeaderCardsAuth";

type Step = "name" | "email" | "password";

const ease = [0.16, 1, 0.3, 1] as const;

const fadeSlide = {
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease } },
  exit: { opacity: 0, y: -10, filter: "blur(6px)", transition: { duration: 0.28, ease } },
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { setAuth, isAuthenticated } = useAuthStore();

  const [step, setStep] = useState<Step>("name");
  const [isLoading, setIsLoading] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    confetti({
      particleCount: 160,
      spread: 80,
      origin: { y: 0.6 },
    });

    navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  // Retorno do OTP (passo 2.1) para liberar o passo de senha no cadastro
  useEffect(() => {
    const s = (location.state as any) ?? {};
    if (s?.step === "password" && s?.otpVerified) {
      setOtpVerified(true);
      setStep("password");
      setData((p) => ({
        ...p,
        name: s?.name ?? p.name,
        email: s?.email ?? p.email,
      }));
    }
  }, [location.state]);

  const emailValid = useMemo(() => isValidEmail(data.email), [data.email]);

  const emailCheck = useEmailCheck({
    email: data.email,
    enabled: true,
    debounceMs: 500,
    isValidEmail,
    checkEmailAvailability: (email) => authService.checkEmailAvailability(email),
    invalidEmailMessage: "Digite um e-mail válido.",
    checkingMessage: "Verificando e-mail...",
    errorMessage: "Não foi possível verificar agora.",
    dedupeNotify: true,
  });

  const emailAvailable = emailCheck.status === "available";
  const emailExists = emailCheck.status === "exists";
  const emailChecking = emailCheck.status === "checking";

  const passwordRequirements = useMemo(
    () => [
      { label: "Mínimo 8 caracteres", met: data.password.length >= 8 },
      { label: "Uma letra maiúscula", met: /[A-Z]/.test(data.password) },
      { label: "Uma letra minúscula", met: /[a-z]/.test(data.password) },
      { label: "Um número", met: /[0-9]/.test(data.password) },
      { label: "As senhas coincidem", met: data.password === data.confirmPassword && !!data.password },
    ],
    [data.password, data.confirmPassword]
  );

  const allPasswordOk = passwordRequirements.every((r) => r.met);

  const handleChange = (field: string, value: string | boolean) => {
    setData((p) => ({ ...p, [field]: value }));

    if (field === "email") {
      // se o e-mail mudar, precisa validar OTP novamente
      if (otpVerified) setOtpVerified(false);
    }

    if (error) setError(null);
    if (field === "email") emailCheck.reset();
  };

  const goToRegisterOtp = async () => {
    if (!emailAvailable || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      // ✅ NOVO (Passo 2): pré-cadastro no backend
      // Usa /auth/pre-register antes de enviar OTP
      await api.post("/auth/pre-register", {
        name: data.name,
        email: data.email,
      });

      // ✅ Passo 2.1: reaproveitando endpoints atuais para envio do OTP
      await authService.requestPasswordReset({ email: data.email });

      navigate("/otp", {
        replace: true,
        state: {
          flow: "register",
          email: data.email,
          name: data.name,
          backTo: "/register",
          successTo: "/register",
        },
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Não foi possível iniciar o cadastro com este e-mail.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!otpVerified) {
      setError("Confirme o código enviado por e-mail para continuar.");
      setStep("email");
      return;
    }

    if (!allPasswordOk || !data.termsAccepted) return;

    setIsLoading(true);
    try {
      const res = await authService.register({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      confetti({
        particleCount: 160,
        spread: 80,
        origin: { y: 0.6 },
      });

      setAuth(res.user, res.tenant, res.accessToken, res.refreshToken);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erro ao criar conta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "name") return navigate("/auth");
    if (step === "email") return setStep("name");

    // voltando do passo de senha para e-mail, exige validar OTP novamente se necessário
    setOtpVerified(false);
    return setStep("email");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-blue-10)] via-white to-[var(--color-secondary-blue-10)]" />

      <HeaderCardsAuth
        variant="centered"
        onBack={handleBack}
        title="Money Legal"
        subTitle=""
        shake={useShake(emailExists)}
      >
        <p className="mt-2 text-center text-[15px] font-medium text-neutral-500">
          Crie sua conta em poucos passos.
        </p>

        <div className="mt-6 flex items-center justify-center gap-2">
          <StepDot active={step === "name"} />
          <div className="w-10 h-[2px] bg-neutral-200" />
          <StepDot active={step === "email"} />
          <div className="w-10 h-[2px] bg-neutral-200" />
          <StepDot active={step === "password"} />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-0 border-red-200 rounded-lg text-[15px] font-medium text-red-700 flex items-center justify-center gap-2">
            <XCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6">
          <AnimatePresence mode="wait">
            {step === "name" && (
              <motion.div {...fadeSlide} className="space-y-2">
                <Input
                  type="text"
                  placeholder="Nome completo"
                  value={data.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                  customRounded="rounded-xl"
                  customBorder="border-2 border-gray-200"
                  customBg="bg-white"
                  leftIcon={<User className="w-5 h-5" />}
                />

                <Actions
                  onNext={() => setStep("email")}
                  canNext={data.name.trim().length >= 3}
                  onBack={handleBack}
                />
              </motion.div>
            )}

            {step === "email" && (
              <motion.div {...fadeSlide} className="space-y-2">
                <Input
                  type="email"
                  placeholder="Seu e-mail"
                  value={data.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                  customRounded="rounded-xl"
                  customBorder="border-2 border-gray-200"
                  customBg="bg-white"
                  leftIcon={<Mail className="w-5 h-5" />}
                  rightIcon={emailChecking ? <Loader2 className="animate-spin" /> : undefined}
                  error={emailExists ? "E-mail já cadastrado." : undefined}
                  success={emailAvailable ? "E-mail disponível." : undefined}
                />

                {emailExists && (
                  <div className="rounded-2xl border border-neutral-200/70 bg-neutral-50 p-4">
                    <div className="text-sm font-semibold text-neutral-900">
                      Não é possível cadastrar este e-mail.
                    </div>
                    <div className="text-sm font-medium text-neutral-600 mt-1">
                      Encontramos uma conta associada a este e-mail. Faça login para continuar.
                    </div>
                    <div className="mt-3 flex justify-center">
                      <Button
                        type="button"
                        variant="outline"
                        tone="filledLight"
                        className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
                        rightIcon={<LogIn />}
                        onClick={() => navigate("/auth")}
                      >
                        Acessar Conta
                      </Button>
                    </div>
                  </div>
                )}

                <Actions
                  onNext={goToRegisterOtp}
                  canNext={emailAvailable && !isLoading}
                  onBack={handleBack}
                />
              </motion.div>
            )}

            {step === "password" && (
              <motion.div {...fadeSlide} className="space-y-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  value={data.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  required
                  customRounded="rounded-xl"
                  customBorder="border-2 border-gray-200"
                  customBg="bg-white"
                  leftIcon={<Lock className="w-5 h-5" />}
                  rightIcon={
                    <button type="button" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  }
                />

                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar senha"
                  value={data.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                  required
                  customRounded="rounded-xl"
                  customBorder="border-2 border-gray-200"
                  customBg="bg-white"
                  leftIcon={<Lock className="w-5 h-5" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)} // ✅ corrigido
                    >
                      {showConfirmPassword ? <EyeOff /> : <Eye />}
                    </button>
                  }
                />

                <div className="p-3 bg-neutral-50 rounded-xl border">
                  {passwordRequirements.map((r) => (
                    <div key={r.label} className="flex items-center gap-2 text-xs">
                      {r.met ? (
                        <CheckCircle className="w-4 h-4 text-success-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-neutral-400" />
                      )}
                      <span>{r.label}</span>
                    </div>
                  ))}
                </div>

                <label className="flex gap-3 pt-2 text-sm text-neutral-600">
                  <input
                    type="checkbox"
                    checked={data.termsAccepted}
                    onChange={(e) => handleChange("termsAccepted", e.target.checked)}
                    required
                    className="mt-1 w-4 h-4 rounded border-neutral-300 text-brand-primary-600 focus:ring-brand-primary-500"
                  />
                  <span className="text-sm text-neutral-600 leading-tight">
                    Estou de acordo com os{" "}
                    <Link
                      to="/terms"
                      className="font-medium text-[var(--color-primary-blue-100)] hover:text-[var(--color-secondary-blue-100)]"
                    >
                      Termos de Uso
                    </Link>{" "}
                    e a{" "}
                    <Link
                      to="/privacy"
                      className="font-medium text-[var(--color-primary-blue-100)] hover:text-[var(--color-secondary-blue-100)]"
                    >
                      Política de Privacidade
                    </Link>
                  </span>
                </label>

                <div className="pt-2 space-y-3 md:flex md:flex-col md:items-center">
                  <Button
                    type="button"
                    variant="outline"
                    tone="filledLight"
                    className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
                    onClick={handleSubmit}
                    disabled={!allPasswordOk || !data.termsAccepted || isLoading}
                    loading={isLoading}
                    rightIcon={<LogIn />}
                  >
                    Criar conta
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    tone="plain"
                    className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
                    onClick={() => setStep("email")}
                    leftIcon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Voltar
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </HeaderCardsAuth>
    </div>
  );
};

function StepDot({ active }: { active: boolean }) {
  return (
    <div
      className={`w-3 h-3 rounded-full ${active ? "bg-neutral-900" : "bg-neutral-300"}`}
    />
  );
}

function Actions({
  onNext,
  canNext,
  onBack,
}: {
  onNext: () => void;
  canNext: boolean;
  onBack: () => void;
}) {
  return (
    <div className="pt-2 space-y-3 md:flex md:flex-col md:items-center">
      <Button
        type="button"
        variant="outline"
        tone="filledLight"
        className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
        disabled={!canNext}
        onClick={onNext}
        rightIcon={<ArrowRight className="w-4 h-4" />}
      >
        Continuar
      </Button>

      <Button
        type="button"
        variant="outline"
        tone="plain"
        className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
        leftIcon={<ArrowLeft className="w-4 h-4" />}
        onClick={onBack}
      >
        Voltar
      </Button>
    </div>
  );
}

export default RegisterPage;
