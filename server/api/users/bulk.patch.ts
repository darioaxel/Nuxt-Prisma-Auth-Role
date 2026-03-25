import { Role } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '~/server/utils/db'

const bulkUpdateSchema = z.object({
  userIds: z.array(z.string()).min(1, 'Debes seleccionar al menos un usuario'),
  role: z.enum(['USER', 'ADMIN', 'ROOT']).optional(),
  isActive: z.boolean().optional(),
}).refine(data => data.role !== undefined || data.isActive !== undefined, {
  message: 'Debes especificar al menos un campo a actualizar',
})

/**
 * PATCH /api/users/bulk
 * Actualiza múltiples usuarios (solo admin)
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

  try {
    const body = await readBody(event)
    const { userIds, role, isActive } = bulkUpdateSchema.parse(body)

    // Prevenir modificación de ROOTs
    const rootUsers = await prisma.user.findMany({
      where: { 
        id: { in: userIds },
        role: 'ROOT'
      }
    })

    const idsToUpdate = userIds.filter(id => 
      !rootUsers.some(u => u.id === id)
    )

    if (idsToUpdate.length === 0) {
      throw createError({
        statusCode: 403,
        statusMessage: 'No puedes modificar a superadministradores'
      })
    }

    // Preparar datos de actualización
    const updateData: any = {}
    if (role !== undefined) updateData.role = role
    if (isActive !== undefined) {
      updateData.isActive = isActive
      if (!isActive) {
        updateData.deactivatedAt = new Date()
      }
    }

    // Actualizar usuarios
    const result = await prisma.user.updateMany({
      where: { id: { in: idsToUpdate } },
      data: updateData,
    })

    return {
      success: true,
      updated: result.count,
      skipped: userIds.length - idsToUpdate.length,
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al actualizar usuarios'
    })
  }
})
