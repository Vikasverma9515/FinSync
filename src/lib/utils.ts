// // lib/utils.ts
// import { type ClassValue, clsx } from "clsx"
// import { twMerge } from "tailwind-merge"

// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs))
// }

// export function formatCurrency(amount: number, currency: string = 'INR') {
//   return new Intl.NumberFormat('en-IN', {
//     style: 'currency',
//     currency: currency,
//   }).format(amount)
// }

// export function formatPercentage(value: number) {
//   return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
// }

// export function formatDate(date: Date | string) {
//   return new Intl.DateTimeFormat('en-IN', {
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric',
//   }).format(new Date(date))
// }


import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export function formatNumber(num: number): string {
  if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
  return num.toFixed(0)
}

export function formatPercentage(num: number): string {
  return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`
}