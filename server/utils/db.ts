import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

/**
 * Construye la URL de conexión a PostgreSQL.
 * Prioridad:
 * 1. DATABASE_URL (variable completa)
 * 2. DB_USER, DB_PASSWORD, DB_NAME, DB_HOST, DB_PORT
 */
function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL
  }

  const user = process.env.DB_USER || 'app_user'
  const password = process.env.DB_PASSWORD || 'changeme'
  const name = process.env.DB_NAME || 'app_database'
  const host = process.env.DB_HOST || 'localhost'
  const port = process.env.DB_PORT || '5432'

  return `postgresql://${user}:${password}@${host}:${port}/${name}?schema=public`
}

const adapter = new PrismaPg({
  connectionString: getDatabaseUrl(),
})

/**
 * Cliente Prisma para el servidor
 * Se instancia una única vez y se reutiliza en todas las peticiones
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (import.meta.env?.DEV ?? process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
