import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../lib/utils/utils";
import {
  ArrowUpDown,
  BarChart3,
  BadgeCheck,
  TrendingDown,
  List, 
  Plus
} from "lucide-react";

type FabOption = {
  id: "transaction" | "budget" | "goal" | "timeline";
  label: string;
  description?: string;
  href: string;
  icon: React.ReactNode;
};

interface FabButtonProps {
  className?: string;
  fadeDelayMs?: number;
  fadedOpacity?: number;
}

export const FabButton: React.FC<FabButtonProps> = ({
  className,
  fadeDelayMs = 3000,
  fadedOpacity = 0.35,
}) => {
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [faded, setFaded] = useState(true);

  const [hoveringFab, setHoveringFab] = useState(false);
  const [pressingFab, setPressingFab] = useState(false);

  const timerRef = useRef<number | null>(null);

  const options: FabOption[] = useMemo(
    () => [
      {
        id: "transactions",
        label: "Lançamentos",
        description: "",
        href: "/transactions/new",
        icon: (
          <ArrowUpDown className="w-5 h-5" />
        ),
      },
      {
        id: "debts",
        label: "Dívidas",
        description: "",
        href: "/debts",
        icon: (
          <TrendingDown  className="w-5 h-5" />
        ),
      },
      {
        id: "budget",
        label: "Orçamentos",
        description: "",
        href: "/budgets/new",
        icon: (
            <BarChart3 className="w-5 h-5" />
        ),
      },
      {
        id: "goal",
        label: "Metas",
        description: "",
        href: "/goals/new",
        icon: (
          <BadgeCheck className="w-5 h-5" />
        ),
      },
      {
        id: "timeline",
        label: "Timeline",
        description: "",
        href: "/timeline",
        icon: (
          <List className="w-5 h-5" />
        ),
      },
    ],
    []
  );

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const scheduleFade = () => {
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      if (!open && !hoveringFab && !pressingFab) setFaded(true);
    }, fadeDelayMs);
  };

  const bumpActivity = () => {
    setFaded(false);
    scheduleFade();
  };

  useEffect(() => {
    const onAnyActivity = () => bumpActivity();

    window.addEventListener("scroll", onAnyActivity, { passive: true });
    window.addEventListener("pointermove", onAnyActivity, { passive: true });
    window.addEventListener("pointerdown", onAnyActivity);
    window.addEventListener("keydown", onAnyActivity);
    window.addEventListener("touchstart", onAnyActivity, { passive: true });

    scheduleFade();

    return () => {
      clearTimer();
      window.removeEventListener("scroll", onAnyActivity as any);
      window.removeEventListener("pointermove", onAnyActivity as any);
      window.removeEventListener("pointerdown", onAnyActivity as any);
      window.removeEventListener("keydown", onAnyActivity as any);
      window.removeEventListener("touchstart", onAnyActivity as any);
    };
  }, [fadeDelayMs, open, hoveringFab, pressingFab]);

  useEffect(() => {
    if (open) {
      setFaded(false);
      clearTimer();
    } else {
      scheduleFade();
    }
  }, [open]);

  const handleToggle = () => {
    bumpActivity();
    setOpen((v) => !v);
  };

  const handleNavigate = (href: string) => {
    bumpActivity();
    setOpen(false);
    navigate(href);
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-[1200] bg-black/35 backdrop-blur-[2px]"
          onMouseDown={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={cn("fixed z-[1300] right-5 bottom-24 lg:bottom-6", className)}>
        {open && (
          <div className="absolute right-0 bottom-[72px] w-64 rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden">

            <div className="p-2">
              {options.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleNavigate(opt.href)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                             hover:bg-[var(--color-primary-blue-10)] hover:text-primary
                             hover:animate-[ml-pulse_1.6s_ease-in-out_infinite]"
                >
                  <span className="w-9 h-9 rounded-xl flex items-center justify-center">
                    {opt.icon}
                  </span>
                  <span className="flex-1 text-left">
                    <div>{opt.label}</div>
                    <div className="text-xs text-neutral-500">{opt.description}</div>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 🔥 FAB COM PULSAÇÃO FORTE */}
        <button
          type="button"
          onClick={handleToggle}
          onMouseEnter={() => {
            setHoveringFab(true);
            bumpActivity();
          }}
          onMouseLeave={() => {
            setHoveringFab(false);
            scheduleFade();
          }}
          onPointerDown={() => setPressingFab(true)}
          onPointerUp={() => setPressingFab(false)}
          className={cn(
            "w-14 h-14 rounded-2xl",
            "bg-[var(--color-primary-blue-100)] text-white",
            "hover:bg-[var(--color-primary-blue-90)]",
            "transition-all duration-200",
            "active:scale-[0.97]",
            // 🔥 PULSAÇÃO MAIS EVIDENTE
            "hover:animate-[fab-pulse_1.4s_ease-in-out_infinite]",
            open && "ring-4 ring-[var(--color-primary-blue-10)]"
          )}
          style={{ opacity: faded ? fadedOpacity : 1 }}
        >
          <Plus className={cn("w-6 h-6 mx-auto transition-transform", open && "rotate-45")}/>
        </button>
      </div>
    </>
  );
};
