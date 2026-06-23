import type { Role } from '@prisma/client'

export interface AddressData {
  addressLine: string
  floorDoor?: string
  postalCode: string
  locality: string
  province: string
}

export interface UserData {
  email: string
  emailPersonal?: string
  firstName: string
  lastName: string
  password: string
  role: Role
  address?: AddressData
}
