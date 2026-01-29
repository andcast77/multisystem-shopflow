import { shopflowApi } from '@/lib/api/client'
import type { UpdateUserPreferencesInput } from '@/lib/validations/userPreferences'

export async function getUserPreferences(userId: string) {
  const response = await shopflowApi.get<{ success: boolean; data: any }>(
    `/api/user-preferences/${userId}`
  )

  if (!response.success) {
    throw new Error(response.error || 'Error al obtener preferencias de usuario')
  }

  return response.data
}

export async function updateUserPreferences(
  userId: string,
  data: UpdateUserPreferencesInput
) {
  const response = await shopflowApi.put<{ success: boolean; data: any; error?: string }>(
    `/api/user-preferences/${userId}`,
    data
  )

  if (!response.success) {
    throw new Error(response.error || 'Error al actualizar preferencias de usuario')
  }

  return response.data
}
