import { z } from 'zod'
import { prisma } from '../../utils/db'

const profileSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  dni: z.string().optional(),
  birthDate: z.string().optional(),
  addressLine: z.string().optional(),
  floorDoor: z.string().optional(),
  postalCode: z.string().optional(),
  locality: z.string().optional(),
  province: z.string().optional(),
})

/**
 * PUT /api/user/profile
 * Actualiza el perfil del usuario logueado
 */
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  
  try {
    const body = await readBody(event)
    const data = profileSchema.parse(body)

    // Preparar datos de usuario
    const userData: any = {}
    if (data.firstName !== undefined) userData.firstName = data.firstName
    if (data.lastName !== undefined) userData.lastName = data.lastName
    if (data.email !== undefined) userData.email = data.email.toLowerCase()
    if (data.phone !== undefined) userData.phone = data.phone
    if (data.dni !== undefined) userData.dni = data.dni
    if (data.birthDate !== undefined) {
      userData.birthDate = data.birthDate ? new Date(data.birthDate) : null
    }

    // Actualizar usuario y dirección
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...userData,
        address: {
          upsert: {
            create: {
              addressLine: data.addressLine || '',
              floorDoor: data.floorDoor || null,
              postalCode: data.postalCode || '',
              locality: data.locality || '',
              province: data.province || '',
            },
            update: {
              addressLine: data.addressLine || '',
              floorDoor: data.floorDoor || null,
              postalCode: data.postalCode || '',
              locality: data.locality || '',
              province: data.province || '',
            },
          },
        },
      },
      include: {
        address: true
      }
    })

    return {
      success: true,
      user
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al actualizar el perfil'
    })
  }
})
