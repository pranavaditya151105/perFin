import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number into Indian Rupee (INR) currency format.
 * Example: 100000 -> ₹1,00,000
 */
export function formatINR(number) {
  if (number === undefined || number === null || isNaN(number)) {
    return '₹0';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(number);
}

