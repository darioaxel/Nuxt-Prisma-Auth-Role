/**
 * Middleware de autenticación
 * Protege rutas privadas redirigiendo a /login si no hay sesión
 */
export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, fetch } = useUserSession()

  // Nos aseguramos de tener la sesión actualizada (SSR/CSR)
  if (!loggedIn.value) {
    await fetch()
  }

  // Permitir acceso a rutas públicas
  const publicRoutes = ['/login', '/register', '/signup']
  if (publicRoutes.includes(to.path)) {
    // Si está logueado y va a login, redirigir al inicio
    if (loggedIn.value) {
      return navigateTo('/usuario')
    }
    return
  }

  // Si no está logueado, redirigir a login
  if (!loggedIn.value) {
    return navigateTo('/login')
  }
})
