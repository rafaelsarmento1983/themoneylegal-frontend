import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  XCircle,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  LogIn,
  Rocket,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/authService";
import logo from "@/assets/logo.png";
import { toastError } from "@/lib/toast";
import { useShake } from "@/hooks/useShake";
import { useLocation } from "react-router-dom";

// ✅ Hook reutilizável
import { useEmailCheck } from "@/hooks/useEmailCheck";
import { HeaderCardsAuth } from "@/components/ui/HeaderCardsAuth";

type LoginStep = "email" | "password";

const ease = [0.16, 1, 0.3, 1] as const;

const pageSwap = {
  initial: { opacity: 0, scale: 0.985, filter: "blur(6px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)", transition: { duration: 0.55, ease } },
  exit: { opacity: 0, scale: 0.99, filter: "blur(6px)", transition: { duration: 0.28, ease } },
};

const fadeSlide = {
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease } },
  exit: { opacity: 0, y: -10, filter: "blur(6px)", transition: { duration: 0.28, ease } },
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const type = (location.state as any)?.type;
  const routeSuccess =
    (location.state as any)?.type === "success"
      ? (location.state as any)?.message
      : null;

  const [flashSuccess, setFlashSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (routeSuccess) {
      setFlashSuccess(routeSuccess);

      // opcional: evita reaparecer se der refresh/back
      window.history.replaceState({}, document.title);
    }
  }, [routeSuccess]);

  const { setAuth, isAuthenticated } = useAuthStore();

  const [shake, setShake] = useState(false);

  const [loginStep, setLoginStep] = useState<LoginStep>("email");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Redirect se já autenticado
  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, navigate]);

  const emailValid = useMemo(() => isValidEmail(formData.email), [formData.email]);

  /**
   * ✅ Mantém habilitado em toda a página /login (independente do step),
   * evitando reset do status ao trocar de step.
   */
  const emailCheck = useEmailCheck({
    email: formData.email,
    enabled: true,
    debounceMs: 500,
    isValidEmail,
    checkEmailAvailability: (email) => authService.checkEmailAvailability(email),

    invalidEmailMessage: "Digite um e-mail válido para localizar sua conta.",
    checkingMessage: "Procurando sua conta...",
    errorMessage: "Não foi possível verificar agora. Tente novamente.",
    dedupeNotify: true,
  });

  // Semântica do endpoint:
  // - exists => conta encontrada
  // - available => NÃO encontrado
  const emailExists = emailCheck.status === "exists";
  const emailNotFound = emailCheck.status === "available";
  const emailChecking = emailCheck.status === "checking";
  const emailErrored = emailCheck.status === "error";

  const canContinueEmail = emailValid && emailExists;

  const canSubmit = useMemo(
    () => emailValid && formData.password.length >= 6,
    [emailValid, formData.password]
  );

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (loginError) setLoginError(null);

    if (field === "email") {
      setFlashSuccess(null);
      emailCheck.reset();
      setFormData((prev) => ({ ...prev, password: "" }));
      setLoginStep("email");
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    setLoginError(null);

    if (!emailValid) {
      setLoginStep("email");
      setLoginError("Digite um e-mail válido.");
      return;
    }

    if (!emailExists) {
      setLoginStep("email");
      setLoginError("Email não encontrado.");
      return;
    }

    if (formData.password.length < 6) {
      setLoginStep("password");
      setLoginError("Senha muito curta.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      setAuth(response.user, response.defaultTenant, response.accessToken, response.refreshToken);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {

      const message =
        err?.response?.data?.message ||
        "Não foi possível entrar. Verifique seus dados e tente novamente.";

      setLoginError(message);

      /*toastError({
        id: "login-error",
        title: "Falha no login",
        description: message,
      });*/
    } finally {
      setIsLoading(false);
    }
  };

  const emailInputVariant = useMemo(() => {
    if (!formData.email.trim()) return "default";
    if (!emailValid) return "default";
    if (emailExists) return "success";
    if (emailNotFound || emailErrored) return "error";
    return "default";
  }, [formData.email, emailValid, emailExists, emailNotFound, emailErrored]);

  const emailHint = useMemo(() => {
    if (!formData.email.trim()) return "Digite seu e-mail para localizar sua conta.";
    if (!emailValid) return emailCheck.message || "Digite um e-mail válido para localizar sua conta.";
    if (emailChecking) return "Procurando sua conta...";
    if (emailExists) return "Conta encontrada. Continue para sua senha.";
    if (emailNotFound) return "Email não encontrado. Você pode criar uma conta agora.";
    if (emailErrored) return "Não foi possível verificar agora. Você pode tentar novamente.";
    return "";
  }, [formData.email, emailValid, emailCheck.message, emailChecking, emailExists, emailNotFound, emailErrored]);

  const emailRightIcon = useMemo(() => {
    if (emailChecking) return <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />;
    if (emailNotFound) return <XCircle className="w-5 h-5 text-danger-500" />;
    return null;
  }, [emailChecking, emailNotFound]);

  const emailSuccess = flashSuccess || (emailExists ? emailHint : undefined);

  return (
    <div className="min-h-screen w-full bg-white overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key="login" {...pageSwap} className="min-h-screen w-full">
          <div className="min-h-screen w-full flex items-center justify-center p-6 bg-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-blue-10)] via-white to-[var(--color-secondary-blue-10)]" />

            <HeaderCardsAuth
              variant="centered"
              shake={useShake(emailNotFound || emailErrored || loginError)}>

              <p className="mt-2 text-center text-[15px] font-medium text-neutral-500">
                Digite o e-mail cadastrado para localizar sua conta.
              </p>

              <div className="mt-6 flex items-center justify-center gap-2">
                <StepDot active={loginStep === "email"} done={canContinueEmail} />
                <div className="w-10 h-[2px] bg-neutral-200" />
                <StepDot active={loginStep === "password"} done={canSubmit} />
              </div>

              <form onSubmit={handleSubmit} className="mt-6">
                <AnimatePresence mode="wait">
                  {loginStep === "email" && (
                    <motion.div key="emailStep" {...fadeSlide} className="space-y-4">
                      <Input
                        type="email"
                        placeholder="Seu e-mail"
                        value={formData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        required
                        disabled={isLoading}
                        customRounded="rounded-xl"
                        customBorder="border-2 border-gray-200"
                        customBg="bg-white"
                        leftIcon={<Mail className="w-5 h-5" />}
                        variant={emailInputVariant as any}
                        success={emailSuccess}
                        error={emailNotFound ? "Email não encontrado." : undefined}
                        rightIcon={emailRightIcon}
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
                          disabled={!canContinueEmail || isLoading || emailChecking}
                          onClick={() => setLoginStep("password")}
                          rightIcon={<ArrowRight className="w-4 h-4" />}
                        >
                          Continuar
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          tone="plain"
                          className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
                          onClick={() => navigate("/auth")}
                          disabled={isLoading}
                          leftIcon={<ArrowLeft className="w-4 h-4" />}
                        >
                          Voltar
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {loginStep === "password" && (
                    <motion.div key="passStep" {...fadeSlide} className="space-y-4">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Senha"
                        value={formData.password}
                        onChange={(e) => handleChange("password", e.target.value)}
                        required
                        disabled={isLoading}
                        customRounded="rounded-xl"
                        customBorder="border-2 border-gray-200"
                        customBg="bg-white"
                        leftIcon={<Lock className="w-5 h-5" />}
                        error={loginError || undefined}
                        rightIcon={
                          <div className="flex items-center gap-2">
                            {loginError && <XCircle className="w-5 h-5 text-danger-500" />}
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="text-neutral-400 hover:text-neutral-600 transition-colors"
                              tabIndex={-1}
                            >
                              {showPassword ? (
                                <EyeOff className="w-5 h-5" />
                              ) : (
                                <Eye className="w-5 h-5" />
                              )}
                            </button>
                          </div>
                        }
                      />

                      <div className="pt-2 space-y-3 md:flex md:flex-col md:items-center">
                        <Button
                          type="submit"
                          variant="outline"
                          tone="filledLight"
                          className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
                          loading={isLoading}
                          disabled={!canSubmit || isLoading}
                          rightIcon={<LogIn className="w-4 h-4" />}
                        >
                          {isLoading ? "Entrando..." : "Entrar"}
                        </Button>

                        <Button
                          type="button"
                          variant="outline"
                          tone="plain"
                          className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
                          onClick={() => {
                            setFormData((p) => ({ ...p, password: "" }));
                            setLoginError(null);
                            setLoginStep("email");
                          }}
                          disabled={isLoading}
                          leftIcon={<ArrowLeft className="w-4 h-4" />}
                        >
                          Voltar
                        </Button>

                        <div className="mt-3 text-center">
                          <Link
                            to="/forgot-password"
                            state={{ email: formData.email }}
                            className="text-sm font-medium text-color-secondary-blue-100"
                          >
                            Esqueceu a senha?
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </HeaderCardsAuth>
          </div>
        </motion.div >
      </AnimatePresence >
    </div >
  );
};

function StepDot({ active, done }: { active: boolean; done: boolean }) {
  const className = [
    "w-3 h-3 rounded-full transition-all",
    done ? "bg-success-500" : active ? "bg-neutral-900" : "bg-neutral-300",
  ].join(" ");

  return <div className={className} />;
}

export default LoginPage;
