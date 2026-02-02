'use client'

import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/lib/api/client'
import type { UserRole } from '@/types'

export interface CompanyInfo {
  id: string
  name: string
  workifyEnabled: boolean
  shopflowEnabled: boolean
}

export interface CurrentUser {
  id: string
  email: string
  name: string
  role: UserRole
  companyId?: string
  company?: CompanyInfo
  membershipRole?: string
  isSuperuser?: boolean
  createdAt: Date
  updatedAt: Date
}

type MeResponse =
  | { success: true; data: { id: string; email: string; name: string | null; role: string; active?: boolean; companyId?: string; membershipRole?: string; isSuperuser?: boolean; createdAt: string; updatedAt: string } }
  | { success: false; error?: string }
  | { user: CurrentUser }

/**
 * Get current user from API (token sent via client from cookie)
 */
async function getCurrentUser(): Promise<CurrentUser> {
  const response = await authApi.get<MeResponse>('/me')
  const user =
    response && typeof response === 'object' && 'data' in response && response.success && response.data
      ? response.data
      : response && typeof response === 'object' && 'user' in response
        ? (response as { user: CurrentUser }).user
        : null
  if (!user) {
    throw new Error((response && typeof response === 'object' && 'error' in response ? (response as { error?: string }).error : undefined) || 'Failed to fetch user')
  }
  const data = response && typeof response === 'object' && 'data' in response && response.success && response.data ? response.data : user
  const dataObj = data && typeof data === 'object' ? data as Record<string, unknown> : null
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? '',
    role: user.role as UserRole,
    companyId: dataObj?.companyId as string | undefined,
    company: dataObj?.company as CompanyInfo | undefined,
    membershipRole: dataObj?.membershipRole as string | undefined,
    isSuperuser: dataObj?.isSuperuser as boolean | undefined,
    createdAt: typeof user.createdAt === 'string' ? new Date(user.createdAt) : user.createdAt,
    updatedAt: typeof user.updatedAt === 'string' ? new Date(user.updatedAt) : user.updatedAt,
  }
}

/**
 * Hook to get current user information
 */
export function useUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
