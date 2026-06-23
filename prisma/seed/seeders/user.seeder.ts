import type { User } from '@prisma/client'
import { prisma } from '../config'
import bcryptjs from 'bcryptjs'
import type { UserData } from '../types'

export class UserSeeder {
  async run(users: UserData[]): Promise<User[]> {
    console.log('👤 Seed de usuarios...\n')

    const createdUsers: User[] = []

    for (const u of users) {
      const exists = await prisma.user.findUnique({
        where: { email: u.email },
      })

      if (exists) {
        console.log(`  ✔  Ya existe: ${u.email} (${u.role})`)
        createdUsers.push(exists)
        continue
      }

      const user = await prisma.user.create({
        data: {
          email: u.email,
          emailPersonal: u.emailPersonal,
          firstName: u.firstName,
          lastName: u.lastName,
          passwordHash: await bcryptjs.hash(u.password, 10),
          role: u.role,
          isActive: true,
          provider: 'local',
          address: u.address ? { create: u.address } : undefined,
        },
      })

      console.log(`  ✔  Creado: ${user.email} (${user.role})`)
      createdUsers.push(user)
    }

    console.log(`  📊 Total: ${createdUsers.length} usuarios\n`)
    return createdUsers
  }
}
