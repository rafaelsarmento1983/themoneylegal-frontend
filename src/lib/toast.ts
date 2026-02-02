import React from "react";
import { toast } from "sonner";
import { ToastCard } from "../components/ui/ToastCard";

type ToastOptions = {
  title: string;
  description?: string;
  id?: string;
  duration?: number;
};

const show = (variant: "error" | "success" | "warning", opts: ToastOptions) => {
  toast.custom(
    (t) =>
      React.createElement(ToastCard, {
        variant,
        title: opts.title,
        description: opts.description,
        onClose: () => toast.dismiss(t),
      }),
    {
      id: opts.id,
      duration: opts.duration ?? (variant === "error" ? 4000 : 3000),
    }
  );
};

export const toastError = (opts: ToastOptions) => show("error", opts);
export const toastSuccess = (opts: ToastOptions) => show("success", opts);
export const toastWarning = (opts: ToastOptions) => show("warning", opts);
