// ============================================================================
// Tipos de Autenticación - Nuxt Prisma Auth Template
// ============================================================================

// Tipo Role basado en el enum de Prisma
export type Role = 'USER' | 'ADMIN' | 'ROOT'

/**
 * Usuario completo desde la API
 */
export interface FullUser {
  id: string
  email: string
  emailPersonal?: string | null
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  dni?: string | null
  birthDate?: Date | null
  picture?: string | null
  role: Role
  isActive: boolean
  lastLoginAt?: Date | null
  createdAt: Date
  updatedAt: Date
  address?: {
    addressLine: string
    floorDoor?: string | null
    postalCode: string
    locality: string
    province: string
  } | null
}

/**
 * Datos del perfil editable
 */
export interface ProfileData {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  dni?: string
  birthDate?: string
  addressLine?: string
  floorDoor?: string
  postalCode?: string
  locality?: string
  province?: string
}

/**
 * Estado de la sesión extendida
 */
export interface UserSessionState {
  user: FullUser | null
  loggedIn: boolean
  loading: boolean
  role: Role | null
}

/**
 * Datos de login
 */
export interface LoginCredentials {
  email: string
  password: string
}

/**
 * Datos de registro
 */
export interface RegisterData {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

/**
 * Respuesta de autenticación
 */
export interface AuthResponse {
  success: boolean
  user?: FullUser
  error?: string
}

// Extend Nuxt Auth Utils types
declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    role: Role
  }
}
