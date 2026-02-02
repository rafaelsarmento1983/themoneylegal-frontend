import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, Rocket } from "lucide-react";

import { Button } from "@/components/ui/Button";
import logo from "@/assets/logo.png";

const ease = [0.16, 1, 0.3, 1] as const;

const fadeSlide = {
  initial: { opacity: 0, y: 16, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.55, ease } },
  exit: { opacity: 0, y: -10, filter: "blur(6px)", transition: { duration: 0.28, ease } },
};

export const ChoicePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6 py-10 relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-primary-blue-10)] via-white to-[var(--color-secondary-blue-10)]" />

      <div className="relative z-10 w-full max-w-[560px]">
        <motion.div
          {...fadeSlide}
          className="rounded-[28px] bg-white shadow-2xl border border-neutral-200/70 px-8 sm:px-10 py-10"
        >
          <div className="flex justify-center">
            <img src={logo} alt="Logo" className="w-24 h-24 object-contain" />
          </div>

          <h1 className="mt-0 text-center text-3xl sm:text-[34px] font-extrabold text-neutral-900">
            Money Legal
          </h1>

          <p className="mt-2 text-center text-[15px] font-medium text-neutral-600">
            Se for novo por aqui, clique em Comece Agora e crie sua conta de acesso.
          </p>

          <div className="mt-8 space-y-3 md:flex md:flex-col md:items-center">
            <Button
              variant="outline"
              tone="filledLight"
              className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
              onClick={() => navigate("/register")}
              rightIcon={<Rocket className="w-4 h-4" />}
            >
              Comece Agora
            </Button>


            <Button
              variant="outline"
              tone="plain"
              className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
              onClick={() => navigate("/login")}
              rightIcon={<LogIn className="w-4 h-4" />}
            >
              Já tenho conta
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ChoicePage;
