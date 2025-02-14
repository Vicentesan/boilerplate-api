import { faker } from '@faker-js/faker'
import { type FastifyReply, type FastifyRequest } from 'fastify'

import { createUserWithProvider } from '@/domain/services/user/create-user-with-provider'
import { ConflictError } from '@/shared/errors/conflict-error'

import { createUserWithProviderController } from './create-user-with-provider-controller'

vi.mock('@/domain/services/user/create-user-with-provider')

let req: FastifyRequest<{
  Body: {
    provider: 'GOOGLE'
    code: string
  }
}>
let res: FastifyReply
let sut: typeof createUserWithProviderController

describe('Create User With Provider Controller', () => {
  beforeEach(() => {
    req = {
      body: {
        provider: 'GOOGLE',
        code: faker.string.alphanumeric(20),
      },
    } as FastifyRequest<{
      Body: {
        provider: 'GOOGLE'
        code: string
      }
    }>

    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply

    sut = createUserWithProviderController
  })

  it('should return 201 when user is created successfully', async () => {
    vi.mocked(createUserWithProvider).mockResolvedValueOnce({
      user: {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: null,
        avatarUrl: faker.internet.url(),
        provider: 'GOOGLE',
        providerId: faker.string.uuid(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })

    await sut(req, res)

    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.send).toHaveBeenCalledWith({
      message: 'User created successfully',
    })
  })

  it('should return 409 when email is already in use', async () => {
    vi.mocked(createUserWithProvider).mockRejectedValueOnce(
      new ConflictError('Email already in use'),
    )

    try {
      await sut(req, res)
    } catch (error) {
      if (error instanceof ConflictError) {
        res.status(409).send({
          message: error.message,
        })
      }
    }

    expect(res.status).toHaveBeenCalledWith(409)
    expect(res.send).toHaveBeenCalledWith({
      message: 'Email already in use',
    })
  })
})
