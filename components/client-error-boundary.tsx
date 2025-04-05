"use client"

import { ErrorBoundary } from "./error-boundary"

export function ClientErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Skip logging for redirects
        if (error && error.constructor && error.constructor.name === "Redirect") {
          return
        }
        // Log other errors
        console.error("Global error caught:", error, errorInfo)
      }}
    >
      {children}
    </ErrorBoundary>
  )
} 