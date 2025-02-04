import bcryptjs from 'bcryptjs'
import { z } from 'zod'

export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters long' })
  .refine(
    (password) => {
      const hasNumber = /\d/.test(password)
      const hasUppercase = /[A-Z]/.test(password)
      const hasLowercase = /[a-z]/.test(password)
      const hasSpecialChar = /[!@#$%^&*]/.test(password)
      return hasNumber && hasUppercase && hasLowercase && hasSpecialChar
    },
    {
      message:
        'Password must contain at least one number, one uppercase letter, one lowercase letter, and one special character',
    },
  )

export async function hashPassword(password: string) {
  return await bcryptjs.hash(password, 10)
}

export async function comparePassword(
  password: string,
  hashedPassword: string,
) {
  return await bcryptjs.compare(password, hashedPassword)
}
