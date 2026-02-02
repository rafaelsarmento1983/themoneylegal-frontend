// src/pages/auth/IntroPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, PanInfo } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/Button";
import logo from "@/assets/logo.png";

const ease = [0.16, 1, 0.3, 1] as const;

const slideVariants = {
  enter: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction > 0 ? 42 : -42,
    filter: "blur(10px)",
  }),
  center: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease },
  },
  exit: (direction: 1 | -1) => ({
    opacity: 0,
    x: direction > 0 ? -42 : 42,
    filter: "blur(10px)",
    transition: { duration: 0.32, ease },
  }),
};

type TrackPayload = Record<string, string | number | boolean | undefined>;
function track(event: string, payload: TrackPayload = {}) {
  if (import.meta?.env?.DEV) console.log(`[track] ${event}`, payload);

  // @ts-expect-error - optional global
  if (typeof window !== "undefined" && window.gtag) window.gtag("event", event, payload);
  // @ts-expect-error - optional global
  if (typeof window !== "undefined" && window.posthog?.capture) window.posthog.capture(event, payload);
  // @ts-expect-error - optional global
  if (typeof window !== "undefined" && window.analytics?.track) window.analytics.track(event, payload);
}

type Phase = "hero" | "transition";

export const IntroPage: React.FC = () => {
  const navigate = useNavigate();

  const benefits = useMemo(
    () => [
      {
        icon: "🚀",
        title: "Configuração rápida",
        description:
          "Tudo fácil e descomplicado! Comece a usar em poucos passos, de forma simples e rápida.",
      },
      {
        icon: "✨",
        title: "Gestão Inteligente",
        description:
          "Aprovar suas contas é tão fácil como curtir um post da sua rede social favorita.",
      },
      {
        icon: "🗂️",
        title: "Multiusuários de verdade",
        description:
          "Cada grupo roda de forma independente, sem causar problemas para os demais.",
      },
      {
        icon: "⚡",
        title: "Rápido e Eficiente",
        description:
          "Tudo responde com rapidez e eficiência, para uma melhor experiência do usuário.",
      },
      {
        icon: "🔒",
        title: "Privacidade e Segurança",
        description:
          "Sua privacidade é nossa prioridade. Proteção com criptografia de ponta a ponta.",
      },
    ],
    []
  );

  const total = benefits.length;
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  // ✅ Header controla fases hero/transition; Card só aparece depois do exit do header
  const [phase, setPhase] = useState<Phase>("hero");
  const [showHeader, setShowHeader] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const timersRef = useRef<number[]>([]);
  useEffect(() => {
    // HERO por 5s -> TRANSITION
    timersRef.current.push(window.setTimeout(() => setPhase("transition"), 5000));

    // Depois da transição, mandamos o header sair (exit).
    // O Card só vai aparecer no onExitComplete do header.
    timersRef.current.push(window.setTimeout(() => setShowHeader(false), 5000 + 900));

    return () => {
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  const isLast = step === total - 1;
  const current = benefits[step];

  const goTo = (nextStep: number, dir: 1 | -1) => {
    const clamped = Math.max(0, Math.min(total - 1, nextStep));
    if (clamped === step) return;

    setDirection(dir);
    setStep(clamped);

    track("onboarding_step_view", {
      step: clamped + 1,
      total,
      title: benefits[clamped]?.title ?? "",
      source: "nav",
    });
  };

  const next = () => {
    if (isLast) {
      track("onboarding_complete", { total, source: "button" });
      navigate("/auth", { replace: true });
      return;
    }
    goTo(step + 1, 1);
    track("onboarding_next", { step: step + 1, total });
  };

  const prev = () => {
    if (step === 0) return;
    goTo(step - 1, -1);
    track("onboarding_prev", { step: step, total });
  };

  const swipeThreshold = 9000;
  const onDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!showOnboarding) return;

    const swipePower = Math.abs(info.offset.x) * info.velocity.x;

    if (swipePower < -swipeThreshold) {
      if (isLast) return;
      goTo(step + 1, 1);
      track("onboarding_swipe_next", { step: step + 2, total });
      return;
    }

    if (swipePower > swipeThreshold) {
      if (step === 0) return;
      goTo(step - 1, -1);
      track("onboarding_swipe_prev", { step: step, total });
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!showOnboarding) return;

      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showOnboarding, step, isLast]);

  const logoVariants = {
    hero: { width: 96, height: 96, y: 0, opacity: 1, filter: "blur(0px)" },
    transition: {
      width: 56,
      height: 56,
      y: -18,
      opacity: 0,
      filter: "blur(10px)",
      transition: { duration: 0.35, ease },
    },
  } as const;

  const textVariants = {
    hero: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: {
      opacity: 0,
      y: -10,
      filter: "blur(8px)",
      transition: { duration: 0.35, ease },
    },
  } as const;

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Fundo Apple-like */}
      <div className="absolute inset-0">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-neutral-200/60 blur-3xl" />
        <div className="absolute top-10 -right-24 h-80 w-80 rounded-full bg-neutral-300/40 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-neutral-200/50 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-blue-10)] via-white to-[var(--color-secondary-blue-10)]" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-[520px]">
          {/* Header (sai do DOM antes do Card entrar) */}
          <AnimatePresence
            onExitComplete={() => {
              // ✅ Card só aparece depois do header terminar o exit => zero “pulo”
              setShowOnboarding(true);
            }}
          >
            {showHeader && (
              <motion.div
                key="header"
                initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} // ✅ sem pulsar
                exit={{ opacity: 0, y: -20, filter: "blur(12px)" }}
                transition={{ duration: 0.5, ease }}
                className="w-full"
              >
                <div className="w-full flex flex-col items-center text-center gap-3">
                  <motion.img
                    src={logo}
                    alt="Logo"
                    className="object-contain"
                    animate={logoVariants[phase]}
                    transition={{ duration: phase === "transition" ? 0.35 : 0.7, ease }}
                    style={{ willChange: "transform, width, height, opacity, filter" }}
                  />

                  <motion.div animate={textVariants[phase]} className="w-full">
                    <h1 className="mt-0 text-3xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight">
                      Money Legal
                    </h1>

                    <p className="text-xl text-neutral-600 mb-10 max-w-[60ch] mx-auto">
                      Junte-se a milhares de usuários que já transformaram a forma como cuidam do seu dinheiro.
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card (aparece por último, já na posição definitiva) */}
          <AnimatePresence>
            {showOnboarding && (
              <motion.div
                key="card"
                initial={{ opacity: 0, filter: "blur(10px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(10px)" }}
                transition={{ duration: 0.55, ease }}
                className="mt-0"
                style={{ willChange: "opacity, filter" }}
              >
                <div className="rounded-3xl border border-neutral-200/70 bg-white/70 backdrop-blur-xl shadow-[0_20px_60px_-35px_rgba(0,0,0,0.35)] p-8 sm:p-10 flex flex-col">
                  <AnimatePresence custom={direction} mode="wait">
                  <motion.div
                    key={step}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.12}
                    onDragEnd={onDragEnd}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <div className="flex flex-col items-center text-center" style={{ height: 260 }}>
                      <div className="text-6xl mb-5 select-none">{current.icon}</div>

                      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
                        {current.title}
                      </h1>

                      <p className="mt-4 text-lg text-neutral-600 max-w-[42ch]">
                        {current.description}
                      </p>

                      
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-10 flex flex-col items-center justify-center gap-6">
                  <div className="mt-8 flex justify-center gap-2">
                        {benefits.map((_, i) => (
                          <div
                            key={i}
                            className={`h-2 w-2 rounded-full transition ${i === step ? "bg-neutral-900" : "bg-neutral-300"
                              }`}
                          />
                        ))}
                      </div>
                  {!isLast ? (
                    <Button
                      variant="outline"
                      tone="filledLight"
                      className="w-fit min-w-[160px] sm:min-w-[260px] px-6 whitespace-nowrap"
                      onClick={() => next()}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Continuar
                    </Button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        boxShadow:
                          "0 18px 55px -28px var(--color-primary-blue-100), 0 0 0 6px var(--color-primary-blue-10)",
                      }}
                      transition={{ type: "spring", stiffness: 420, damping: 26, mass: 0.7 }}
                      className="rounded-lg"
                    >
                      <motion.div
                        animate={{
                          boxShadow:
                            "0 18px 55px -28px var(--color-primary-blue-100), 0 0 0 8px var(--color-primary-blue-10)",
                        }}
                        transition={{
                          duration: 1.2,
                          ease: "easeInOut",
                          repeat: Infinity,
                          repeatType: "mirror",
                        }}
                        className="rounded-lg"
                      >
                        <Button
                          variant="outline"
                          tone="filledLight"
                          className="w-fit min-w-[160px] sm:min-w-[260px] px-6 whitespace-nowrap"
                          onClick={() => {
                            track("onboarding_complete", { total, source: "button" });
                            navigate("/auth", { replace: true });
                          }}
                          rightIcon={<ArrowRight className="w-4 h-4" />}
                        >
                          Vamos lá!
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </div>
              </div>
              </motion.div>
            )}
        </AnimatePresence>
      </div>
    </div>
    </div >
  );
};

export default IntroPage;
