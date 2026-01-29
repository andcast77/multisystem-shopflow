import { shopflowApi } from '@/lib/api/client'
import { ApiError, ErrorCodes } from '@/lib/utils/errors'
import type { CreateSupplierInput, UpdateSupplierInput, SupplierQueryInput } from '@/lib/validations/supplier'

export async function getSuppliers(query: SupplierQueryInput = {}) {
  const { search, active } = query

  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (active !== undefined) params.append('active', active.toString())

  const response = await shopflowApi.get<{ success: boolean; data: any[] }>(
    `/api/suppliers?${params.toString()}`
  )

  if (!response.success) {
    throw new ApiError(500, response.error || 'Error al obtener proveedores', ErrorCodes.INTERNAL_ERROR)
  }

  return response.data
}

export async function getSupplierById(id: string) {
  const response = await shopflowApi.get<{ success: boolean; data: any; error?: string }>(
    `/api/suppliers/${id}`
  )

  if (!response.success) {
    throw new ApiError(404, response.error || 'Supplier not found', ErrorCodes.NOT_FOUND)
  }

  return response.data
}

export async function createSupplier(data: CreateSupplierInput) {
  const response = await shopflowApi.post<{ success: boolean; data: any; error?: string }>(
    '/api/suppliers',
    data
  )

  if (!response.success) {
    throw new ApiError(400, response.error || 'Error al crear proveedor', ErrorCodes.VALIDATION_ERROR)
  }

  return response.data
}

export async function updateSupplier(id: string, data: UpdateSupplierInput) {
  const response = await shopflowApi.put<{ success: boolean; data: any; error?: string }>(
    `/api/suppliers/${id}`,
    data
  )

  if (!response.success) {
    if (response.error?.includes('no encontrado')) {
      throw new ApiError(404, 'Supplier not found', ErrorCodes.NOT_FOUND)
    }
    throw new ApiError(400, response.error || 'Error al actualizar proveedor', ErrorCodes.VALIDATION_ERROR)
  }

  return response.data
}

export async function deleteSupplier(id: string) {
  const response = await shopflowApi.delete<{ success: boolean; data?: any; error?: string }>(
    `/api/suppliers/${id}`
  )

  if (!response.success) {
    if (response.error?.includes('no encontrado')) {
      throw new ApiError(404, 'Supplier not found', ErrorCodes.NOT_FOUND)
    }
    if (response.error?.includes('tiene productos')) {
      throw new ApiError(400, response.error, ErrorCodes.VALIDATION_ERROR)
    }
    throw new ApiError(400, response.error || 'Error al eliminar proveedor', ErrorCodes.VALIDATION_ERROR)
  }

  return response.data || { success: true }
}
