import { PrismaClient } from '@prisma/client'

/**
 * Cliente Prisma para el servidor
 * Se instancia una única vez y se reutiliza en todas las peticiones
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
