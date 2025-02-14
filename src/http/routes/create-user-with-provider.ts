import type { FastifyInstance } from 'fastify'
import { type ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { createUserWithProviderController } from '../controllers/users/create-user-with-provider-controller'

const createUserWithProviderSchema = z.object({
  provider: z.literal('GOOGLE'),
  code: z.string(),
})

const userResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  password: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  provider: z.enum(['GOOGLE']).nullable(),
  providerId: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export async function createUserWithProviderRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users/provider',
    {
      schema: {
        tags: ['users'],
        summary: 'Create a new user with a provider (e.g. Google)',
        body: createUserWithProviderSchema,
        response: {
          201: z.object({
            user: userResponseSchema,
          }),
          400: z.object({
            message: z.literal('Invalid or expired authorization code'),
          }),
          409: z.object({
            message: z.literal('Email already in use'),
          }),
        },
      },
    },
    createUserWithProviderController,
  )
}
