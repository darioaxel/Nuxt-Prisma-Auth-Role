import { Role } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '~/server/utils/db'

const updateUserSchema = z.object({
  role: z.enum(['USER', 'ADMIN', 'ROOT']).optional(),
  isActive: z.boolean().optional(),
})

/**
 * PATCH /api/users/:id
 * Actualiza un usuario (solo admin)
 */
export default defineEventHandler(async (event) => {
  // Verificar autenticación y rol
  const session = await requireUserSession(event)
  
  if (session.user.role === 'USER') {
    throw createError({
      statusCode: 403,
      statusMessage: 'No tienes permiso para modificar usuarios'
    })
  }

  const userId = getRouterParam(event, 'id')
  
  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID de usuario no proporcionado'
    })
  }

  try {
    const body = await readBody(event)
    const data = updateUserSchema.parse(body)

    // Prevenir que un ADMIN modifique a un ROOT
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Usuario no encontrado'
      })
    }

    if (targetUser.role === 'ROOT' && session.user.role !== 'ROOT') {
      throw createError({
        statusCode: 403,
        statusMessage: 'No puedes modificar a un superadministrador'
      })
    }

    // Un ADMIN no puede crear otros ADMINs
    if (data.role === 'ADMIN' && session.user.role !== 'ROOT') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Solo los superadministradores pueden asignar rol de administrador'
      })
    }

    const updateData: any = {}
    if (data.role !== undefined) updateData.role = data.role
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive
      if (!data.isActive) {
        updateData.deactivatedAt = new Date()
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
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
      statusMessage: 'Error al actualizar usuario'
    })
  }
})
