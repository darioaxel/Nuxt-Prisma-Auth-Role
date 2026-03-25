import bcrypt from 'bcrypt'
import { z } from 'zod'
import { prisma } from '~/server/utils/db'

const createUserSchema = z.object({
  email: z.string().email('Email inválido'),
  firstName: z.string().min(1, 'El nombre es obligatorio'),
  lastName: z.string().min(1, 'Los apellidos son obligatorios'),
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
 * POST /api/users
 * Crea un nuevo usuario (solo admin)
 */
export default defineEventHandler(async (event) => {
  // Verificar autenticación y rol
  const session = await requireUserSession(event)
  
  if (session.user.role === 'USER') {
    throw createError({
      statusCode: 403,
      statusMessage: 'No tienes permiso para crear usuarios'
    })
  }

  try {
    const body = await readBody(event)
    const data = createUserSchema.parse(body)

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    })

    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Ya existe un usuario con este email'
      })
    }

    // Generar contraseña temporal
    const tempPassword = Math.random().toString(36).slice(-8)
    const passwordHash = await bcrypt.hash(tempPassword, 10)

    // Crear usuario con dirección
    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || null,
        dni: data.dni || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        role: 'USER',
        isActive: true,
        provider: 'local',
        address: data.addressLine ? {
          create: {
            addressLine: data.addressLine,
            floorDoor: data.floorDoor || null,
            postalCode: data.postalCode || '',
            locality: data.locality || '',
            province: data.province || '',
          }
        } : undefined,
      },
      include: {
        address: true
      }
    })

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      tempPassword // En producción, enviar por email en lugar de devolverla
    }

  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Error al crear usuario'
    })
  }
})
