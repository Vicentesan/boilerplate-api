import { BadRequestError } from '@/shared/errors/bad-request-error'

import { createGoogleUser } from './create-user-with-google'

export interface CreateUserParams {
  provider: 'GOOGLE'
  code: string
}

export async function createUser(params: CreateUserParams) {
  const { code, provider } = params

  switch (provider) {
    case 'GOOGLE':
      return createGoogleUser(code)
    default:
      throw new BadRequestError('Invalid provider')
  }
}
