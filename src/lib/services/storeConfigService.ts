import { shopflowApi } from '@/lib/api/client'
import type { UpdateStoreConfigInput } from '@/lib/validations/storeConfig'

export async function getStoreConfig() {
  const response = await shopflowApi.get<{ success: boolean; data: any }>('/api/store-config')

  if (!response.success) {
    throw new Error(response.error || 'Error al obtener configuración de tienda')
  }

  return response.data
}

export async function updateStoreConfig(data: UpdateStoreConfigInput) {
  const response = await shopflowApi.put<{ success: boolean; data: any; error?: string }>(
    '/api/store-config',
    data
  )

  if (!response.success) {
    throw new Error(response.error || 'Error al actualizar configuración de tienda')
  }

  return response.data
}

export async function getNextInvoiceNumber(): Promise<string> {
  const response = await shopflowApi.post<{ success: boolean; data: { invoiceNumber: string }; error?: string }>(
    '/api/store-config/next-invoice-number',
    {}
  )

  if (!response.success) {
    throw new Error(response.error || 'Error al obtener siguiente número de factura')
  }

  return response.data.invoiceNumber
}
