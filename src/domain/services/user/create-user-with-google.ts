import { findUserByEmail, insertUser } from '@/db/repositories/user-repository'
import { googleClient, oauth2 } from '@/lib/google'
import { BadRequestError } from '@/shared/errors/bad-request-error'
import { ConflictError } from '@/shared/errors/conflict-error'

export async function createGoogleUser(code: string) {
  try {
    const { tokens } = await googleClient.getToken(code)
    googleClient.setCredentials(tokens)

    const userInfo = await oauth2.userinfo.get({ auth: googleClient })

    if (!userInfo.data.email || !userInfo.data.name || !userInfo.data.id) {
      throw new BadRequestError('User info not found')
    }

    const email = userInfo.data.email.toLowerCase()
    const existingUser = await findUserByEmail(email)

    if (existingUser) {
      throw new ConflictError('Email already in use')
    }

    const [user] = await insertUser({
      email,
      name: userInfo.data.name,
      provider: 'GOOGLE',
      providerId: userInfo.data.id,
      avatarUrl: userInfo.data.picture ?? null,
    })

    return { user }
  } catch (error) {
    if (error instanceof Error && 'response' in error) {
      const gaxiosError = error as unknown as {
        response?: { data?: { error?: string } }
      }
      if (gaxiosError.response?.data?.error === 'invalid_grant') {
        throw new BadRequestError('Invalid or expired authorization code')
      }
    }
    throw error
  }
}
