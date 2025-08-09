import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string | number): string {
  // Handle different input types
  let numericAmount: number;

  if (typeof amount === "string") {
    // If it's already properly formatted, return as is
    if (amount.startsWith("₦") && amount.includes(",")) {
      return amount;
    }
    // Remove currency symbols, commas, and other non-numeric characters except decimal point
    const cleanAmount = amount.replace(/[₦,\s]/g, "").replace(/[^\d.]/g, "");
    numericAmount = parseFloat(cleanAmount) || 0;
  } else {
    numericAmount = amount || 0;
  }

  if (isNaN(numericAmount) || numericAmount === 0) return "₦0";

  // Format with commas and add naira symbol
  return `₦${numericAmount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}
