import bcrypt from 'bcrypt'
import { z } from 'zod'
import { prisma } from '../../utils/db'

const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
})

/**
 * POST /api/auth/register
 * Registra un nuevo usuario
 */
export default defineEventHandler(async (event) => {
  try {
    // Validar input
    const body = await readBody(event)
    const { email, password, firstName, lastName } = registerSchema.parse(body)

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Ya existe una cuenta con este email'
      })
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10)

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName: firstName || null,
        lastName: lastName || null,
        role: 'USER',
        isActive: true,
        provider: 'local',
      }
    })

    // Crear sesión automáticamente
    await setUserSession(event, {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      loggedInAt: new Date().toISOString()
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

  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al registrar usuario'
    })
  }
})
