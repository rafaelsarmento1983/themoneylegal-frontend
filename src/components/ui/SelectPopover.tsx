import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils/utils";

export type SelectOption = {
  value: string;
  label: string;
  icon?: ReactNode | string; // ✅ Lucide ou Emoji
  disabled?: boolean;
};

export type SelectPopoverProps = {
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;

  label?: string;
  placeholder?: string;

  options: SelectOption[];

  error?: string;
  success?: string;
  hint?: string;

  leftIcon?: ReactNode;
  rightIcon?: ReactNode; // se não passar, usa ChevronDown
  leftIconClassName?: string;
  rightIconClassName?: string;

  customBg?: string;
  customBorder?: string;
  customRounded?: string;

  containerClassName?: string;
  labelClassName?: string;

  dropdownClassName?: string;
};

const renderIcon = (ic?: ReactNode | string) => {
  if (!ic) return null;
  if (typeof ic === "string") return <span className="text-base leading-none">{ic}</span>;
  return ic;
};

export const SelectPopover: React.FC<SelectPopoverProps> = ({
  name,
  value,
  onChange,
  onBlur,
  disabled,
  required,

  label,
  placeholder = "Selecione",

  options,

  error,
  success,
  hint,

  leftIcon,
  rightIcon,
  leftIconClassName,
  rightIconClassName,

  customBg = "bg-white",
  customBorder = "border-2 border-gray-200",
  customRounded = "rounded-xl",

  containerClassName,
  labelClassName,
  dropdownClassName,
}) => {
  const hasError = Boolean(error);
  const hasSuccess = Boolean(success) && !hasError;

  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value]
  );

  const enabledOptions = useMemo(
    () => options.filter((o) => !o.disabled),
    [options]
  );

  const close = () => {
    setOpen(false);
    setActiveIndex(-1);
    onBlur?.();
  };

  const toggle = () => {
    if (disabled) return;
    setOpen((v) => !v);
  };

  // click fora
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const el = rootRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) close();
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  // teclado
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => {
          const max = enabledOptions.length - 1;
          const next = prev < 0 ? 0 : Math.min(prev + 1, max);
          return next;
        });
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) => {
          const next = prev <= 0 ? 0 : Math.max(prev - 1, 0);
          return next;
        });
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        const pick = enabledOptions[activeIndex];
        if (pick) {
          onChange?.(pick.value);
          close();
          queueMicrotask(() => buttonRef.current?.focus());
        }
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, activeIndex, enabledOptions, onChange]);

  // quando abrir, seta índice inicial
  useEffect(() => {
    if (!open) return;
    const idx = enabledOptions.findIndex((o) => o.value === value);
    setActiveIndex(idx >= 0 ? idx : 0);
  }, [open, enabledOptions, value]);

  const modalSwap = {
    initial: { opacity: 0, y: 6, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.16 } },
    exit: { opacity: 0, y: 6, scale: 0.99, transition: { duration: 0.12 } },
  };

  const displayLabel = selected?.label ?? "";

  return (
    <div className={cn("w-full", containerClassName)} ref={rootRef}>
      {label && (
        <label
          className={cn(
            "block text-sm font-semibold text-neutral-700 mb-2",
            labelClassName
          )}
        >
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none">
            <span className={cn("text-neutral-400", leftIconClassName)}>
              {leftIcon}
            </span>
          </div>
        )}

        {/* Button styled like Input */}
        <button
          ref={buttonRef}
          type="button"
          name={name}
          disabled={disabled}
          onClick={toggle}
          className={cn(
            "w-full h-12 px-4 font-medium text-neutral-900 transition-all duration-200 text-left",
            "focus:outline-none focus:ring-2 focus:ring-brand-primary-100",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "flex items-center gap-2 whitespace-nowrap", // ✅ fix layout
            leftIcon ? "pl-10" : "",
            "pr-10",
            customBg,
            customBorder,
            customRounded
          )}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {/* ícone selecionado (opcional) */}
          {selected?.icon ? (
            <span className="text-neutral-500 flex-shrink-0">
              {renderIcon(selected.icon)}
            </span>
          ) : null}

          {/* label truncado (✅ evita quebrar e invadir success/erro) */}
          <span className={cn("min-w-0 flex-1 truncate", !displayLabel ? "text-neutral-400" : "")}>
            {displayLabel || placeholder}
          </span>
        </button>

        {/* Right icon */}
        <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3 pointer-events-none">
          <span className={cn("text-neutral-400", rightIconClassName)}>
            {rightIcon ?? <ChevronDown className="w-4 h-4" />}
          </span>
        </div>

        {/* Dropdown */}
        <AnimatePresence>
          {open && (
            <motion.div
              {...modalSwap}
              className={cn(
                "absolute z-[60] mt-2 w-full rounded-xl bg-white shadow-xl border border-neutral-200 overflow-hidden",
                dropdownClassName
              )}
              role="listbox"
            >
              <div className="max-h-72 overflow-auto">
                {options.map((opt) => {
                  const isSelected = opt.value === value;
                  const enabledIndex = enabledOptions.findIndex((o) => o.value === opt.value);
                  const isActive = enabledIndex >= 0 && enabledIndex === activeIndex;

                  return (
                    <button
                      key={opt.value}
                      type="button"
                      disabled={opt.disabled}
                      onMouseEnter={() => {
                        if (opt.disabled) return;
                        setActiveIndex(enabledIndex);
                      }}
                      onClick={() => {
                        if (opt.disabled) return;
                        onChange?.(opt.value);
                        close();
                        queueMicrotask(() => buttonRef.current?.focus());
                      }}
                      className={cn(
                        "w-full px-4 py-3 text-left text-sm flex items-center gap-2",
                        opt.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-neutral-100",
                        isActive && !opt.disabled ? "bg-neutral-100" : "",
                        isSelected ? "font-semibold text-neutral-900" : "text-neutral-700"
                      )}
                    >
                      {opt.icon ? (
                        <span className="text-neutral-500 flex-shrink-0">
                          {renderIcon(opt.icon)}
                        </span>
                      ) : null}
                      <span className="flex-1">{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-neutral-500" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-1.5 min-h-[20px]">
        {hasError && (
          <p className="text-sm text-danger-600 flex items-center gap-1.5 animate-slide-in-down">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </p>
        )}

        {!hasError && hasSuccess && (
          <p className="text-sm text-success-600 flex items-center gap-1.5 animate-slide-in-down">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            {success}
          </p>
        )}

        {!hasError && !hasSuccess && hint && (
          <p className="text-sm text-neutral-500">{hint}</p>
        )}
      </div>
    </div>
  );
};
