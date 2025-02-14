import z from 'zod'

export const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['dev', 'prod', 'test']).default('dev'),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string().url(),
  HOST: z.string().default('0.0.0.0'),
})

export const env = envSchema.parse(process.env)
