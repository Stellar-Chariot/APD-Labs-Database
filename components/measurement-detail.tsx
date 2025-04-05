"use client"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, FileText, AlertTriangle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useMeasurementQuery } from "@/hooks/use-query-measurements"
import { DynamicVisualization } from "@/components/dynamic-visualization"
import { DataTable } from "@/components/data-table"
import { ErrorBoundary } from "@/components/error-boundary"

export default function MeasurementDetail() {
  const params = useParams()
  const router = useRouter()

  // Get the measurement ID from the URL params
  const measurementId = Array.isArray(params?.id) ? params.id[0] : params?.id || ""

  // Use React Query to fetch the measurement
  const {
    data: measurement,
    isLoading,
    error,
    refetch,
  } = useMeasurementQuery(measurementId, {
    enabled: !!measurementId && measurementId !== "undefined" && measurementId !== "null",
  })

  const handleBack = () => {
    router.push("/measurements")
  }

  const handleViewSample = () => {
    if (measurement?.sampleId) {
      router.push(`/samples/${measurement.sampleId}`)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Measurements
        </Button>

        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : "Failed to load measurement"}</AlertDescription>
        </Alert>

        <div className="mt-4">
          <Button onClick={() => refetch()}>Retry</Button>
          <Button onClick={() => router.push("/measurements")} className="ml-2">
            View All Measurements
          </Button>
        </div>
      </div>
    )
  }

  if (!measurement) {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Measurements
        </Button>

        <Alert>
          <AlertTitle>Measurement Not Found</AlertTitle>
          <AlertDescription>
            The requested measurement could not be found. It may have been deleted or the ID is incorrect.
          </AlertDescription>
        </Alert>

        <div className="mt-4">
          <Button onClick={() => router.push("/measurements")}>View All Measurements</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Measurements
        </Button>
        {measurement.sampleId && (
          <Button variant="outline" onClick={handleViewSample}>
            <FileText className="mr-2 h-4 w-4" /> View Sample Details
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{measurement.name || `Measurement ${measurement.id}`}</CardTitle>
          <CardDescription>
            {measurement.type} • {new Date(measurement.date).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {measurement.data && (
            <div className="space-y-6">
              <ErrorBoundary>
                <DynamicVisualization data={measurement.data} type={measurement.type} metadata={measurement.metadata} />
              </ErrorBoundary>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Raw Data</h3>
                <ErrorBoundary>
                  <DataTable data={measurement.data} />
                </ErrorBoundary>
              </div>
            </div>
          )}

          {!measurement.data && (
            <Alert>
              <AlertTitle>No Data Available</AlertTitle>
              <AlertDescription>This measurement does not contain any data points.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

