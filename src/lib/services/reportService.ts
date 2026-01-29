import { shopflowApi } from '@/lib/api/client'

export interface SalesStats {
  totalSales: number
  totalRevenue: number
  totalTax: number
  totalDiscount: number
  averageSale: number
  salesCount: number
}

export interface DailySalesData {
  date: string
  sales: number
  revenue: number
}

export interface ProductSalesData {
  productId: string
  productName: string
  quantity: number
  revenue: number
  salesCount: number
}

export interface PaymentMethodStats {
  paymentMethod: string
  count: number
  total: number
}

export async function getSalesStats(
  startDate?: Date,
  endDate?: Date
): Promise<SalesStats> {
  const params = new URLSearchParams()
  if (startDate) params.append('startDate', startDate.toISOString())
  if (endDate) params.append('endDate', endDate.toISOString())

  const response = await shopflowApi.get<{
    success: boolean
    data?: SalesStats
    error?: string
  }>(`/reports/stats?${params.toString()}`)

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Error al obtener estadísticas')
  }

  return response.data
}

export async function getDailySales(
  days: number = 30
): Promise<DailySalesData[]> {
  const params = new URLSearchParams()
  params.append('days', days.toString())

  const response = await shopflowApi.get<{
    success: boolean
    data?: DailySalesData[]
    error?: string
  }>(`/reports/daily?${params.toString()}`)

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Error al obtener ventas diarias')
  }

  return response.data
}

export async function getTopProducts(
  limit: number = 10,
  startDate?: Date,
  endDate?: Date,
  categoryId?: string
): Promise<ProductSalesData[]> {
  const params = new URLSearchParams()
  params.append('limit', limit.toString())
  if (startDate) params.append('startDate', startDate.toISOString())
  if (endDate) params.append('endDate', endDate.toISOString())
  if (categoryId) params.append('categoryId', categoryId)

  const response = await shopflowApi.get<{
    success: boolean
    data?: ProductSalesData[]
    error?: string
  }>(`/reports/top-products?${params.toString()}`)

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Error al obtener productos más vendidos')
  }

  return response.data
}

export async function getPaymentMethodStats(
  startDate?: Date,
  endDate?: Date
): Promise<PaymentMethodStats[]> {
  const params = new URLSearchParams()
  if (startDate) params.append('startDate', startDate.toISOString())
  if (endDate) params.append('endDate', endDate.toISOString())

  const response = await shopflowApi.get<{
    success: boolean
    data?: PaymentMethodStats[]
    error?: string
  }>(`/reports/payment-methods?${params.toString()}`)

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Error al obtener estadísticas de métodos de pago')
  }

  return response.data
}

export async function getInventoryStats() {
  const response = await shopflowApi.get<{
    success: boolean
    data?: {
      totalProducts: number
      lowStockProducts: number
      outOfStockProducts: number
      totalValue: number
      totalRetailValue: number
      products: Array<{
        id: string
        name: string
        stock: number
        minStock: number | null
        price: number
        value: number
      }>
    }
    error?: string
  }>('/reports/inventory')

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Error al obtener estadísticas de inventario')
  }

  return response.data
}

export async function getTodayStats() {
  const response = await shopflowApi.get<{
    success: boolean
    data?: SalesStats
    error?: string
  }>('/reports/today')

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Error al obtener estadísticas del día')
  }

  return response.data
}

export async function getWeekStats() {
  const response = await shopflowApi.get<{
    success: boolean
    data?: SalesStats
    error?: string
  }>('/reports/week')

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Error al obtener estadísticas de la semana')
  }

  return response.data
}

export async function getMonthStats() {
  const response = await shopflowApi.get<{
    success: boolean
    data?: SalesStats
    error?: string
  }>('/reports/month')

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Error al obtener estadísticas del mes')
  }

  return response.data
}

export interface SalesByUserData {
  userId: string
  userName: string
  userEmail: string
  salesCount: number
  totalRevenue: number
  averageSale: number
}

export async function getSalesByUser(
  userId: string,
  startDate?: Date,
  endDate?: Date
): Promise<SalesByUserData> {
  const params = new URLSearchParams()
  if (startDate) params.append('startDate', startDate.toISOString())
  if (endDate) params.append('endDate', endDate.toISOString())

  const response = await shopflowApi.get<{
    success: boolean
    data?: SalesByUserData
    error?: string
  }>(`/reports/by-user/${userId}?${params.toString()}`)

  if (!response.success || !response.data) {
    throw new Error(response.error || `Error al obtener estadísticas del usuario ${userId}`)
  }

  return response.data
}
