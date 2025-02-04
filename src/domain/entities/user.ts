import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'

import type * as schemas from '@/db/schemas'

export type User = InferSelectModel<typeof schemas.users>
export type InsertUserModel = InferInsertModel<typeof schemas.users>
