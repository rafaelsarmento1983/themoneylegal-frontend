import React from "react";
import { ArrowLeft, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png";
import { logout } from "@/lib/auth/logout";
import { Button } from "@/components/ui/Button";

/**
 * Variantes possíveis do header
 */
type HeaderVariant = "centered" | "menu" | "basic";

type HeaderCardsAuthProps = {
  variant?: HeaderVariant;
  onBack?: () => void;
  children?: React.ReactNode;
  shake?: boolean;
  title?: string;
  subTitle?: string;
  maxWidth?: string;

  // ✅ NOVO: controla se aparece botão de logout
  showLogout?: boolean;
};

/**
 * Animação de "shake" para erro (OTP inválido, etc)
 */
const shakeAnimation = {
  shake: {
    x: [-8, 8, -6, 6, -4, 4, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

/**
 * Renderiza o header conforme a variante
 */
function renderHeader(
  variant: HeaderVariant,
  title: string,
  subTitle: string,
  onBack?: () => void,
  showLogout?: boolean
) {
  switch (variant) {
    case "centered":
      return (
        <div className="pt-2">
          <div className="flex justify-center">
            <img src={logo} alt="Logo" className="w-24 h-24 object-contain" />
          </div>

          <h1 className="mt-0 text-center text-3xl sm:text-[34px] font-extrabold text-neutral-900">
            {title}
          </h1>
          <p className="mt-2 text-center text-[15px] font-medium text-neutral-500">
            {subTitle}
          </p>
        </div>
      );

    case "menu":
      return (
        <div className="pt-2">
          <div className="relative w-full h-24">
            <img
              src={logo}
              alt="Logo"
              className="absolute left-1/2 -translate-x-1/2 w-24 h-24 object-contain"
            />
            {showLogout && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <Button
                  type="button"
                  variant="outline"
                  tone="plain"
                  className="md:!px-6 md:min-w-[110px]"
                  onClick={() => logout("manual")}
                  rightIcon={<LogOut className="w-4 h-4" />}
                >
                  Sair
                </Button>
              </div>
            )}
          </div>
          <h1 className="mt-0 text-center text-3xl sm:text-[34px] font-extrabold text-neutral-900">
            {title}
          </h1>
          <p className="mt-2 text-center text-[15px] font-medium text-neutral-500">
            {subTitle}
          </p>
        </div>
      );

    case "basic":
    default:
      return (
        <div className="pt-2 px-4 py-2">
          <h1 className="mt-0 text-center text-3xl sm:text-[34px] font-extrabold text-neutral-900">
            {title}
          </h1>
          <p className="mt-2 text-center text-[15px] font-medium text-neutral-500">
            {subTitle}
          </p>
        </div>
      );
  }
}

/**
 * Card com Header reutilizável para telas de Auth / Onboarding
 */
export function HeaderCardsAuth({
  variant = "basic",
  title = "Money Legal",
  subTitle = "A rede social que cuida da sua jornada financeira.",
  maxWidth = "max-w-[520px]",
  onBack,
  children,
  shake = false,
  showLogout = false, // ✅ default
}: HeaderCardsAuthProps) {
  return (
    <motion.div
      className={`
        relative z-10 w-full
        ${maxWidth}
        rounded-[28px]
        bg-white
        shadow-2xl
        border border-neutral-200/70
      `}
      variants={shakeAnimation}
      animate={shake ? "shake" : undefined}
    >
      <div className="px-8 sm:px-12 pb-10">
        {/* HEADER */}
        {renderHeader(variant, title, subTitle, onBack, showLogout)}

        {/* CONTEÚDO */}
        {children}
      </div>
    </motion.div>
  );
}
