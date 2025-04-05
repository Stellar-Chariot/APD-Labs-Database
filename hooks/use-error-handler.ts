"use client"

import { useState, useCallback } from "react"
import { useUI } from "@/hooks/use-ui"
import { categorizeError } from "@/lib/api-client"

export type ErrorSeverity = "error" | "warning" | "info"

interface ErrorHandlerOptions {
  showNotification?: boolean
  logToConsole?: boolean
  logToService?: boolean
  severity?: ErrorSeverity
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
  const [error, setError] = useState<Error | null>(null)
  const { addNotification } = useUI()

  const { showNotification = true, logToConsole = true, logToService = false, severity = "error" } = options

  const handleError = useCallback(
    (err: unknown, context?: string) => {
      // Ensure we have an Error object
      const errorObj = err instanceof Error ? err : new Error(String(err))

      // Skip handling for redirects
      if (errorObj.constructor && errorObj.constructor.name === "Redirect") {
        return errorObj
      }

      // Set the error state
      setError(errorObj)

      // Categorize the error
      const errorDetails = categorizeError(err)

      // Create a structured error message
      const errorMessage = errorDetails.message || errorObj.message || "An unknown error occurred"

      // Log to console if enabled
      if (logToConsole) {
        console.error(`Error${context ? ` in ${context}` : ""}:`, errorObj, errorDetails)
      }

      // Show notification if enabled
      if (showNotification) {
        addNotification({
          type: severity,
          message: errorMessage,
        })
      }

      // Log to error service if enabled
      if (logToService) {
        // Here you would integrate with an error logging service
        // Example: errorLoggingService.logError(errorObj, { context, ...errorDetails })
        console.info("Would log to error service:", { error: errorObj, context, details: errorDetails })
      }

      return errorObj
    },
    [addNotification, logToConsole, logToService, showNotification, severity],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    error,
    handleError,
    clearError,
    hasError: error !== null,
  }
}

