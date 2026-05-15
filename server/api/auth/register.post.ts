import bcryptjs from 'bcryptjs'
import { z } from 'zod'
import { Role } from '@prisma/client'
import { prisma } from '../../utils/db'

const registerSchema = z.object({
  firstName: z.string().min(2, 'Nombre muy corto'),
  lastName: z.string().min(2, 'Apellidos muy cortos'),
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

/**
 * POST /api/auth/register
 * Registra un nuevo usuario (siempre rol USER)
 */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, registerSchema.parse)

  // Verificar si existe
  const exists = await prisma.user.findUnique({
    where: { email: body.email }
  })

  if (exists) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Este email ya está registrado'
    })
  }

  // Hash password
  const hashedPassword = await bcryptjs.hash(body.password, 12)

  // Crear usuario
  const user = await prisma.user.create({
    data: {
      email: body.email,
      emailPersonal: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      role: Role.USER,
      isActive: true,
      provider: 'local',
      passwordHash: hashedPassword,
      failedLoginAttempts: 0,
    }
  })

  // Crear sesión con nuxt-auth-utils
  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    loggedInAt: new Date().toISOString(),
  })

  return {
    success: true,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }
  }
})
