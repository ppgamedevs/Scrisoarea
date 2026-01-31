import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string) {
  const value = Number(amount)
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function calculateAgeBucket(age: number): string {
  if (age <= 7) return "0-7"
  if (age <= 10) return "8-10"
  if (age <= 14) return "11-14"
  if (age <= 18) return "15-18"
  return "18+"
}
