import { prisma } from '~/server/utils/db'

/**
 * GET /api/user/profile
 * Obtiene el perfil del usuario logueado
 */
export default defineEventHandler(async (event) => {
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

    return {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      dni: user.dni,
      birthDate: user.birthDate?.toISOString().split('T')[0] || '',
      addressLine: user.address?.addressLine || '',
      floorDoor: user.address?.floorDoor || '',
      postalCode: user.address?.postalCode || '',
      locality: user.address?.locality || '',
      province: user.address?.province || '',
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al obtener el perfil'
    })
  }
})
