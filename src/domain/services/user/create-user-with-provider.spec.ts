import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createGoogleUser } from './create-user-with-google'
import { createUserWithProvider } from './create-user-with-provider'

vi.mock('./create-user-with-google', () => ({
  createGoogleUser: vi.fn(),
}))

describe('createUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('with Google provider', () => {
    const mockCode = 'valid-google-auth-code'
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      password: null,
      provider: 'GOOGLE' as const,
      providerId: 'google-123',
      avatarUrl: 'https://example.com/avatar.jpg',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    it('should call createGoogleUser with the provided code', async () => {
      vi.mocked(createGoogleUser).mockResolvedValueOnce({ user: mockUser })

      const result = await createUserWithProvider({
        provider: 'GOOGLE',
        code: mockCode,
      })

      expect(createGoogleUser).toHaveBeenCalledWith(mockCode)
      expect(createGoogleUser).toHaveBeenCalledTimes(1)
      expect(result).toEqual({ user: mockUser })
    })

    it('should propagate errors from createGoogleUser', async () => {
      const error = new Error('Google API error')
      vi.mocked(createGoogleUser).mockRejectedValueOnce(error)

      await expect(
        createUserWithProvider({
          provider: 'GOOGLE',
          code: mockCode,
        }),
      ).rejects.toThrow(error)
    })
  })
})
