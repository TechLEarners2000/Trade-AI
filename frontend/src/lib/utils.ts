import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | null | undefined, digits: number = 2): string {
  if (value === null || value === undefined) return 'N/A'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value)
}

export function formatCompactCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A'
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`
  if (value >= 100000) return `₹${(value / 100000).toFixed(2)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(2)}K`
  return `₹${value.toFixed(2)}`
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'N/A'
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function formatNumber(value: number | null | undefined, digits: number = 0): string {
  if (value === null || value === undefined) return 'N/A'
  return new Intl.NumberFormat('en-IN').format(Number(value.toFixed(digits)))
}

export function getChangeColor(change: number | null | undefined): string {
  if (change === null || change === undefined) return 'text-muted-foreground'
  return change >= 0 ? 'text-green-500' : 'text-red-500'
}

export function getChangeIcon(change: number | null | undefined): string {
  if (change === null || change === undefined) return 'minus'
  return change >= 0 ? 'trending-up' : 'trending-down'
}

export function truncate(str: string, length: number = 100): string {
  if (!str) return ''
  return str.length > length ? str.slice(0, length) + '...' : str
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, delay: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
