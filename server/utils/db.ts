import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
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
