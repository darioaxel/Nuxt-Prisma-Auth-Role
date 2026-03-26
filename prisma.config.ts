import { defineConfig } from "prisma/config"

// Para prisma generate no se necesita conexión real, solo un valor válido
const databaseUrl = process.env.DATABASE_URL || "postgresql://user:pass@localhost:5432/db"

export default defineConfig({
  schema: "./prisma/schema",
  migrations: {
    path: "./prisma/migrations",
    seed: 'tsx ./prisma/seed/index.ts',
  },
  datasource: {
    url: databaseUrl,
  },
})
