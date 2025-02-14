import { type FastifyReply, type FastifyRequest } from 'fastify'
import { z } from 'zod'

import { createUser } from '@/domain/services/user/create-user-with-password-service'
import { passwordSchema } from '@/utils/password'

export const createUserBodySchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: passwordSchema,
  avatarUrl: z.string().url().nullable(),
})

export async function createUserController(
  req: FastifyRequest<{
    Body: z.infer<typeof createUserBodySchema>
  }>,
  res: FastifyReply,
) {
  const { name, email, password, avatarUrl } = req.body

  await createUser({
    name,
    email,
    password,
    avatarUrl,
  })

  return res.status(201).send({
    message: 'User created successfully',
  })
}
