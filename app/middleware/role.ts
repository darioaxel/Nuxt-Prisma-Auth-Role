import type { Role } from '~/types/auth'

/**
 * Middleware de autorización por roles
 * Protege rutas específicas verificando que el usuario tenga el rol necesario
 *
 * Uso en páginas:
 * definePageMeta({
 *   middleware: ['auth', 'role'],
 *   allowedRoles: ['BLOG', 'ADMIN', 'ROOT'],
 * })
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { user } = useUserSession()
  const userRole = user.value?.role as Role | undefined

  // Obtener los roles permitidos de la meta de la ruta
  const allowedRoles = to.meta.allowedRoles as Role[] | undefined

  // Si no hay restricción de roles, permitir acceso
  if (!allowedRoles || allowedRoles.length === 0) {
    return
  }

  // Verificar si el rol del usuario está en la lista de permitidos
  if (!userRole || !allowedRoles.includes(userRole)) {
    // Redirigir a una página de acceso denegado o al inicio
    return navigateTo('/usuario')
  }
})
