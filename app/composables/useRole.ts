import type { Role } from '@prisma/client'

/**
 * Jerarquía de roles (de menor a mayor permiso)
 */
const roleHierarchy: Role[] = ['USER', 'ADMIN', 'ROOT']

/**
 * Composable para verificar roles del usuario actual
 */
export const useRole = () => {
  const { session } = useAppUserSession()
  const userRole = computed(() => session.value.role)

  /**
   * Verifica si el usuario tiene un rol específico
   */
  const hasRole = (role: Role): boolean => {
    return userRole.value === role
  }

  /**
   * Verifica si el usuario tiene al menos el rol especificado
   * (incluye roles superiores en la jerarquía)
   */
  const hasRoleOrHigher = (role: Role): boolean => {
    if (!userRole.value) return false
    const userIndex = roleHierarchy.indexOf(userRole.value)
    const requiredIndex = roleHierarchy.indexOf(role)
    return userIndex >= requiredIndex
  }

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   */
  const hasAnyRole = (roles: Role[]): boolean => {
    if (!userRole.value) return false
    return roles.includes(userRole.value)
  }

  /**
   * Verifica si el usuario es administrador o superior
   */
  const isAdmin = computed(() => hasRoleOrHigher('ADMIN'))

  /**
   * Verifica si el usuario es ROOT
   */
  const isRoot = computed(() => hasRole('ROOT'))

  /**
   * Verifica si el usuario está autenticado
   */
  const isAuthenticated = computed(() => session.value.loggedIn)

  return {
    userRole,
    hasRole,
    hasRoleOrHigher,
    hasAnyRole,
    isAdmin,
    isRoot,
    isAuthenticated,
  }
}
