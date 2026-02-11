import React from "react";
import { XCircle, CheckCircle, AlertCircle } from "lucide-react";

type ToastVariant = "error" | "success" | "warning";

type ToastAction = {
  label: string;
  onClick: () => void;
};

type ToastCardProps = {
  variant: ToastVariant;
  title: string;
  description?: string;
  onClose?: () => void;

  // ✅ NOVO (opcional): botão/ação no toast
  action?: ToastAction;
};

const variantStyles: Record<
  ToastVariant,
  { wrap: string; icon: React.ReactNode; title: string; desc: string; actionBtn: string }
> = {
  error: {
    wrap: "border-danger-200 bg-danger-50",
    icon: <XCircle className="w-5 h-5 text-danger-600 flex-shrink-0 mt-0.5" />,
    title: "text-danger-800",
    desc: "text-danger-700",
    actionBtn: "text-danger-800 hover:text-danger-900",
  },
  success: {
    wrap: "border-success-200 bg-success-50",
    icon: <CheckCircle className="w-5 h-5 text-success-600 flex-shrink-0 mt-0.5" />,
    title: "text-success-800",
    desc: "text-success-700",
    actionBtn: "text-success-800 hover:text-success-900",
  },
  warning: {
    wrap: "border-warning-200 bg-warning-50",
    icon: <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />,
    title: "text-warning-800",
    desc: "text-warning-700",
    actionBtn: "text-warning-800 hover:text-warning-900",
  },
};

export const ToastCard: React.FC<ToastCardProps> = ({
  variant,
  title,
  description,
  onClose,
  action,
}) => {
  const v = variantStyles[variant];

  return (
    <div
      className={[
        "toast-card",
        "flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-2xl",
        "bg-white",
        v.wrap,
      ].join(" ")}
    >
      {v.icon}

      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold leading-tight ${v.title}`}>{title}</p>

        {description && <p className={`text-sm leading-snug ${v.desc}`}>{description}</p>}

        {/* ✅ NOVO: ação opcional */}
        {action && (
          <button
            type="button"
            onClick={() => {
              action.onClick();
              // fecha o toast depois de clicar (se existir onClose)
              onClose?.();
            }}
            className={[
              "mt-2 inline-flex items-center",
              "text-sm font-semibold",
              "underline underline-offset-2",
              v.actionBtn,
            ].join(" ")}
          >
            {action.label}
          </button>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="ml-2 text-neutral-500/70 hover:text-neutral-900"
          aria-label="Fechar"
        >
          ✕
        </button>
      )}
    </div>
  );
};
