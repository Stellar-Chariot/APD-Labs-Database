"use client"

import type React from "react"

import { useEffect } from "react"
import { useUI } from "@/hooks/use-ui"
import { categorizeError } from "@/lib/api-client"

interface GlobalErrorHandlerProps {
  children: React.ReactNode
}

export function GlobalErrorHandler({ children }: GlobalErrorHandlerProps) {
  const { addNotification } = useUI()

  useEffect(() => {
    // Handler for uncaught promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      event.preventDefault()

      const error = event.reason
      const errorDetails = categorizeError(error)

      console.error("Unhandled Promise Rejection:", error)

      // Don't show notifications for redirects
      if (error && error.constructor && error.constructor.name === "Redirect") {
        return
      }

      // Show a user-friendly notification
      addNotification({
        type: "error",
        message: errorDetails.isNetworkError
          ? "Network error: Please check your connection"
          : "An unexpected error occurred",
      })
    }

    // Handler for uncaught errors
    const handleError = (event: ErrorEvent) => {
      event.preventDefault()

      console.error("Uncaught Error:", event.error || event.message)

      // Show a user-friendly notification
      addNotification({
        type: "error",
        message: "An unexpected error occurred",
      })
    }

    // Add event listeners
    window.addEventListener("unhandledrejection", handleUnhandledRejection)
    window.addEventListener("error", handleError)

    // Clean up
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection)
      window.removeEventListener("error", handleError)
    }
  }, [addNotification])

  return <>{children}</>
}

