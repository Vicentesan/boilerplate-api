import { eq } from 'drizzle-orm'

import type { InsertUserModel } from '@/domain/entities/user'

import { db } from '..'
import { users } from '../schemas'

export function insertUser(props: InsertUserModel) {
  return db.insert(users).values(props)
}

export function findUserByEmail(email: string) {
  return db.query.users.findFirst({
    where: eq(users.email, email),
  })
}
