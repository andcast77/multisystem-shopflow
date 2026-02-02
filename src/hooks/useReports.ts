import { useQuery } from '@tanstack/react-query'
import type {
  SalesStats,
  DailySalesData,
  ProductSalesData,
  PaymentMethodStats,
  SalesByUserData,
} from '@/lib/services/reportService'
import {
  getTodayStats,
  getWeekStats,
  getMonthStats,
  getDailySales,
  getTopProducts,
  getPaymentMethodStats,
  getInventoryStats,
  getSalesByUser,
} from '@/lib/services/reportService'

async function fetchSalesStats(period: 'today' | 'week' | 'month'): Promise<SalesStats> {
  switch (period) {
    case 'today':
      return getTodayStats()
    case 'week':
      return getWeekStats()
    case 'month':
      return getMonthStats()
    default:
      return getTodayStats()
  }
}

async function fetchDailySales(days: number = 30): Promise<DailySalesData[]> {
  return getDailySales(days)
}

async function fetchTopProducts(
  limit: number = 10,
  startDate?: string,
  endDate?: string,
  categoryId?: string
): Promise<ProductSalesData[]> {
  return getTopProducts(
    limit,
    startDate ? new Date(startDate) : undefined,
    endDate ? new Date(endDate) : undefined,
    categoryId
  )
}

async function fetchPaymentMethodStats(
  startDate?: string,
  endDate?: string
): Promise<PaymentMethodStats[]> {
  return getPaymentMethodStats(
    startDate ? new Date(startDate) : undefined,
    endDate ? new Date(endDate) : undefined
  )
}

async function fetchInventoryStats(): Promise<{
  totalProducts: number
  lowStockProducts: number
  outOfStockProducts: number
  totalValue: number
  totalRetailValue: number
  products: Array<{
    id: string
    name: string
    stock: number
    minStock: number
    price: number
    value: number
  }>
}> {
  const data = await getInventoryStats()
  return {
    ...data,
    products: data.products.map((p) => ({
      ...p,
      minStock: p.minStock ?? 0,
    })),
  }
}

export function useSalesStats(period: 'today' | 'week' | 'month' = 'today') {
  return useQuery({
    queryKey: ['reports', 'stats', period],
    queryFn: () => fetchSalesStats(period),
  })
}

export function useDailySales(days: number = 30) {
  return useQuery({
    queryKey: ['reports', 'daily-sales', days],
    queryFn: () => fetchDailySales(days),
  })
}

export function useTopProducts(
  limit: number = 10,
  startDate?: string,
  endDate?: string,
  categoryId?: string
) {
  return useQuery({
    queryKey: ['reports', 'top-products', limit, startDate, endDate, categoryId],
    queryFn: () => fetchTopProducts(limit, startDate, endDate, categoryId),
  })
}

export function usePaymentMethodStats(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['reports', 'payment-methods', startDate, endDate],
    queryFn: () => fetchPaymentMethodStats(startDate, endDate),
  })
}

export function useInventoryStats() {
  return useQuery({
    queryKey: ['reports', 'inventory'],
    queryFn: fetchInventoryStats,
  })
}

async function fetchSalesByUser(
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<SalesByUserData> {
  return getSalesByUser(
    userId,
    startDate ? new Date(startDate) : undefined,
    endDate ? new Date(endDate) : undefined
  )
}

export function useSalesByUser(
  userId: string,
  startDate?: string,
  endDate?: string
) {
  return useQuery({
    queryKey: ['reports', 'sales-by-user', userId, startDate, endDate],
    queryFn: () => fetchSalesByUser(userId, startDate, endDate),
    enabled: !!userId,
  })
}
