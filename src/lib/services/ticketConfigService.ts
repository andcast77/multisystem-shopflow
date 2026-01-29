import { shopflowApi } from '@/lib/api/client'
import type { UpdateTicketConfigInput } from '@/lib/validations/ticketConfig'
import { TicketType } from '@/types'

export async function getTicketConfig(storeId?: string) {
  const params = storeId ? new URLSearchParams({ storeId }) : undefined
  const url = `/api/ticket-config${params ? `?${params.toString()}` : ''}`
  
  const response = await shopflowApi.get<{ success: boolean; data: any }>(url)

  if (!response.success) {
    throw new Error(response.error || 'Error al obtener configuración de tickets')
  }

  return response.data
}

export async function updateTicketConfig(
  data: UpdateTicketConfigInput,
  storeId?: string
) {
  const params = storeId ? new URLSearchParams({ storeId }) : undefined
  const url = `/api/ticket-config${params ? `?${params.toString()}` : ''}`
  
  const response = await shopflowApi.put<{ success: boolean; data: any; error?: string }>(
    url,
    { ...data, storeId }
  )

  if (!response.success) {
    throw new Error(response.error || 'Error al actualizar configuración de tickets')
  }

  return response.data
}
