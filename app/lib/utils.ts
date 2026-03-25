import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina clases de Tailwind CSS de manera eficiente
 * Usa clsx para condicionales y tailwind-merge para evitar conflictos
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatea una fecha a string localizado
 */
export function formatDate(date: Date | string | null, options?: Intl.DateTimeFormatOptions): string {
  if (!date) return '-'
  
  const d = typeof date === 'string' ? new Date(date) : date
  
  return d.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  })
}

/**
 * Formatea un número de teléfono español
 */
export function formatPhone(phone: string | null): string {
  if (!phone) return '-'
  
  // Eliminar espacios y caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '')
  
  // Si tiene 9 dígitos (móvil español), formatear como 123 45 67 89
  if (cleaned.length === 9) {
    return cleaned.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4')
  }
  
  return phone
}

/**
 * Genera iniciales a partir de nombre y apellido
 */
export function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.charAt(0) || ''
  const last = lastName?.charAt(0) || ''
  return (first + last).toUpperCase() || 'U'
}

/**
 * Trunca un texto a una longitud máxima
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
