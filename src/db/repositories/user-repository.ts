import { eq } from 'drizzle-orm'

import type { InsertUserModel } from '@/domain/entities/user'

import { db } from '..'
import { users } from '../schemas'

export async function insertUser(props: InsertUserModel) {
  return await db.insert(users).values(props).returning()
}

export async function findUserByEmail(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLocaleLowerCase()))

  return user
}
