import { Role } from '@prisma/client'
import { UserData } from '../types'

export const rawUsers: UserData[] = [
  {
    email: 'root@example.com',
    emailPersonal: 'root.personal@example.com',
    firstName: 'Super',
    lastName: 'Administrador',
    password: 'Admin123!',
    role: Role.ROOT,
    address: {
      addressLine: 'Calle Principal 123',
      postalCode: '28001',
      locality: 'Madrid',
      province: 'Madrid',
    },
  },
  {
    email: 'admin@example.com',
    firstName: 'Administrador',
    lastName: 'Sistema',
    password: 'Admin123!',
    role: Role.ADMIN,
  },
  {
    email: 'user@example.com',
    firstName: 'Usuario',
    lastName: 'Normal',
    password: 'User123!',
    role: Role.USER,
  },
  {
    email: 'maria@example.com',
    firstName: 'María',
    lastName: 'García',
    password: 'User123!',
    role: Role.USER,
  },
  {
    email: 'juan@example.com',
    firstName: 'Juan',
    lastName: 'López',
    password: 'User123!',
    role: Role.USER,
  },
  {
    email: 'ana@example.com',
    firstName: 'Ana',
    lastName: 'Martínez',
    password: 'User123!',
    role: Role.USER,
  },
]
