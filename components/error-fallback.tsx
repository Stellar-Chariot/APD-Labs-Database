"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center rounded-md border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/50">
      <AlertCircle className="mb-4 h-10 w-10 text-red-500" />
      <h2 className="mb-2 text-lg font-semibold text-red-700 dark:text-red-400">Something went wrong</h2>
      <p className="mb-4 max-w-md text-sm text-red-600 dark:text-red-300">
        {error.message || "An unexpected error occurred while rendering the chart."}
      </p>
      <div className="max-h-32 w-full max-w-md overflow-auto rounded bg-white/80 p-2 text-left text-xs text-gray-800 dark:bg-gray-900/80 dark:text-gray-300">
        <pre>{error.stack}</pre>
      </div>
      <Button
        variant="outline"
        className="mt-4 border-red-200 bg-white text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-gray-900 dark:text-red-400 dark:hover:bg-red-950/70"
        onClick={resetErrorBoundary}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Try Again
      </Button>
    </div>
  )
}

