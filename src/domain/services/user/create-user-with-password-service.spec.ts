import { faker } from '@faker-js/faker'

import { ConflictError } from '@/shared/errors/conflict-error'

/**
 * import { findUserByEmail } from '@/db/repositories/user-repository'
 * import { ConflictError } from '@/shared/errors/conflict-error'
 */
import {
  createUserFactory,
  makeUser,
} from '../../../../tests/factories/make-user'
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

  it('should not be able to create a user with an email that already exists', async () => {
    const email = faker.internet.email()

    const params = createUserFactory.createUserWithPassword({
      email,
    })

    await makeUser({ type: 'password', params })

    await expect(createUser(params)).rejects.toBeInstanceOf(ConflictError)
  })
})
