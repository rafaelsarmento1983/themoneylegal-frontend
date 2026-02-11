import React, { ReactNode, SelectHTMLAttributes } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils/utils";

export type SelectOption = {
    value: string;
    label: string;
    icon?: ReactNode;
    disabled?: boolean;
};

export interface SelectProps
    extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
    label?: string;
    required?: boolean;

    error?: string;
    success?: string;
    hint?: string;

    leftIcon?: ReactNode;
    leftIconClassName?: string;

    // customizações parecidas com Input
    customBg?: string;
    customBorder?: string;
    customRounded?: string;

    containerClassName?: string;
    labelClassName?: string;

    // opções (opcional). Se passar, não precisa escrever <option> manual
    options?: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    (
        {
            className,
            label,
            required,
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

            options,
            children,
            disabled,
            ...props
        },
        ref
    ) => {
        const hasError = Boolean(error);
        const hasSuccess = Boolean(success) && !hasError;

        return (
            <div className={cn("w-full", containerClassName)}>
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
                    {/* LEFT ICON */}
                    {leftIcon && (
                        <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none">
                            <span className={cn("text-neutral-400", leftIconClassName)}>
                                {leftIcon}
                            </span>
                        </div>
                    )}

                    <select
                        ref={ref}
                        disabled={disabled}
                        className={cn(
                            "w-full h-12 px-4 font-medium text-neutral-900 transition-all duration-200",
                            "focus:outline-none focus:ring-4 focus:ring-brand-primary-100",
                            "disabled:opacity-50 disabled:cursor-not-allowed",

                            // padding dinâmico igual Input
                            leftIcon ? "pl-10" : "",
                            rightIcon ? "pr-10" : "",

                            customBg,
                            customBorder,
                            customRounded,

                            className
                        )}
                        {...props}
                    >
                        {options?.length
                            ? options.map((opt) => (
                                <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                                    {opt.label}
                                </option>
                            ))
                            : children}
                    </select>

                    {/* RIGHT ICON ⭐ NOVO */}
                    {rightIcon && (
                        <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3 pointer-events-none">
                            <span className={cn("text-neutral-400", rightIconClassName)}>
                                {rightIcon}
                            </span>
                        </div>
                    )}
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
    }
);

Select.displayName = "Select";
