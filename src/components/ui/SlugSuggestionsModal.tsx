import React, { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/Button";

type Props = {
  open: boolean;
  suggestions: string[];
  onClose: () => void;
  onPick: (slug: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;

  // opcional (se você já usa no componente)
  title?: string;
  subtitle?: string;
};

export const SlugSuggestionsModal: React.FC<Props> = ({
  open,
  suggestions,
  onClose,
  onPick,
  onRefresh,
  refreshing,
  title = "Sugestões de slug",
  subtitle = "Escolha uma opção ou gere novas sugestões.",
}) => {
  // ESC fecha
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // Mantém o mesmo “swap” (leve pop/scale + blur)
  const modalSwap = useMemo(
    () => ({
      initial: { opacity: 0, y: 8, scale: 0.985, filter: "blur(6px)" },
      animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
      },
      exit: {
        opacity: 0,
        y: 8,
        scale: 0.99,
        filter: "blur(6px)",
        transition: { duration: 0.16, ease: [0.16, 1, 0.3, 1] },
      },
    }),
    []
  );

  const ui = (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />

          <motion.div
            {...modalSwap}
            className="relative z-10 w-full max-w-[560px] rounded-xl bg-white shadow-2xl border border-neutral-200 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
                <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 hover:bg-neutral-100 transition"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-2">
              {suggestions.map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant="outline"
                  tone="plain"
                  className="w-full px-4 py-3 text-left justify-start font-mono"
                  onClick={() => onPick(s)}
                >
                  {s}
                </Button>
              ))}
            </div>

            {onRefresh && (
              <div className="mt-4 space-y-3 md:flex md:flex-col md:items-center">
                <Button
                  type="button"
                  variant="outline"
                  tone="filledLight"
                  className="w-full md:!w-auto md:!px-8 md:min-w-[220px]"
                  disabled={!!refreshing}
                  rightIcon={<RefreshCcw className="w-4 h-4" />}
                  onClick={onRefresh}
                >
                  Novas sugestões
                </Button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ✅ Portal: garante full-screen “de verdade” independente do layout pai
  return createPortal(ui, document.body);
};
