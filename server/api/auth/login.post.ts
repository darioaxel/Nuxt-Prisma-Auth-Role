import bcrypt from 'bcrypt'
import { z } from 'zod'
import { prisma } from '../../utils/db'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
})

/**
 * POST /api/auth/login
 * Autentica un usuario y crea la sesión
 */
export default defineEventHandler(async (event) => {
  try {
    // Validar input
    const body = await readBody(event)
    const { email, password } = loginSchema.parse(body)

    // Buscar usuario
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!user || !user.passwordHash) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Credenciales inválidas'
      })
    }

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Cuenta desactivada. Contacta con el administrador.'
      })
    }

    // Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.passwordHash)

    if (!isValidPassword) {
      // Incrementar contador de intentos fallidos
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: { increment: 1 } }
      })

      throw createError({
        statusCode: 401,
        statusMessage: 'Credenciales inválidas'
      })
    }

    // Actualizar último acceso y resetear intentos fallidos
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        failedLoginAttempts: 0
      }
    })

    // Crear sesión
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
      statusMessage: 'Error en el servidor'
    })
  }
})
