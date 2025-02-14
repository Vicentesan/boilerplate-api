import { faker } from '@faker-js/faker'
import { type Credentials } from 'google-auth-library'

import {
  findUserByEmail,
  insertUser,
  updateUser,
} from '@/db/repositories/user-repository'
import { type InsertUserModel, type User } from '@/domain/entities/user'
import { googleClient, oauth2 } from '@/lib/google'
import { BadRequestError } from '@/shared/errors/bad-request-error'
import { ConflictError } from '@/shared/errors/conflict-error'

import { createGoogleUser } from './create-user-with-google'

vi.mock('@/db/repositories/user-repository', () => ({
  findUserByEmail: vi.fn(),
  insertUser: vi.fn(),
  updateUser: vi.fn(),
}))

type MockGoogleClient = {
  getToken: (code: string) => Promise<Credentials>
  setCredentials: (credentials: Credentials) => void
}

vi.mock('@/lib/google', () => ({
  googleClient: {
    getToken: vi.fn(),
    setCredentials: vi.fn(),
  } satisfies MockGoogleClient,
  oauth2: {
    userinfo: {
      get: vi.fn(),
    },
  },
}))

describe('Create Google User', () => {
  const mockCode = 'valid-auth-code'
  const mockUserInfo = {
    data: {
      email: faker.internet.email(),
      name: faker.person.fullName(),
      id: faker.string.uuid(),
      picture: faker.image.avatar(),
    },
  }

  const mockUser: User = {
    id: faker.string.uuid(),
    email: mockUserInfo.data.email.toLowerCase(),
    name: mockUserInfo.data.name,
    provider: 'GOOGLE',
    providerId: mockUserInfo.data.id,
    avatarUrl: mockUserInfo.data.picture,
    password: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(googleClient.getToken).mockImplementation(
      async () =>
        ({
          tokens: { access_token: 'mock-token' },
        }) as Credentials,
    )

    vi.mocked(googleClient.setCredentials).mockImplementation(() => {})

    vi.mocked(oauth2.userinfo.get).mockImplementation(async () => mockUserInfo)

    vi.mocked(findUserByEmail).mockImplementation(async () => null)
    vi.mocked(insertUser).mockImplementation(async () => [mockUser])
  })

  it('should create a new user with Google credentials', async () => {
    const { user } = await createGoogleUser(mockCode)

    expect(googleClient.getToken).toHaveBeenCalledWith(mockCode)
    expect(oauth2.userinfo.get).toHaveBeenCalledWith({ auth: googleClient })
    expect(findUserByEmail).toHaveBeenCalledWith(
      mockUserInfo.data.email.toLowerCase(),
    )

    const expectedInsertData: InsertUserModel = {
      email: mockUserInfo.data.email.toLowerCase(),
      name: mockUserInfo.data.name,
      provider: 'GOOGLE',
      providerId: mockUserInfo.data.id,
      avatarUrl: mockUserInfo.data.picture,
    }
    expect(insertUser).toHaveBeenCalledWith(expectedInsertData)
    expect(user).toBeDefined()
    expect(user.email).toBe(mockUserInfo.data.email.toLowerCase())
  })

  it('should throw BadRequestError when user info is incomplete', async () => {
    const incompleteUserInfo = {
      data: {
        email: undefined,
        name: mockUserInfo.data.name,
        id: mockUserInfo.data.id,
      },
    }

    vi.mocked(oauth2.userinfo.get).mockImplementation(
      async () => incompleteUserInfo,
    )

    await expect(createGoogleUser(mockCode)).rejects.toThrow(
      new BadRequestError('User info not found'),
    )
  })

  it('should throw ConflictError when user exists with both provider and password', async () => {
    const existingUser: User = {
      ...mockUser,
      password: 'hashed_password',
    }

    vi.mocked(findUserByEmail).mockResolvedValueOnce(existingUser)

    await expect(createGoogleUser(mockCode)).rejects.toThrow(
      new ConflictError('Email already in use'),
    )
  })

  it('should add Google provider to existing user with password only', async () => {
    const existingUser: User = {
      ...mockUser,
      provider: null,
      providerId: null,
      password: 'hashed_password',
    }

    const updatedUser: User = {
      ...existingUser,
      provider: 'GOOGLE',
      providerId: mockUserInfo.data.id,
    }

    vi.mocked(findUserByEmail).mockResolvedValueOnce(existingUser)
    vi.mocked(updateUser).mockResolvedValueOnce([updatedUser])

    const result = await createGoogleUser(mockCode)

    expect(result.user).toEqual(
      expect.objectContaining({
        id: existingUser.id,
        email: existingUser.email,
        provider: 'GOOGLE',
        providerId: mockUserInfo.data.id,
      }),
    )
  })

  it('should create user with null avatar when picture is not provided', async () => {
    const userInfoWithoutPicture = {
      data: {
        ...mockUserInfo.data,
        picture: undefined,
      },
    }

    vi.mocked(oauth2.userinfo.get).mockImplementation(
      async () => userInfoWithoutPicture,
    )

    const userWithoutAvatar = {
      ...mockUser,
      avatarUrl: null,
    }
    vi.mocked(insertUser).mockImplementation(async () => [userWithoutAvatar])

    const { user } = await createGoogleUser(mockCode)

    const expectedInsertData: InsertUserModel = {
      email: mockUserInfo.data.email.toLowerCase(),
      name: mockUserInfo.data.name,
      provider: 'GOOGLE',
      providerId: mockUserInfo.data.id,
      avatarUrl: null,
    }
    expect(insertUser).toHaveBeenCalledWith(expectedInsertData)
    expect(user.avatarUrl).toBeNull()
  })
})
