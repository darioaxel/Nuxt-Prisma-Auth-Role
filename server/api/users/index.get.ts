import { Role } from '@prisma/client'
import { prisma } from '~/server/utils/db'

/**
 * GET /api/users
 * Lista usuarios con paginación y filtros (solo admin)
 */
export default defineEventHandler(async (event) => {
  // Verificar autenticación y rol
  const session = await requireUserSession(event)
  
  if (session.user.role === 'USER') {
    throw createError({
      statusCode: 403,
      statusMessage: 'No tienes permiso para ver esta información'
    })
  }

  // Obtener parámetros de query
  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 10
  const search = query.search as string | undefined
  const roleFilter = query.role as string | undefined

  const skip = (page - 1) * limit

  // Construir where
  const where: any = {}

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { dni: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (roleFilter && roleFilter !== 'ALL') {
    where.role = roleFilter as Role
  }

  try {
    // Contar total
    const total = await prisma.user.count({ where })

    // Obtener usuarios
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        dni: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
      }
    })

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      }
    }

  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al obtener usuarios'
    })
  }
})
