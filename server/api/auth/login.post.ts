import bcryptjs from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '../../utils/db'

const loginSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

/**
 * POST /api/auth/login
 * Autentica un usuario y crea la sesión
 */
export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, loginSchema.parse)

  // Buscar usuario
  const user = await prisma.user.findUnique({
    where: { email: body.email },
  })

  if (!user || !user.passwordHash) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Credenciales inválidas',
    })
  }

  // Verificar que el usuario esté activo
  if (!user.isActive) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Tu cuenta ha sido desactivada. Contacta con el administrador.',
    })
  }

  // Verificar contraseña
  const isValidPassword = await bcryptjs.compare(body.password, user.passwordHash)

  if (!isValidPassword) {
    // Incrementar contador de intentos fallidos
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginAttempts: { increment: 1 } },
    })

    throw createError({
      statusCode: 401,
      statusMessage: 'Credenciales inválidas',
    })
  }

  // Actualizar último acceso y resetear intentos fallidos
  await prisma.user.update({
    where: { id: user.id },
    data: {
      lastLoginAt: new Date(),
      failedLoginAttempts: 0,
    },
  })

  // Crear sesión
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
    },
  }
})
