// API Client for ShopFlow Frontend
// Points to unified API with module prefixes

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

class ApiClient {
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', ...options })
  }

  async post<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  }

  async put<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  }

  async delete<T>(endpoint: string, data?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    })
  }
}

// Unified API Client
export const apiClient = new ApiClient(API_URL)
const _apiClient = apiClient

// ShopFlow API Client (uses /api/shopflow prefix)
export const shopflowApi = {
  get: <T>(endpoint: string, options?: RequestInit) => apiClient.get<T>(`/api/shopflow${endpoint}`, options),
  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) => apiClient.post<T>(`/api/shopflow${endpoint}`, data, options),
  put: <T>(endpoint: string, data?: unknown, options?: RequestInit) => apiClient.put<T>(`/api/shopflow${endpoint}`, data, options),
  delete: <T>(endpoint: string, data?: unknown, options?: RequestInit) => apiClient.delete<T>(`/api/shopflow${endpoint}`, data, options),
}

// Auth API Client (uses /api/auth prefix)
export const authApi = {
  get: <T>(endpoint: string, options?: RequestInit) => apiClient.get<T>(`/api/auth${endpoint}`, options),
  post: <T>(endpoint: string, data?: unknown, options?: RequestInit) => apiClient.post<T>(`/api/auth${endpoint}`, data, options),
  put: <T>(endpoint: string, data?: unknown, options?: RequestInit) => apiClient.put<T>(`/api/auth${endpoint}`, data, options),
  delete: <T>(endpoint: string, options?: RequestInit) => apiClient.delete<T>(`/api/auth${endpoint}`, options),
}

// Generic API response types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
