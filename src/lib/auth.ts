// Auth helpers - use API for user resolution (no Prisma in frontend)
import type { User } from '@/types'
import type { UserWithRole, LoginCredentials } from '@/types'
import { authApi, apiClient } from '@/lib/api/client'

export async function hashPassword(_password: string): Promise<string> {
  throw new Error('hashPassword is only available on the server. Use the API for auth.')
}

export async function verifyPassword(
  _password: string,
  _hashedPassword: string
): Promise<boolean> {
  throw new Error('verifyPassword is only available on the server. Use the API for auth.')
}

export function generateToken(_user: Pick<User, 'id' | 'email' | 'role'>): string {
  throw new Error('generateToken is only available on the server. Use the API for auth.')
}

/**
 * Authenticate via API (no Prisma in frontend)
 */
export async function authenticate(
  credentials: LoginCredentials
): Promise<UserWithRole | null> {
  if (typeof window !== 'undefined') {
    throw new Error('authenticate solo puede usarse en el servidor. Usa la API /api/auth/login')
  }

  const response = await authApi.post<{
    success: boolean
    user?: UserWithRole
    error?: string
  }>('/login', {
    email: credentials.email,
    password: credentials.password,
  })

  if (!response.success || !response.user || !response.user.active) {
    return null
  }

  return response.user
}

/**
 * Get user by ID via API (no Prisma in frontend)
 */
export async function getUserById(id: string): Promise<UserWithRole | null> {
  if (typeof window !== 'undefined') {
    throw new Error('getUserById solo puede usarse en el servidor. Usa la API /api/auth/me')
  }

  const response = await apiClient.get<{
    success?: boolean
    data?: UserWithRole
    error?: string
  }>(`/api/users/${id}`)

  const user = response && 'data' in response ? response.data : null
  return user ?? null
}
