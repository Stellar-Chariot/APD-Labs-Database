"use client"

/**
 * Base service class that provides common functionality for all API services.
 * This helps standardize error handling, caching, and request patterns.
 */

import { useState, useEffect, useRef } from "react"

// Generic type for API responses
export interface ApiResponse<T> {
  data: T | null
  error: Error | null
  isLoading: boolean
}

// Options for API requests
export interface ApiOptions {
  cacheKey?: string
  cacheDuration?: number // in milliseconds
  retryCount?: number
  retryDelay?: number // in milliseconds
}

// Simple in-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {}

export class BaseService {
  // Method to make API requests with standardized error handling and caching
  protected async apiRequest<T>(requestFn: () => Promise<T>, options: ApiOptions = {}): Promise<T> {
    const { cacheKey, cacheDuration = 5 * 60 * 1000, retryCount = 3, retryDelay = 1000 } = options

    // Check cache if cacheKey is provided
    if (cacheKey && cache[cacheKey]) {
      const cachedData = cache[cacheKey]
      if (Date.now() - cachedData.timestamp < cacheDuration) {
        return cachedData.data
      }
    }

    // Try the request with retries
    let lastError: Error | null = null
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        const data = await requestFn()

        // Cache the result if cacheKey is provided
        if (cacheKey) {
          cache[cacheKey] = { data, timestamp: Date.now() }
        }

        return data
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        // Don't wait on the last attempt
        if (attempt < retryCount) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)))
        }
      }
    }

    throw lastError || new Error("Request failed after retries")
  }

  // Hook for using API requests in components
  protected useApiRequest<T>(
    requestFn: () => Promise<T>,
    dependencies: any[] = [],
    options: ApiOptions = {},
  ): ApiResponse<T> {
    const [state, setState] = useState<ApiResponse<T>>({
      data: null,
      error: null,
      isLoading: true,
    })

    const isMountedRef = useRef(true)

    useEffect(() => {
      isMountedRef.current = true

      const fetchData = async () => {
        setState((prev) => ({ ...prev, isLoading: true }))

        try {
          const data = await this.apiRequest(requestFn, options)
          if (isMountedRef.current) {
            setState({ data, error: null, isLoading: false })
          }
        } catch (error) {
          if (isMountedRef.current) {
            setState({
              data: null,
              error: error instanceof Error ? error : new Error(String(error)),
              isLoading: false,
            })
          }
        }
      }

      fetchData()

      return () => {
        isMountedRef.current = false
      }
    }, dependencies)

    return state
  }

  // Method to clear cache
  protected clearCache(cacheKey?: string) {
    if (cacheKey) {
      delete cache[cacheKey]
    } else {
      Object.keys(cache).forEach((key) => delete cache[key])
    }
  }
}

