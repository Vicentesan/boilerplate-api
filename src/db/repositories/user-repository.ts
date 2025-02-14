import { eq } from 'drizzle-orm'

import type { InsertUserModel } from '@/domain/entities/user'

import { db } from '..'
import { users } from '../schemas'

export async function insertUser(props: InsertUserModel) {
  return await db.insert(users).values(props).returning()
}

export async function findUserByEmail(email: string) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLocaleLowerCase()))

  if (user.length === 0) return null

  return user[0]
}

export async function updateUser(id: string, props: Partial<InsertUserModel>) {
  return await db.update(users).set(props).where(eq(users.id, id)).returning()
}
