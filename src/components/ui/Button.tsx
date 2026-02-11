import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils/utils';
import { Loader2 } from "lucide-react";

/**
 * 🔘 Button Component v3.2
 * Botão moderno com múltiplas variantes e tamanhos
 *
 * ✅ tone:
 * - default     → comportamento padrão
 * - plain       → apenas pulsar no hover
 * - filled      → preenchido + pulsar + shadow no hover
 * - filledLight → preenchido + pulsar (SEM shadow no hover)
 */

const buttonVariants = cva(
  `
    inline-flex items-center justify-center gap-2
    font-medium rounded-lg
    transition-all duration-200
    focus-visible:outline-none focus-visible:ring-4
    disabled:pointer-events-none disabled:opacity-50
    select-none whitespace-nowrap
  `,
  {
    variants: {
      variant: {
        primary: `
          bg-gradient-to-r from-brand-primary-600 to-brand-primary-500
          text-white shadow-md hover:shadow-lg
          hover:from-brand-primary-700 hover:to-brand-primary-600
          active:from-brand-primary-800 active:to-brand-primary-700
          focus-visible:ring-brand-primary-200
        `,
        secondary: `
          bg-gradient-to-r from-brand-secondary-600 to-brand-secondary-500
          text-white shadow-md hover:shadow-lg
          hover:from-brand-secondary-700 hover:to-brand-secondary-600
          active:from-brand-secondary-800 active:to-brand-secondary-700
          focus-visible:ring-brand-secondary-200
        `,
        outline: `
          border-2 border-neutral-300 bg-transparent
          text-neutral-700 hover:bg-neutral-50
          hover:border-neutral-400 active:bg-neutral-100
          focus-visible:ring-neutral-200
        `,
        ghost: `
          bg-transparent text-neutral-700
          hover:bg-neutral-100 active:bg-neutral-200
          focus-visible:ring-neutral-200
        `,
        danger: `
          bg-gradient-to-r from-danger-600 to-danger-500
          text-white shadow-md hover:shadow-lg
          hover:from-danger-700 hover:to-danger-600
          active:from-danger-800 active:to-danger-700
          focus-visible:ring-danger-200
        `,
        success: `
          bg-gradient-to-r from-success-600 to-success-500
          text-white shadow-md hover:shadow-lg
          hover:from-success-700 hover:to-success-600
          active:from-success-800 active:to-success-700
          focus-visible:ring-success-200
        `,
        link: `
          text-brand-primary-600 underline-offset-4
          hover:underline hover:text-brand-primary-700
          active:text-brand-primary-800
          focus-visible:ring-brand-primary-200
        `,
      },

      // 🎯 Sub-variants de comportamento
      tone: {
        default: '',

        // apenas pulsar
        plain: `
          hover:animate-[ml-pulse_1.6s_ease-in-out_infinite]
        `,

        // preenchido + pulsar + shadow
        filled: `
          border-0
          bg-[var(--color-primary-blue-100)] text-white
          hover:bg-[var(--color-primary-blue-90)] hover:text-white
          shadow-md hover:shadow-lg
          hover:animate-[ml-pulse_1.6s_ease-in-out_infinite]
        `,

        // preenchido + pulsar (SEM shadow)
        filledLight: `
          border-0
          bg-[var(--color-primary-blue-100)] text-white
          hover:bg-[var(--color-primary-blue-90)] hover:text-white
          hover:animate-[ml-pulse_1.6s_ease-in-out_infinite]
        `,
      },

      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5 text-base',
        lg: 'h-12 px-6 text-lg',
        xl: 'h-14 px-8 text-xl',
        icon: 'h-11 w-11',
      },

      rounded: {
        default: 'rounded-lg',
        full: 'rounded-full',
        none: 'rounded-none',
      },
    },

    defaultVariants: {
      variant: 'primary',
      tone: 'default',
      size: 'md',
      rounded: 'default',
    },

    // ⚠️ regras inteligentes para evitar conflito com outline
    compoundVariants: [
      {
        variant: 'outline',
        tone: 'filled',
        className: 'shadow-md hover:shadow-lg',
      },
      {
        variant: 'outline',
        tone: 'filledLight',
        className: 'shadow-none hover:shadow-none',
      },
    ],
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      tone,
      size,
      rounded,
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, tone, size, rounded }), className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin -ml-1 mr-2" />
            Carregando...
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
