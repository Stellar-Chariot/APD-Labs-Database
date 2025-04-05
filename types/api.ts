// API Response types
export interface ApiResponse<T> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
}

// API Error types
export interface ApiError {
  message: string
  status?: number
  code?: string
  errors?: Record<string, string[]>
  originalError?: unknown
}

// Request options
export interface ApiRequestOptions {
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean | undefined>
  timeout?: number
  retries?: number
  cache?: RequestCache
  signal?: AbortSignal
}

// API Client interface
export interface ApiClient {
  get<T>(url: string, options?: ApiRequestOptions): Promise<T>
  post<T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<T>
  put<T>(url: string, data?: unknown, options?: ApiRequestOptions): Promise<T>
  delete<T>(url: string, options?: ApiRequestOptions): Promise<T>
  request<T>(method: string, url: string, data?: unknown, options?: ApiRequestOptions): Promise<T>
}

