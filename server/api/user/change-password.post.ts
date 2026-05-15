import bcryptjs from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../utils/db'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: z.string().min(8, 'La nueva contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

/**
 * POST /api/user/change-password
 * Cambia la contraseña del usuario logueado
 */
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  
  try {
    const { currentPassword, newPassword } = await readValidatedBody(event, changePasswordSchema.parse)

    // Obtener usuario con contraseña
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || !user.passwordHash) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Usuario no encontrado'
      })
    }

    // Verificar contraseña actual
    const isValidPassword = await bcryptjs.compare(currentPassword, user.passwordHash)

    if (!isValidPassword) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Contraseña actual incorrecta'
      })
    }

    // Hashear nueva contraseña
    const newPasswordHash = await bcryptjs.hash(newPassword, 10)

    // Actualizar contraseña
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newPasswordHash }
    })

    return {
      success: true,
      message: 'Contraseña actualizada correctamente'
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al cambiar la contraseña'
    })
  }
})
