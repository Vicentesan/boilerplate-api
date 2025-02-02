import z from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().default(3333),
  BASE_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  HOST: z.string().default('0.0.0.0'),
})

export const env = envSchema.parse(process.env)
