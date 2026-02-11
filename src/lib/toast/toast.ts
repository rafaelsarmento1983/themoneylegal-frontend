import React from "react";
import { toast } from "sonner";
import { ToastCard } from "../../components/ui/ToastCard";

type ToastAction = {
  label: string;
  onClick: () => void;
};

type ToastOptions = {
  title: string;
  description?: string;
  id?: string;
  duration?: number;
  action?: ToastAction;
};

type ToastId = string | number;

// 🔒 só este será "infinito"
const STICKY_IDS = new Set(["session-expired"]);

// 1 ano em ms (compatível; “infinito” na prática)
const STICKY_DURATION_MS = 365 * 24 * 60 * 60 * 1000;

const resolveDuration = (variant: "error" | "success" | "warning", opts: ToastOptions) => {
  if (opts.id && STICKY_IDS.has(opts.id)) return STICKY_DURATION_MS;
  return opts.duration ?? (variant === "error" ? 4000 : 3000); // regra atual
};

const show = (variant: "error" | "success" | "warning", opts: ToastOptions) => {
  toast.custom(
    (t: ToastId) =>
      React.createElement(ToastCard, {
        variant,
        title: opts.title,
        description: opts.description,
        action: opts.action,
        // t é o ID do toast (string | number)
        onClose: () => toast.dismiss(opts.id ?? t),
      }),
    {
      id: opts.id,
      duration: resolveDuration(variant, opts),
    }
  );
};

export const toastDismiss = (id?: string) => {
  if (id) toast.dismiss(id);
  else toast.dismiss();
};

export const toastError = (opts: ToastOptions) => show("error", opts);
export const toastSuccess = (opts: ToastOptions) => show("success", opts);
export const toastWarning = (opts: ToastOptions) => show("warning", opts);
