// Simplified product service that uses remote APIs
import { shopflowApi } from '@/lib/api/client'
import type { Product } from '@/types'
import type { CreateProductInput, UpdateProductInput, ProductQueryInput } from '@/lib/validations/product'

export interface ProductsResponse {
  products: Product[]
  pagination: { page: number; limit: number; total: number; totalPages: number }
}

export async function getProducts(query: ProductQueryInput = { page: 1, limit: 20 }): Promise<ProductsResponse> {
  const {
    search,
    categoryId,
    active,
    minPrice,
    maxPrice,
    lowStock,
    page = 1,
    limit = 20,
  } = query

  // Build query parameters
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  })

  if (search) params.append('search', search)
  if (categoryId) params.append('categoryId', categoryId)
  if (active !== undefined) params.append('active', active.toString())
  if (minPrice !== undefined) params.append('minPrice', minPrice.toString())
  if (maxPrice !== undefined) params.append('maxPrice', maxPrice.toString())
  if (lowStock !== undefined) params.append('lowStock', lowStock.toString())

  return await shopflowApi.get<ProductsResponse>(`/products?${params}`)
}

export async function getProductById(id: string): Promise<Product> {
  return await shopflowApi.get<Product>(`/products/${id}`)
}

export async function getProductBySku(sku: string) {
  return await shopflowApi.get(`/products?sku=${sku}`)
}

export async function getProductByBarcode(barcode: string) {
  return await shopflowApi.get(`/products?barcode=${barcode}`)
}

export async function createProduct(data: CreateProductInput): Promise<Product> {
  return await shopflowApi.post<Product>('/products', data)
}

export async function updateProduct(id: string, data: UpdateProductInput): Promise<Product> {
  return await shopflowApi.put<Product>(`/products/${id}`, data)
}

export async function deleteProduct(id: string) {
  return await shopflowApi.delete(`/products/${id}`)
}

export async function getLowStockProducts(minStockThreshold?: number) {
  const params = minStockThreshold ? `?minStockThreshold=${minStockThreshold}` : ''
  return await shopflowApi.get(`/products/low-stock${params}`)
}

export async function updateProductInventory(id: string, data: { stock: number; minStock?: number }) {
  return await shopflowApi.put(`/products/${id}/inventory`, data)
}
