import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string | number): string {
  // Remove any existing currency symbols and non-numeric characters except decimal point
  const numericAmount = typeof amount === 'string'
    ? parseFloat(amount.replace(/[^\d.]/g, ''))
    : amount;

  if (isNaN(numericAmount)) return '₦0';

  // Format with commas and add naira symbol
  return `₦${numericAmount.toLocaleString('en-NG', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })}`;
}
