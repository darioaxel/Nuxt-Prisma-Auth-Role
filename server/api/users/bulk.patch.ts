import type { Prisma, type Role } from '@prisma/client'
import { z } from 'zod'
import { prisma } from '../../utils/db'

const changeSchema = z.object({
  userId: z.string(),
  role: z.enum(['USER', 'ADMIN', 'ROOT']).optional(),
  isActive: z.boolean().optional(),
}).refine(data => data.role !== undefined || data.isActive !== undefined, {
  message: 'Debes especificar al menos un campo a actualizar',
})

const legacyBulkUpdateSchema = z.object({
  userIds: z.array(z.string()).min(1, 'Debes seleccionar al menos un usuario'),
  role: z.enum(['USER', 'ADMIN', 'ROOT']).optional(),
  isActive: z.boolean().optional(),
}).refine(data => data.role !== undefined || data.isActive !== undefined, {
  message: 'Debes especificar al menos un campo a actualizar',
})

const bulkUpdateSchema = z.union([
  legacyBulkUpdateSchema,
  z.object({
    changes: z.array(changeSchema).min(1, 'Debes enviar al menos un cambio'),
  }),
])

/**
 * PATCH /api/users/bulk
 * Actualiza múltiples usuarios (solo admin)
 * Soporta dos formatos:
 *  - Legado: { userIds, role?, isActive? }
 *  - Nuevo:  { changes: [{ userId, role?, isActive? }] }
 */
export default defineEventHandler(async (event) => {
  // Verificar autenticación y rol
  const session = await requireUserSession(event)

  if (session.user.role === 'USER') {
    throw createError({
      statusCode: 403,
      statusMessage: 'No tienes permiso para modificar usuarios',
    })
  }

  try {
    const body = await readBody(event)
    const parsed = bulkUpdateSchema.parse(body)

    // Normalizar a array de cambios individuales
    let changes: { userId: string, role?: Role, isActive?: boolean }[] = []
    if ('changes' in parsed) {
      changes = parsed.changes
    }
    else {
      const { userIds, role, isActive } = parsed
      changes = userIds.map(userId => ({ userId, role, isActive }))
    }

    const userIds = changes.map(c => c.userId)

    // Prevenir modificación de ROOTs
    const rootUsers = await prisma.user.findMany({
      where: {
        id: { in: userIds },
        role: 'ROOT',
      },
    })

    const rootIds = new Set(rootUsers.map(u => u.id))
    const changesToApply = changes.filter(c => !rootIds.has(c.userId))

    if (changesToApply.length === 0) {
      throw createError({
        statusCode: 403,
        statusMessage: 'No puedes modificar a superadministradores',
      })
    }

    // Actualizar cada usuario individualmente para preservar campos distintos
    const results = await prisma.$transaction(
      changesToApply.map((change) => {
        const updateData: Prisma.UserUpdateInput = {}
        if (change.role !== undefined) updateData.role = change.role
        if (change.isActive !== undefined) {
          updateData.isActive = change.isActive
          if (!change.isActive) {
            updateData.deactivatedAt = new Date()
          }
        }

        return prisma.user.update({
          where: { id: change.userId },
          data: updateData,
        })
      }),
    )

    return {
      success: true,
      updated: results.length,
      skipped: changes.length - changesToApply.length,
    }
  }
  catch (error: unknown) {
    const err = error as { statusCode?: number }
    if (err.statusCode) throw error

    throw createError({
      statusCode: 500,
      statusMessage: 'Error al actualizar usuarios',
    })
  }
})
