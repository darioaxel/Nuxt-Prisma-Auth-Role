/**
 * POST /api/auth/logout
 * Cierra la sesión del usuario
 */
export default defineEventHandler(async (event) => {
  await clearUserSession(event)
  
  return {
    success: true,
    message: 'Sesión cerrada correctamente'
  }
})
