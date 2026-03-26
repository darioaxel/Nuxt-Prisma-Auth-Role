import type { Role } from '~/types/auth'

/**
 * Middleware global de validación de roles
 * Valida que el usuario tenga el rol requerido para acceder a una página
 * 
 * Uso en páginas:
 * definePageMeta({
 *   roles: ['ADMIN', 'ROOT']
 * })
 */
export default defineNuxtRouteMiddleware((to) => {
  // Obtener roles requeridos de la meta de la página
  const requiredRoles = to.meta.roles as Role[] | undefined
  
  // Si no hay roles requeridos, permitir acceso
  if (!requiredRoles || requiredRoles.length === 0) {
    return
  }

  const { session } = useAppUserSession()
  const userRole = session.value.role

  // Si no hay sesión, redirigir a login
  if (!userRole) {
    return navigateTo('/login')
  }

  // Verificar si el usuario tiene alguno de los roles requeridos
  if (!requiredRoles.includes(userRole)) {
    // Usuario no tiene permiso, redirigir a página de inicio
    console.warn(`⛔ Acceso denegado: se requiere rol ${requiredRoles.join(' o ')}, usuario tiene ${userRole}`)
    return navigateTo('/usuario/perfil')
  }
})
