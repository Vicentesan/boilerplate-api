import { faker } from '@faker-js/faker'

import { createUserFactory, makeUser } from '@/../tests/factories/make-user'
import { ConflictError } from '@/shared/errors/conflict-error'

import { createUser } from './create-user-with-password-service'

describe('Create User Service', () => {
  it('should be able to create a user with valid params', async () => {
    const { password, ...params } = createUserFactory.createUserWithPassword({
      password: 'password-123',
    })

    const user = await createUser({
      ...params,
      password,
    })

    expect(user).toEqual(
      expect.objectContaining({
        user: expect.objectContaining({
          ...params,
        }),
      }),
    )
  })

  it('should not be able to create a user with an email that already exists with both provider and password', async () => {
    const email = faker.internet.email()

    await makeUser({
      type: 'provider',
      params: {
        email,
      },
    })

    const params = createUserFactory.createUserWithPassword({
      email,
      password: 'password-123',
    })

    await createUser(params)

    await expect(createUser(params)).rejects.toBeInstanceOf(ConflictError)
  })

  it('should be able to add password to existing user with provider', async () => {
    const email = faker.internet.email()

    const existingUser = await makeUser({
      type: 'provider',
      params: {
        email,
      },
    })

    if (!existingUser) throw new Error('User not found')

    const params = createUserFactory.createUserWithPassword({
      name: existingUser[0].name,
      email: existingUser[0].email,
      password: 'password-123',
    })

    const result = await createUser(params)

    if (!existingUser) throw new Error('User not found')

    expect(result.user).toEqual(
      expect.objectContaining({
        id: existingUser[0].id,
        email: email.toLowerCase(),
        provider: 'GOOGLE',
        providerId: existingUser[0].providerId,
      }),
    )
  })
})
