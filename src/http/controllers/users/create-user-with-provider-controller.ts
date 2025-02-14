import { type FastifyReply, type FastifyRequest } from 'fastify'
import { z } from 'zod'

import { createUserWithProvider } from '@/domain/services/user/create-user-with-provider'

export const createUserWithProviderBodySchema = z.object({
  provider: z.literal('GOOGLE'),
  code: z.string(),
})

export async function createUserWithProviderController(
  req: FastifyRequest<{
    Body: z.infer<typeof createUserWithProviderBodySchema>
  }>,
  res: FastifyReply,
) {
  const { provider, code } = req.body

  await createUserWithProvider({
    provider,
    code,
  })

  return res.status(201).send({
    message: 'User created successfully',
  })
}
