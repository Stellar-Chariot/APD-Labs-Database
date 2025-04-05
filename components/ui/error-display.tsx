"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, AlertCircle, Info, Home, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export type ErrorSeverity = "error" | "warning" | "info"

interface ErrorDisplayProps {
  title?: string
  message: string
  severity?: ErrorSeverity
  onRetry?: () => void
  onBack?: () => void
  backPath?: string
  homePath?: string
  className?: string
  showHomeButton?: boolean
  showBackButton?: boolean
  errorCode?: string | number
}

export function ErrorDisplay({
  title,
  message,
  severity = "error",
  onRetry,
  onBack,
  backPath,
  homePath = "/",
  className = "",
  showHomeButton = false,
  showBackButton = true,
  errorCode,
}: ErrorDisplayProps) {
  const router = useRouter()

  let Icon = AlertCircle
  let variant: "default" | "destructive" = "default"
  let bgColor = "bg-red-50 border-red-200"

  switch (severity) {
    case "error":
      Icon = AlertTriangle
      variant = "destructive"
      bgColor = "bg-red-50 border-red-200"
      break
    case "warning":
      Icon = AlertTriangle
      bgColor = "bg-yellow-50 border-yellow-200"
      break
    case "info":
      Icon = Info
      bgColor = "bg-blue-50 border-blue-200"
      break
  }

  const defaultTitle = severity === "error" ? "An error occurred" : severity === "warning" ? "Warning" : "Information"
  const displayTitle = title || defaultTitle

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else if (backPath) {
      router.push(backPath)
    } else {
      router.back()
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Icon className="h-5 w-5 mr-2" />
          {displayTitle}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`p-4 rounded-md ${bgColor}`}>
          <Alert variant={variant}>
            <AlertDescription>{message}</AlertDescription>
            {errorCode && <div className="mt-2 text-xs opacity-70">Error code: {errorCode}</div>}
          </Alert>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div>
          {showBackButton && (
            <Button onClick={handleBack} variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          {showHomeButton && (
            <Button asChild variant="outline" size="sm">
              <Link href={homePath}>
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
          )}
          {onRetry && (
            <Button onClick={onRetry} variant="default" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

export function ApiErrorDisplay({
  error,
  onRetry,
  className,
  showHomeButton = false,
  showBackButton = true,
}: {
  error: Error | null | unknown
  onRetry?: () => void
  className?: string
  showHomeButton?: boolean
  showBackButton?: boolean
}) {
  if (!error) return null

  let message = "An unexpected error occurred"
  let errorCode: string | undefined

  if (error instanceof Error) {
    message = error.message
    // Extract error code if available
    if ("code" in error && typeof (error as any).code !== "undefined") {
      errorCode = String((error as any).code)
    }
  } else if (typeof error === "string") {
    message = error
  }

  return (
    <ErrorDisplay
      title="API Error"
      message={message}
      severity="error"
      onRetry={onRetry}
      className={className}
      showHomeButton={showHomeButton}
      showBackButton={showBackButton}
      errorCode={errorCode}
    />
  )
}

export function EmptyStateError({
  title = "No data available",
  message = "There is no data to display at this time.",
  actionLabel,
  onAction,
  severity = "info",
}: {
  title?: string
  message?: string
  actionLabel?: string
  onAction?: () => void
  severity?: ErrorSeverity
}) {
  let Icon = AlertCircle

  switch (severity) {
    case "error":
      Icon = AlertTriangle
      break
    case "warning":
      Icon = AlertTriangle
      break
    case "info":
      Icon = Info
      break
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Icon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md">{message}</p>
          {actionLabel && onAction && (
            <Button onClick={onAction} className="mt-4">
              {actionLabel}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

