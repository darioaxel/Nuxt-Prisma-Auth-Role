import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

// Crear pool de conexiones PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Crear adapter de Prisma para PostgreSQL
const adapter = new PrismaPg(pool)

/**
 * Cliente Prisma para el servidor
 * Se instancia una única vez y se reutiliza en todas las peticiones
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaOptions = {
  adapter,
  log: process.env.NODE_ENV === 'development' 
    ? ['query' as const, 'info' as const, 'warn' as const, 'error' as const] 
    : ['error' as const],
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaOptions)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
