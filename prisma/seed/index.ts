import { PrismaClient, Role } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import bcrypt from 'bcrypt'

// Crear pool de conexiones PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Crear adapter de Prisma para PostgreSQL
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
  log: ['info', 'warn', 'error'],
})

async function main() {
  console.log('🌱 Iniciando seed de datos iniciales...')

  // Limpiar datos existentes
  await prisma.address.deleteMany()
  await prisma.user.deleteMany()

  // Crear usuario ROOT (superadmin)
  const rootPassword = await bcrypt.hash('Admin123!', 10)
  const rootUser = await prisma.user.create({
    data: {
      email: 'root@example.com',
      emailPersonal: 'root.personal@example.com',
      firstName: 'Super',
      lastName: 'Administrador',
      passwordHash: rootPassword,
      role: Role.ROOT,
      isActive: true,
      provider: 'local',
      address: {
        create: {
          addressLine: 'Calle Principal 123',
          postalCode: '28001',
          locality: 'Madrid',
          province: 'Madrid'
        }
      }
    }
  })
  console.log('✅ Usuario ROOT creado:', rootUser.email)

  // Crear usuario ADMIN
  const adminPassword = await bcrypt.hash('Admin123!', 10)
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      firstName: 'Administrador',
      lastName: 'Sistema',
      passwordHash: adminPassword,
      role: Role.ADMIN,
      isActive: true,
      provider: 'local',
    }
  })
  console.log('✅ Usuario ADMIN creado:', adminUser.email)

  // Crear usuario de prueba
  const userPassword = await bcrypt.hash('User123!', 10)
  const normalUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      firstName: 'Usuario',
      lastName: 'Normal',
      passwordHash: userPassword,
      role: Role.USER,
      isActive: true,
      provider: 'local',
    }
  })
  console.log('✅ Usuario USER creado:', normalUser.email)

  // Crear algunos usuarios adicionales para el listado
  const users = [
    { email: 'maria@example.com', firstName: 'María', lastName: 'García' },
    { email: 'juan@example.com', firstName: 'Juan', lastName: 'López' },
    { email: 'ana@example.com', firstName: 'Ana', lastName: 'Martínez' },
  ]

  for (const userData of users) {
    const password = await bcrypt.hash('User123!', 10)
    await prisma.user.create({
      data: {
        ...userData,
        passwordHash: password,
        role: Role.USER,
        isActive: true,
        provider: 'local',
      }
    })
  }
  console.log('✅ Usuarios de ejemplo creados')

  console.log('\n📋 Credenciales de acceso:')
  console.log('  ROOT:    root@example.com / Admin123!')
  console.log('  ADMIN:   admin@example.com / Admin123!')
  console.log('  USER:    user@example.com / User123!')
  console.log('\n✨ Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
