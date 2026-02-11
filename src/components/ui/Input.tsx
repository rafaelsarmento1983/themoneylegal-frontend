import React, { InputHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils/utils';
import {
  AlertCircle,
  CheckCircle,
} from "lucide-react";

/**
 * 📝 Input Component - TOTALMENTE CUSTOMIZÁVEL
 *
 * Permite definir background, borda, rounded e muito mais
 * na chamada do componente
 */

const inputVariants = cva(
  [
    'w-full px-4 py-2.5',
    'font-medium text-neutral-900 dark:text-white',
    'placeholder:text-neutral-400 dark:placeholder:text-neutral-500',
    'transition-all duration-200',
    'focus:outline-none focus:ring-4',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        default: [
          'bg-white dark:bg-neutral-800',
          'border-2 border-neutral-200 dark:border-neutral-700',
          'focus:border-brand-primary-500 dark:focus:border-brand-primary-400',
          'focus:ring-brand-primary-100 dark:focus:ring-brand-primary-900',
        ],
        filled: [
          'bg-neutral-50 dark:bg-neutral-900',
          'border-2 border-transparent',
          'focus:border-brand-primary-500 dark:focus:border-brand-primary-400',
          'focus:ring-brand-primary-100 dark:focus:ring-brand-primary-900',
        ],
        outline: [
          'bg-transparent',
          'border-2 border-neutral-300 dark:border-neutral-600',
          'focus:border-brand-primary-500 dark:focus:border-brand-primary-400',
          'focus:ring-brand-primary-100 dark:focus:ring-brand-primary-900',
        ],
        ghost: [
          'bg-transparent',
          'border-2 border-transparent',
          'hover:bg-neutral-50 dark:hover:bg-neutral-900',
          'focus:border-brand-primary-500 dark:focus:border-brand-primary-400',
          'focus:ring-brand-primary-100 dark:focus:ring-brand-primary-900',
        ],
        success: [
          'bg-white dark:bg-neutral-800',
          'border-2 border-success-500 dark:border-success-400',
          'focus:border-success-600 dark:focus:border-success-300',
          'focus:ring-success-100 dark:focus:ring-success-900',
        ],
        error: [
          'bg-white dark:bg-neutral-800',
          'border-2 border-danger-500 dark:border-danger-400',
          'focus:border-danger-600 dark:focus:border-danger-300',
          'focus:ring-danger-100 dark:focus:ring-danger-900',
        ],
        warning: [
          'bg-white dark:bg-neutral-800',
          'border-2 border-warning-500 dark:border-warning-400',
          'focus:border-warning-600 dark:focus:border-warning-300',
          'focus:ring-warning-100 dark:focus:ring-warning-900',
        ],
      },
      inputSize: {
        sm: 'h-9 px-3 py-1.5 text-sm',
        md: 'h-11 px-4 py-2.5 text-base',
        lg: 'h-14 px-5 py-3.5 text-lg',
      },
      rounded: {
        none: 'rounded-none',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        xl: 'rounded-xl',
        '2xl': 'rounded-2xl',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
      rounded: 'lg',
    },
  }
);

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  label?: string;
  error?: string;
  success?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  leftAddon?: ReactNode;
  rightAddon?: ReactNode;

  // ✅ Classes para ícones (cor, tamanho, etc)
  leftIconClassName?: string;
  rightIconClassName?: string;

  // ⭐ NOVO: Customização de cores dos ícones
  customIconColor?: string;        // Aplica em ambos os ícones
  customLeftIconColor?: string;    // Só o ícone esquerdo
  customRightIconColor?: string;   // Só o ícone direito

  // Customizações diretas
  customBg?: string;
  customBorder?: string;
  customRounded?: string;
  customFocusRing?: string;
  customFocusBorder?: string;
  customTextColor?: string;
  customPlaceholderColor?: string; // ⭐ NOVO: Para o placeholder

  containerClassName?: string;
  labelClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant,
      inputSize,
      rounded,
      label,
      error,
      success,
      hint,
      leftIcon,
      rightIcon,
      leftAddon,
      rightAddon,
      required,
      disabled,

      customBg,
      customBorder,
      customRounded,
      customFocusRing,
      customFocusBorder,
      customTextColor,
      customPlaceholderColor,
      customIconColor,
      customLeftIconColor,
      customRightIconColor,

      leftIconClassName,
      rightIconClassName,

      containerClassName,
      labelClassName,
      ...props
    },
    ref
  ) => {
    const effectiveVariant = (error ? 'error' : success ? 'success' : variant) as any;
    const effectiveRounded = customRounded ? undefined : rounded;

    const needsInlineStyles = props.type === 'email' || props.type === 'password' || props.type === 'tel' || props.type === 'text' || props.type === 'date';
    const inlineStyles: React.CSSProperties = {};

    if (needsInlineStyles && customRounded) {
      if (customRounded === 'rounded-none') inlineStyles.borderRadius = '0';
      else if (customRounded === 'rounded-full') inlineStyles.borderRadius = '9999px';
      else if (customRounded?.includes('rounded-')) {
        const roundedMap: Record<string, string> = {
          'rounded-sm': '0.125rem',
          rounded: '0.25rem',
          'rounded-md': '0.375rem',
          'rounded-lg': '0.5rem',
          'rounded-xl': '0.75rem',
          'rounded-2xl': '1rem',
          'rounded-3xl': '1.5rem',
        };
        inlineStyles.borderRadius = roundedMap[customRounded] || '0.5rem';
      }
    }

    if (leftIcon && !leftAddon) inlineStyles.paddingLeft = '2.5rem';
    if (leftAddon) inlineStyles.paddingLeft = '4rem';
    if (rightIcon && !rightAddon) inlineStyles.paddingRight = '2.5rem';
    if (rightAddon) inlineStyles.paddingRight = '4rem';

    // ⭐ Lógica de cores dos ícones (prioridade: específico > geral > padrão)
    const leftIconColor = customLeftIconColor || customIconColor || 'text-neutral-400 dark:text-neutral-500';
    const rightIconColor = customRightIconColor || customIconColor || 'text-neutral-400 dark:text-neutral-500';

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label
            className={cn(
              'block text-sm font-semibold text-neutral-700 dark:text-neutral-300 mb-2',
              labelClassName
            )}
          >
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftAddon && (
            <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none">
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {leftAddon}
              </span>
            </div>
          )}

          {/* ⭐ Left Icon com cor customizável */}
          {leftIcon && !leftAddon && (
            <div className="absolute left-0 top-0 bottom-0 flex items-center pl-3 pointer-events-none">
              <span className={cn(leftIconColor, leftIconClassName)}>
                {leftIcon}
              </span>
            </div>
          )}

          <input
            ref={ref}
            disabled={disabled}
            style={inlineStyles}
            className={cn(
              inputVariants({ variant: effectiveVariant, inputSize, rounded: effectiveRounded }),
              leftIcon && !leftAddon && '!pl-10',
              leftAddon && '!pl-16',
              rightIcon && !rightAddon && '!pr-10',
              rightAddon && '!pr-16',

              // ⭐ Customizações por último
              customBg,
              customBorder,
              customRounded,
              customFocusRing,
              customFocusBorder,
              customTextColor,
              customPlaceholderColor,
              className
            )}
            {...props}
          />

          {/* ⭐ Right Icon com cor customizável */}
          {rightIcon && !rightAddon && (
            <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3">
              <span className={cn(rightIconColor, rightIconClassName)}>
                {rightIcon}
              </span>
            </div>
          )}

          {rightAddon && (
            <div className="absolute right-0 top-0 bottom-0 flex items-center pr-3">
              <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {rightAddon}
              </span>
            </div>
          )}
        </div>

        <div className="mt-1.5 min-h-[20px]">
          {error && (
            <p className="text-sm text-danger-600 dark:text-danger-400 flex items-center gap-1.5 animate-slide-in-down">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </p>
          )}

          {!error && success && (
            <p className="text-sm text-success-600 dark:text-success-400 flex items-center gap-1.5 animate-slide-in-down">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              {success}
            </p>
          )}

          {!error && !success && hint && (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{hint}</p>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';
