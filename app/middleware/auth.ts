/**
 * Middleware de autenticación
 * Protege rutas privadas redirigiendo a /login si no hay sesión
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn } = useUserSession()

  // Permitir acceso a rutas públicas
  const publicRoutes = ['/login', '/register', '/signup']
  if (publicRoutes.includes(to.path)) {
    return
  }

  // Si no está logueado, redirigir a login
  if (!loggedIn.value) {
    return navigateTo('/login')
  }
})
