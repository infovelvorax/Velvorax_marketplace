import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility for conditionally merging Tailwind CSS classes without style conflicts.
 *
 * @param {...any} inputs - Class names, expressions, or conditional objects
 * @returns {string} - Clean, merged class names
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
