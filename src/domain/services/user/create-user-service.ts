import { findUserByEmail, insertUser } from '@/db/repositories/user-repository'
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

  const emailAlreadyInUse = await findUserByEmail(email)

  if (emailAlreadyInUse) throw new ConflictError('Email already in use')

  const { name, password, avatarUrl } = params

  const hashedPassword = await hashPassword(password)

  const [user] = await insertUser({
    email,
    name,
    password: hashedPassword,
    avatarUrl,
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _removedPassword, ...formattedUser } = user

  return { user: formattedUser }
}
