import { defineConfig } from 'drizzle-kit'

import { env } from '@/env'

export default defineConfig({
  out: './priv',
  schema: './src/db/schemas/index.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  migrations: {
    prefix: 'timestamp',
  },
})
