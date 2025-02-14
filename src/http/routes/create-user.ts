import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

import {
  createUserBodySchema,
  createUserController,
} from '@/http/controllers/users/create-user-controller'

export async function createUserRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        tags: ['users'],
        summary: 'Create a new user',
        body: createUserBodySchema,
        response: {
          201: z.object({
            message: z.literal('User created successfully'),
          }),
          400: z.object({
            message: z.literal('Validation error'),
            errors: z
              .object({
                field: z.enum(['name', 'email', 'password']),
                message: z.string(),
              })
              .array(),
          }),
          409: z.object({
            message: z.literal('Email already in use'),
          }),
        },
      },
    },
    createUserController,
  )

  app.withTypeProvider<ZodTypeProvider>().post(
    '/users',
    {
      schema: {
        tags: ['users'],
        summary: 'Create a new user',
        body: createUserBodySchema,
        response: {
          201: z.object({
            message: z.literal('User created successfully'),
          }),
          400: z.object({
            message: z.literal('Validation error'),
            errors: z
              .object({
                field: z.enum(['name', 'email', 'password']),
                message: z.string(),
              })
              .array(),
          }),
          409: z.object({
            message: z.literal('Email already in use'),
          }),
        },
      },
    },
    createUserController,
  )
}
