import z from 'zod'

export const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(['dev', 'prod', 'test']).default('dev'),
  HOST: z.string().default('0.0.0.0'),
  BASE_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
