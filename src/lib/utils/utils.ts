import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx for conditional classes and tailwind-merge to handle conflicts
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency values
 */
export function formatCurrency(value: number, currency: string = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format date values
 */
export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'long') {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'long',
    }).format(dateObj);
  }
  
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
  }).format(dateObj);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

type TruncateOptions = {
  start?: number;
  end?: number;
  maxLength?: number;
};

export const truncateMiddle = (
  value?: string,
  { start = 7, end = 3, maxLength }: TruncateOptions = {}
) => {
  if (!value) return '';

  // Se maxLength não for informado, usa start + end + 3 (" ... ")
  const limit = maxLength ?? start + end + 3;

  if (value.length <= limit) return value;

  return `${value.slice(0, start)} ... ${value.slice(-end)}`;
};

// Converte "dd/MM/yyyy" -> "yyyy-MM-dd"
export function brDateToIso(date?: string): string | undefined {
  if (!date) return date;

  // já está em ISO? não mexe
  if (date.includes("-")) return date;

  const [dd, mm, yyyy] = date.split("/");

  if (!dd || !mm || !yyyy) return date; // deixa backend validar se vier lixo

  return `${yyyy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}`;
}