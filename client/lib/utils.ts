import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: string | number): string {
  try {
    // Handle different input types
    let numericAmount: number;

    if (typeof amount === "string") {
      // Normalize and remove replacement characters
      const normalized = amount.replace(/�/g, "");
      // If it's already properly formatted, return as is
      if (normalized.startsWith("₦")) {
        return normalized;
      }

      // Remove all non-numeric characters except decimal point and letters (for B, M, K suffixes)
      let cleanAmount = normalized.replace(/[^\d.BMK]/gi, "");

      // Handle billion, million, thousand suffixes
      let multiplier = 1;
      if (cleanAmount.toUpperCase().includes("B")) {
        multiplier = 1000000000;
        cleanAmount = cleanAmount.replace(/[B]/gi, "");
      } else if (cleanAmount.toUpperCase().includes("M")) {
        multiplier = 1000000;
        cleanAmount = cleanAmount.replace(/[M]/gi, "");
      } else if (cleanAmount.toUpperCase().includes("K")) {
        multiplier = 1000;
        cleanAmount = cleanAmount.replace(/[K]/gi, "");
      }

      numericAmount = (parseFloat(cleanAmount) || 0) * multiplier;
    } else {
      numericAmount = amount || 0;
    }

    if (isNaN(numericAmount) || numericAmount === 0) return "₦0";

    // Format with commas and add naira symbol
    if (numericAmount >= 1000000000) {
      return `₦${(numericAmount / 1000000000).toFixed(1)}B`;
    } else if (numericAmount >= 1000000) {
      return `₦${(numericAmount / 1000000).toFixed(1)}M`;
    } else if (numericAmount >= 1000) {
      return `₦${(numericAmount / 1000).toFixed(1)}K`;
    }

    return `₦${numericAmount.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  } catch (error) {
    console.error("Error formatting currency:", error, "Input:", amount);
    return "₦0";
  }
}
