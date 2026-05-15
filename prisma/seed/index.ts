import { prisma } from './config'
import { rawUsers } from './data/users'
import { UserSeeder } from './seeders/user.seeder'

/**
 * Seed principal - Punto de entrada
 *
 * Ejecuta los seeds en el orden correcto respetando dependencias.
 */
async function main() {
  console.log('🌱 Iniciando seed de datos iniciales...\n')

  try {
    // ─────────────────────────────────────────────────────────────
    // Limpieza de datos (orden: tablas hijas primero)
    // ─────────────────────────────────────────────────────────────
    console.log('🗑️  Limpiando datos existentes...')
    await prisma.address.deleteMany()
    await prisma.user.deleteMany()
    console.log('  ✅ Datos limpiados\n')

    // ─────────────────────────────────────────────────────────────
    // Ejecutar seeds por categoría
    // ─────────────────────────────────────────────────────────────

    // Usuarios (incluye ROOT, ADMIN y usuarios de prueba)
    const userSeeder = new UserSeeder()
    await userSeeder.run(rawUsers)

    // 👇 Agregar aquí futuros seeds:
    // const otherSeeder = new OtherSeeder()
    // await otherSeeder.run(data)

    // ─────────────────────────────────────────────────────────────
    // Resumen final
    // ─────────────────────────────────────────────────────────────
    console.log('\n📋 Credenciales de acceso:')
    console.log('  ROOT:    root@example.com / Admin123!')
    console.log('  ADMIN:   admin@example.com / Admin123!')
    console.log('  USER:    user@example.com / User123!')
    console.log('  EXTRAS:  maria@example.com, juan@example.com, ana@example.com / User123!')
    console.log('\n✨ Seed completado exitosamente!')
  } catch (error) {
    console.error('\n❌ Error en seed:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
