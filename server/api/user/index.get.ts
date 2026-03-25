import { prisma } from '~/server/utils/db'

/**
 * GET /api/user
 * Obtiene los datos completos del usuario logueado
 */
export default defineEventHandler(async (event) => {
  // Verificar autenticación
  const session = await requireUserSession(event)
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        address: true
      }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Usuario no encontrado'
      })
    }

    return user

  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al obtener datos del usuario'
    })
  }
})
