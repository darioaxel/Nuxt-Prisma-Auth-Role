// ============================================================================
// Configuración de Navegación - Nuxt Prisma Auth Template
// ============================================================================
// Este archivo centraliza la configuración de menús de la aplicación.
// Modifica los arrays para personalizar la navegación.

export interface NavItem {
  title: string
  url: string
  icon?: string // formato 'lucide:icon-name'
  isActive?: boolean
  items?: NavSubItem[]
}

export interface NavSubItem {
  title: string
  url: string
}

export interface NavSection {
  title: string
  roles?: string[] // Roles que pueden ver esta sección
  items: NavItem[]
}

// ============================================================================
// CONFIGURACIÓN DEL SITIO
// ============================================================================
export const siteConfig = {
  name: 'Mi Aplicación',
  url: 'https://miapp.com',
  description: 'Descripción de mi aplicación',
  
  // Información del usuario (para UI)
  user: {
    name: 'Usuario',
    email: 'user@example.com',
    avatar: 'avatars/default.jpg',
  },
}

// ============================================================================
// MENÚS POR ROL
// ============================================================================

/**
 * Menú para usuarios normales (USER)
 */
const userMenu: NavItem[] = [
  {
    title: 'Mi Perfil',
    url: '/usuario/perfil',
    icon: 'lucide:user',
  },
  {
    title: 'Configuración',
    url: '/usuario/configuracion',
    icon: 'lucide:settings',
  },
]

/**
 * Menú para administradores (ADMIN, ROOT)
 */
const adminMenu: NavItem[] = [
  {
    title: 'Gestión de Usuarios',
    url: '/admin/usuarios',
    icon: 'lucide:users',
    items: [
      { title: 'Listado de usuarios', url: '/admin/usuarios/listado' },
      { title: 'Alta de usuario', url: '/usuario/alta-usuario' },
    ],
  },
]

// ============================================================================
// SECCIONES DE NAVEGACIÓN
// ============================================================================

/**
 * Define las secciones de navegación del sidebar.
 * Cada sección puede tener restricciones por rol.
 */
export const navSections: NavSection[] = [
  // Sección para usuarios normales
  {
    title: 'Mi Cuenta',
    roles: ['USER', 'ADMIN', 'ROOT'],
    items: userMenu,
  },
  
  // Sección solo para administradores
  {
    title: 'Administración',
    roles: ['ADMIN', 'ROOT'],
    items: adminMenu,
  },
]

/**
 * Enlaces secundarios (pie del sidebar)
 */
export const navSecondary: NavItem[] = [
  {
    title: 'Inicio',
    url: '/',
    icon: 'lucide:home',
  },
]

// ============================================================================
// CONFIGURACIÓN DE TEMA
// ============================================================================
export const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b',
}
