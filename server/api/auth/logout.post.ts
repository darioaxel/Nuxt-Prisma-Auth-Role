/**
 * POST /api/auth/logout
 * Cierra la sesión del usuario
 */
export default defineEventHandler(async (event) => {
  await clearUserSession(event)
  await sendRedirect(event, '/login')
})
