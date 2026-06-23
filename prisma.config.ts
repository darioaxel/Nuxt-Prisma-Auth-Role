import { defineConfig } from 'prisma/config'

// Cargar variables de entorno desde .env
try {
  await import('dotenv/config')
}
catch {
  // Ignorar si dotenv no está disponible
}

// Usar DATABASE_URL del entorno o valor por defecto
const databaseUrl = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/db'

export default defineConfig({
  schema: './prisma/schema',
  migrations: {
    path: './prisma/migrations',
    seed: 'tsx ./prisma/seed/index.ts',
  },
  datasource: {
    url: databaseUrl,
  },
})
