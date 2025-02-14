import { faker } from '@faker-js/faker'

import { insertUser } from '@/db/repositories/user-repository'
import type { User } from '@/domain/entities/user'

type RemoveNull<T> = { [Key in keyof T]: NonNullable<T[Key]> }

type UserWithProvider = Omit<User, 'password'>
type UserWithoutProvider = Omit<User, 'provider' | 'providerId'>

export const createUserFactory = {
  createUserWithProvider: (params?: RemoveNull<Partial<UserWithProvider>>) => {
    return {
      ...params,

      name: params?.name || faker.person.fullName(),
      email:
        params?.email?.toLowerCase() || faker.internet.email().toLowerCase(),
      provider: 'GOOGLE' as const,
      providerId: faker.string.uuid(),
    }
  },
  createUserWithPassword: (
    params?: RemoveNull<Partial<UserWithoutProvider>>,
  ) => {
    return {
      ...params,

      name: params?.name || faker.person.fullName(),
      email:
        params?.email?.toLowerCase() || faker.internet.email().toLowerCase(),
      password: params?.password || faker.internet.password(),
    }
  },
}

export async function makeUser<T extends 'provider' | 'password'>({
  type,
  params,
}: {
  type: T
  params?: T extends 'provider'
    ? RemoveNull<Partial<UserWithProvider>>
    : RemoveNull<Partial<UserWithoutProvider>>
}) {
  if (type === 'provider') {
    const rawUser = createUserFactory.createUserWithProvider(params)

    return await insertUser(rawUser)
  }

  if (type === 'password') {
    const rawUser = createUserFactory.createUserWithPassword(params)

    return await insertUser(rawUser)
  }
}
