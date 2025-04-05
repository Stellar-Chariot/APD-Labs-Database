"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { useUI } from "@/hooks/use-ui"
import { useErrorHandler } from "@/hooks/use-error-handler"
import { categorizeError } from "@/lib/api-client"

export type ApiStatus = "idle" | "loading" | "success" | "error"

interface UseApiOptions {
  showSuccessNotification?: boolean
  showErrorNotification?: boolean
  successMessage?: string
  errorMessage?: string
  context?: string
  autoExecute?: boolean
}

export function useApi<T, P extends any[]>(apiFunction: (...args: P) => Promise<T>, options: UseApiOptions = {}) {
  const [data, setData] = useState<T | null>(null)
  const [status, setStatus] = useState<ApiStatus>("idle")
  const [loading, setLoading] = useState(false)
  const lastExecutedRef = useRef<number | null>(null) // Use ref instead of state
  const { addNotification } = useUI()
  const { error, handleError, clearError } = useErrorHandler({
    showNotification: options.showErrorNotification !== false,
  })

  const {
    showSuccessNotification = false,
    successMessage,
    errorMessage,
    context = apiFunction.name || "API call",
    autoExecute = false,
  } = options

  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      try {
        setLoading(true)
        setStatus("loading")
        clearError()
        lastExecutedRef.current = Date.now() // Use ref instead of state

        const result = await apiFunction(...args)
        setData(result)
        setStatus("success")

        if (showSuccessNotification) {
          addNotification({
            type: "success",
            message: successMessage || "Operation completed successfully",
          })
        }

        return result
      } catch (err) {
        setStatus("error")

        // Categorize the error to provide more specific handling
        const errorDetails = categorizeError(err)

        // Use the error handler to process the error
        const errorObj = handleError(err, context)

        // If a custom error message was provided, show it instead
        if (errorMessage) {
          addNotification({
            type: "error",
            message: errorMessage,
          })
        }

        // Log additional context for debugging
        console.debug(`API Error Context: ${context}`, {
          error: errorObj,
          args,
          errorDetails,
        })

        return null
      } finally {
        // Keep loading state for at least 500ms to prevent UI flashing
        const elapsed = Date.now() - (lastExecutedRef.current || 0)
        if (elapsed < 500) {
          await new Promise((resolve) => setTimeout(resolve, 500 - elapsed))
        }
        setLoading(false)
        setStatus("idle")
      }
    },
    [
      apiFunction,
      addNotification,
      clearError,
      context,
      errorMessage,
      handleError,
      showSuccessNotification,
      successMessage,
    ], // Removed lastExecuted from dependencies
  )

  // Auto-execute the API call if autoExecute is true
  useEffect(() => {
    if (autoExecute) {
      execute()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoExecute]) // Only depend on autoExecute, not execute

  const isLoading = status === "loading" || loading
  const isError = status === "error"
  const isSuccess = status === "success"

  return {
    data,
    loading: isLoading,
    error,
    status,
    isLoading,
    isError,
    isSuccess,
    execute,
    clearError,
    refresh: execute,
  }
}

