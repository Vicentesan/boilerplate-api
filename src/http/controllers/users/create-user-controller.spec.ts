import { faker } from '@faker-js/faker'
import { type FastifyReply, type FastifyRequest } from 'fastify'

import { createUser } from '@/domain/services/user/create-user-with-password-service'
import { ConflictError } from '@/shared/errors/conflict-error'

import { createUserFactory } from '../../../../tests/factories/make-user'
import { createUserController } from './create-user-controller'

vi.mock('@/domain/services/user/create-user-with-password-service')

let req: FastifyRequest<{
  Body: {
    name: string
    email: string
    password: string
    avatarUrl: string | null
  }
}>
let res: FastifyReply
let sut: typeof createUserController

describe('Create User Controller', () => {
  beforeEach(() => {
    req = {
      body: createUserFactory.createUserWithPassword(),
    } as FastifyRequest<{
      Body: {
        name: string
        email: string
        password: string
        avatarUrl: string | null
      }
    }>

    res = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn(),
    } as unknown as FastifyReply

    sut = createUserController
  })

  it('should return 201 when user is created successfully', async () => {
    vi.mocked(createUser).mockResolvedValueOnce({
      user: {
        id: faker.string.uuid(),
        name: req.body.name,
        email: req.body.email,
        avatarUrl: req.body.avatarUrl,
        provider: null,
        providerId: null,
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
    vi.mocked(createUser).mockRejectedValueOnce(
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
