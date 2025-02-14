import {
  findUserByEmail,
  insertUser,
  updateUser,
} from '@/db/repositories/user-repository'
import { ConflictError } from '@/shared/errors/conflict-error'
import { hashPassword } from '@/utils/password'

export interface CreateUserParams {
  name: string
  password: string
  email: string
  avatarUrl?: string | null
}

export async function createUser(params: CreateUserParams) {
  const email = params.email.toLowerCase()

  const existingUser = await findUserByEmail(email)

  if (existingUser) {
    if (
      existingUser.provider &&
      existingUser.providerId &&
      existingUser.password
    )
      throw new ConflictError('Email already in use')

    if (
      existingUser.provider &&
      existingUser.providerId &&
      !existingUser.password
    ) {
      const hashedPassword = await hashPassword(params.password)

      const [user] = await updateUser(existingUser.id, {
        password: hashedPassword,
      })

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _removedPassword, ...formattedUser } = user

      return { user: formattedUser }
    }
  }

  const { name, password, avatarUrl } = params

  const hashedPassword = await hashPassword(password)

  const [user] = await insertUser({
    ...(existingUser ? { id: existingUser.id } : {}),
    email,
    name,
    password: hashedPassword,
    avatarUrl,
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _removedPassword, ...formattedUser } = user

  return { user: formattedUser }
}
