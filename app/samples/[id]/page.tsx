"use client"

import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MeasurementsTable } from "@/components/measurements-table"
import { DynamicVisualization } from "@/components/dynamic-visualization"
import { useApi } from "@/hooks/use-api"
import { getSampleById } from "@/services/sample-service"
import { getMeasurementsBySampleId } from "@/services/measurement-service"
import { getRecipeBySampleId } from "@/services/mbe-recipe-service"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorDisplay, EmptyStateError } from "@/components/ui/error-display"
import { ErrorBoundary } from "@/components/error-boundary"
import { LayerStructureVisualization } from "@/components/layer-structure-visualization"

export default function SampleDetailPage() {
  const params = useParams()
  const router = useRouter()

  // Get the sample ID from the URL params
  const sampleId = Array.isArray(params?.id) ? params.id[0] : params?.id

  // Use our API hooks for data fetching with proper error handling
  const {
    data: sample,
    loading: sampleLoading,
    error: sampleError,
    execute: fetchSample,
  } = useApi(getSampleById, {
    context: "Sample Detail",
    errorMessage: "Failed to load sample details",
  })

  const {
    data: measurements,
    loading: measurementsLoading,
    error: measurementsError,
    execute: fetchMeasurements,
  } = useApi(getMeasurementsBySampleId, {
    context: "Sample Measurements",
  })

  const {
    data: recipe,
    loading: recipeLoading,
    error: recipeError,
    execute: fetchRecipe,
  } = useApi(getRecipeBySampleId, {
    context: "Sample Recipe",
  })

  // Fetch data on component mount
  useEffect(() => {
    if (!sampleId) {
      router.push("/samples")
      return
    }

    fetchSample(sampleId)
    fetchMeasurements(sampleId)
    fetchRecipe(sampleId)
  }, [sampleId, router, fetchSample, fetchMeasurements, fetchRecipe])

  // Loading state
  if (sampleLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  // Error state
  if (sampleError) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Error Loading Sample</h1>
          <Link href="/samples">
            <Button variant="outline">Back to Samples</Button>
          </Link>
        </div>
        <ErrorDisplay
          title="Failed to load sample"
          message={sampleError.message}
          onRetry={() => fetchSample(sampleId)}
        />
      </div>
    )
  }

  // Not found state
  if (!sample) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Sample Not Found</h1>
          <Link href="/samples">
            <Button variant="outline">Back to Samples</Button>
          </Link>
        </div>
        <EmptyStateError
          title="Sample Not Found"
          message="The requested sample could not be found or may have been deleted."
          actionLabel="View All Samples"
          onAction={() => router.push("/samples")}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{sample.name}</h1>
          <p className="text-muted-foreground">Sample ID: {sample.id}</p>
        </div>
        <Link href="/samples">
          <Button variant="outline">Back to Samples</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <ErrorBoundary>
          <Card>
            <CardHeader>
              <CardTitle>Sample Information</CardTitle>
              <CardDescription>Basic information about this sample</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                  <dd>{new Date(sample.createdAt).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Growth Method</dt>
                  <dd>{sample.metadata?.growthMethod || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Substrate</dt>
                  <dd>{sample.metadata?.substrate || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Orientation</dt>
                  <dd>{sample.metadata?.orientation || "N/A"}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                  <dd className="mt-1">{sample.description || "No description available."}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </ErrorBoundary>

        <ErrorBoundary>
          {recipe ? (
            <LayerStructureVisualization recipe={recipe} />
          ) : recipeLoading ? (
            <Card>
              <CardHeader>
                <CardTitle>Growth Recipe</CardTitle>
                <CardDescription>MBE growth parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Growth Recipe</CardTitle>
                <CardDescription>MBE growth parameters</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <p className="text-muted-foreground">No recipe information available for this sample.</p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => router.push(`/recipes/new?sampleId=${sample.id}`)}
                  >
                    Add Recipe
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </ErrorBoundary>
      </div>

      <ErrorBoundary>
        <Card>
          <CardHeader>
            <CardTitle>Measurements</CardTitle>
            <CardDescription>All measurements associated with this sample</CardDescription>
          </CardHeader>
          <CardContent>
            {measurementsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : measurementsError ? (
              <ErrorDisplay
                title="Failed to load measurements"
                message={measurementsError.message}
                onRetry={() => fetchMeasurements(sampleId)}
              />
            ) : !measurements || measurements.length === 0 ? (
              <EmptyStateError
                title="No Measurements"
                message="This sample doesn't have any measurements yet."
                actionLabel="Upload Measurement"
                onAction={() => router.push("/upload")}
              />
            ) : (
              <Tabs defaultValue="table">
                <TabsList className="mb-4">
                  <TabsTrigger value="table">Table View</TabsTrigger>
                  <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
                </TabsList>
                <TabsContent value="table">
                  <MeasurementsTable measurements={measurements} />
                </TabsContent>
                <TabsContent value="visualizations">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {measurements.map((measurement) => (
                      <ErrorBoundary key={measurement.id}>
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{measurement.type.toUpperCase()}</CardTitle>
                            <CardDescription>{measurement.name || measurement.id}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <DynamicVisualization
                              data={measurement.data}
                              type={measurement.type}
                              metadata={measurement.metadata}
                            />
                          </CardContent>
                        </Card>
                      </ErrorBoundary>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </ErrorBoundary>
    </div>
  )
}

