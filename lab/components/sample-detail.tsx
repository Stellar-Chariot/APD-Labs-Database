"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, ChevronLeft, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { measurementService } from "@/services/measurement-service"
import type { Measurement, MeasurementTypeId } from "@/types/measurement-types"
import SampleEditModal from "./sample-edit-modal"

interface SampleDetailProps {
  id: string
}

export default function SampleDetail({ id }: SampleDetailProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("measurements")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sample, setSample] = useState<any>(null)
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Load sample data
  useEffect(() => {
    async function loadSample() {
      setIsLoading(true)
      setError(null)

      try {
        // In a real implementation, this would fetch the sample from the backend
        // For now, we'll use mock data
        const mockSample = {
          id,
          identifier: "T250306A",
          name: "GaAs QW Structure",
          growthDate: new Date("2025-03-06"),
          substrate: "GaAs",
          grower: "Scott Sifferman",
          description: "Standard GaAs/AlGaAs quantum well structure grown at 600°C",
          createdAt: new Date("2025-03-07T10:15:00Z"),
          metadata: {
            substrateSize: '1/4 3"',
            backingWafer: "sapphire",
            rotationRpm: 5,
          },
          recipe: {
            id: "r1",
            recipeName: "B200319A",
            layers: [
              { material: "GaAs", thickness: 100, purpose: "cap" },
              { material: "AlAs", thickness: 100, purpose: "blocking layer" },
              { material: "AlGaAs", thickness: 3000, purpose: "barrier", composition: "Al0.3Ga0.7As" },
              { material: "GaAs", thickness: 100, purpose: "QW" },
              { material: "GaAs", thickness: 0, purpose: "substrate", isSubstrate: true },
            ],
          },
        }

        setSample(mockSample)

        // Fetch measurements for this sample
        const measurementsData = await measurementService.getMeasurements({ sampleId: id })
        setMeasurements(measurementsData)
      } catch (err) {
        console.error("Error loading sample:", err)
        setError("Failed to load sample data")
      } finally {
        setIsLoading(false)
      }
    }

    loadSample()
  }, [id])

  // Helper function to get color for layer visualization
  const getLayerColor = (material: string) => {
    const colors: Record<string, string> = {
      GaAs: "layer-GaAs",
      AlAs: "layer-AlAs",
      AlGaAs: "layer-AlGaAs",
      InGaAs: "layer-InGaAs",
    }

    return colors[material] || "layer-substrate"
  }

  // Helper function to get badge color for measurement type
  const getMeasurementBadgeColor = (type: MeasurementTypeId) => {
    const colors: Record<string, string> = {
      UV_PL: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      UV_PR: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      IR_PL: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      IR_EL: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      XRD: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      AFM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      SEM: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      TEM: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
      SIMS: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
      HALL: "bg-lime-100 text-lime-800 dark:bg-lime-900 dark:text-lime-300",
    }

    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }

  const handleEditSample = () => {
    setIsEditModalOpen(true)
  }

  const handleAddMeasurement = () => {
    router.push(`/samples/${id}/measurements/new`)
  }

  const handleViewMeasurement = (measurementId: string) => {
    router.push(`/measurements/${measurementId}`)
  }

  const handleVisualizeData = (measurementId: string) => {
    router.push(`/visualizations/measurement/${measurementId}`)
  }

  const handleViewRecipe = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading sample details...</p>
      </div>
    )
  }

  if (error || !sample) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || "Sample not found"}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={() => router.push("/samples")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {sample.identifier} - {sample.name}
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sample Information</CardTitle>
            <CardDescription>Basic details about this sample</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Growth Date</dt>
                <dd>{sample.growthDate.toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Substrate</dt>
                <dd>
                  <Badge variant="outline">{sample.substrate}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Grower</dt>
                <dd>{sample.grower}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                <dd>{sample.createdAt.toLocaleDateString()}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                <dd className="mt-1">{sample.description}</dd>
              </div>
            </dl>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={handleEditSample}>
                <Edit className="mr-2 h-4 w-4" /> Edit Sample
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Recipe</CardTitle>
            <CardDescription>MBE recipe: {sample.recipe.recipeName}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {sample.recipe.layers
                .filter((layer: any) => !layer.isSubstrate)
                .map((layer: any, index: number) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between rounded p-2 ${getLayerColor(layer.material)}`}
                    style={{
                      height: `${Math.max(36, layer.thickness / 100)}px`,
                    }}
                  >
                    <div className="font-medium">{layer.material}</div>
                    <div className="text-sm">
                      {layer.thickness}Å - {layer.purpose}
                      {layer.composition && ` (${layer.composition})`}
                    </div>
                  </div>
                ))}
              <div className="flex items-center justify-between rounded bg-gray-100 p-2 dark:bg-gray-800">
                <div className="font-medium">{sample.substrate}</div>
                <div className="text-sm">Substrate</div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => handleViewRecipe(sample.recipe.id)}>
                View Full Recipe
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="measurements">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Measurements</CardTitle>
                <CardDescription>Data collected for this sample</CardDescription>
              </div>
              <Button onClick={handleAddMeasurement}>
                <Plus className="mr-2 h-4 w-4" /> Add Measurement
              </Button>
            </CardHeader>
            <CardContent>
              {measurements.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {measurements.map((measurement) => (
                      <TableRow key={measurement.id}>
                        <TableCell>
                          <Badge className={getMeasurementBadgeColor(measurement.measurementType)}>
                            {measurement.measurementType.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>{measurement.title}</TableCell>
                        <TableCell>{measurement.createdAt?.toLocaleDateString() || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => measurement.id && handleViewMeasurement(measurement.id)}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => measurement.id && handleVisualizeData(measurement.id)}
                            >
                              Visualize
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No measurements found for this sample</p>
                  <Button onClick={handleAddMeasurement} variant="outline" className="mt-4">
                    <Plus className="mr-2 h-4 w-4" /> Add First Measurement
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata">
          <Card>
            <CardHeader>
              <CardTitle>Sample Metadata</CardTitle>
              <CardDescription>Additional properties and attributes</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                {Object.entries(sample.metadata).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm font-medium text-muted-foreground">{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Sample History</CardTitle>
              <CardDescription>Activity log for this sample</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 text-center">
                    <span className="text-xs font-medium text-muted-foreground">14:30</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center">
                      <span className="font-medium">sscott</span>
                      <span className="ml-2 rounded-full px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        CREATE MEASUREMENT
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Added new UV PL measurement to sample T250306A</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date("2025-03-07T14:30:00Z"))}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="w-10 text-center">
                    <span className="text-xs font-medium text-muted-foreground">10:15</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center">
                      <span className="font-medium">sscott</span>
                      <span className="ml-2 rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        CREATE SAMPLE
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">Created sample T250306A</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date("2025-03-07T10:15:00Z"))}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <SampleEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} sampleId={id} />
    </div>
  )
}

// Helper function to format dates
function formatDistanceToNow(date: Date) {
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays < 1) {
    return "today"
  } else if (diffInDays === 1) {
    return "yesterday"
  } else if (diffInDays < 30) {
    return `${diffInDays} days ago`
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30)
    return `${months} ${months === 1 ? "month" : "months"} ago`
  } else {
    const years = Math.floor(diffInDays / 365)
    return `${years} ${years === 1 ? "year" : "years"} ago`
  }
}

