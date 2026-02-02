// src/components/HeaderCardsAuth.tsx
import { ArrowLeft } from "lucide-react";
import logo from "../../assets/logo.png";
import { motion } from "framer-motion";

type HeaderVariant = "default" | "centered";

type HeaderCardsAuthProps = {
  variant?: HeaderVariant;
  onBack?: () => void;
  children?: React.ReactNode;
  shake?: boolean;
};

const shakeAnimation = {
  shake: {
    x: [-8, 8, -6, 6, -4, 4, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

export function HeaderCardsAuth({
  variant = "default",
  onBack,
  children,
  shake = false,
}: HeaderCardsAuthProps) {
  return (
    <motion.div
      className="relative z-10 w-full max-w-[520px] rounded-[28px] bg-white shadow-2xl border border-neutral-200/70"
      variants={shakeAnimation}
      animate={shake ? "shake" : undefined}
    >
      <div className="px-8 sm:px-12 pb-10">
        {/* HEADER */}
        {variant === "centered" ? (
          <div className="pt-2">
            <div className="flex justify-center">
              <img src={logo} alt="Logo" className="w-24 h-24 object-contain" />
            </div>

            <h1 className="mt-0 text-center text-3xl sm:text-[34px] font-extrabold text-neutral-900">
              Money Legal
            </h1>
          </div>
        ) : (
          <div className="pt-2">
            <div className="flex items-center justify-between">
              <div className="w-[140px]">
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full md:!w-auto md:!px-8 md:min-w-[220px] flex items-center gap-2 text-sm"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Voltar</span>
                </button>
              </div>

              <div className="flex items-center justify-end gap-3">
                <img src={logo} alt="Logo" className="w-16 h-16 object-contain" />
              </div>
            </div>
          </div>
        )}

        {/* CONTEÚDO */}
        {children}
      </div>
    </motion.div>
  );
}
