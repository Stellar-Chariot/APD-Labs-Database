"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeft,
  Edit,
  Download,
  Share,
  BarChart,
  Trash,
  Loader2,
  FileText,
  AlertCircle,
  BarChart2,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { measurementService } from "@/services/measurement-service"
import type { Measurement, MeasurementType } from "@/types/measurement-types"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MeasurementDataTable } from "./measurement-data-table"
import { MeasurementParameterDisplay } from "./measurement-parameter-display"
import { MeasurementFileList } from "./measurement-file-list"
import Link from "next/link"

interface MeasurementDetailProps {
  id: string
}

export default function MeasurementDetail({ id }: { id: string }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("details")
  const [measurement, setMeasurement] = useState<Measurement | null>(null)
  const [measurementType, setMeasurementType] = useState<MeasurementType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Safety check for special routes
  useEffect(() => {
    // Handle special route IDs that should be redirected
    if (id === "new" || id === "compare") {
      router.push(`/measurements/${id}`)
      return
    }
  }, [id, router])

  // Load measurement data
  useEffect(() => {
    async function loadMeasurement() {
      // Skip loading for special route IDs
      if (id === "new" || id === "compare") {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        // Fetch measurement
        const measurementData = await measurementService.getMeasurement(id)
        setMeasurement(measurementData)

        // Fetch measurement type details
        const types = await measurementService.getMeasurementTypes()
        const typeData = types.find((t) => t.id === measurementData.measurementType)
        if (typeData) {
          setMeasurementType(typeData)
        }
      } catch (err) {
        console.error("Error loading measurement:", err)
        setError("Failed to load measurement data")
      } finally {
        setIsLoading(false)
      }
    }

    loadMeasurement()
  }, [id])

  // Helper function to get badge color for measurement type
  const getMeasurementBadgeColor = (type: string) => {
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

  const handleEditMeasurement = () => {
    router.push(`/measurements/${id}/edit`)
  }

  const handleDownloadData = () => {
    // In a real implementation, this would download the measurement data
    toast.success("Downloading measurement data...")

    // Simulate download delay
    setTimeout(() => {
      const dummyData =
        "wavelength,intensity\n600,10\n610,15\n620,25\n630,40\n640,70\n650,95\n660,100\n670,80\n680,50\n690,30\n700,15\n"
      const blob = new Blob([dummyData], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${measurement?.title || "measurement"}_data.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 1000)
  }

  const handleShareMeasurement = () => {
    // In a real implementation, this would generate a shareable link
    navigator.clipboard.writeText(window.location.href)
    toast.success("Link copied to clipboard")
  }

  const handleVisualizeData = () => {
    router.push(`/visualizations/measurement/${id}`)
  }

  const handleViewSample = () => {
    if (measurement?.sampleId) {
      router.push(`/samples/${measurement.sampleId}`)
    }
  }

  const handleDeleteMeasurement = async () => {
    setIsDeleting(true)

    try {
      await measurementService.deleteMeasurement(id)
      toast.success("Measurement deleted successfully")
      router.push("/measurements")
    } catch (err) {
      console.error("Error deleting measurement:", err)
      toast.error("Failed to delete measurement")
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading measurement details...</p>
      </div>
    )
  }

  // Handle special route IDs
  if (id === "new" || id === "compare") {
    return null // These will be redirected by the useEffect
  }

  if (error || !measurement) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || "Measurement not found"}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={() => router.push("/measurements")}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{measurement.title}</h1>
          <p className="text-muted-foreground">
            Sample: {measurement.sample?.identifier || measurement.sampleId} - {measurement.sample?.name || ""}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Measurement Information</CardTitle>
            <CardDescription>Basic details about this measurement</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Type</dt>
                <dd>
                  <Badge className={getMeasurementBadgeColor(measurement.measurementType)}>
                    {measurementType?.name || measurement.measurementType.replace("_", " ")}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Date</dt>
                <dd>{measurement.createdAt?.toLocaleDateString() || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Created By</dt>
                <dd>{measurement.createdBy || "N/A"}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd>
                  <Badge variant={measurement.status === "completed" ? "default" : "outline"}>
                    {measurement.status || "completed"}
                  </Badge>
                </dd>
              </div>
              {measurement.description && (
                <div className="col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                  <dd className="mt-1">{measurement.description}</dd>
                </div>
              )}
            </dl>
            <div className="mt-4 flex justify-end space-x-2">
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-500 border-red-200 hover:bg-red-50">
                    <Trash className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Measurement</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to delete this measurement? This action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteMeasurement} disabled={isDeleting}>
                      {isDeleting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        "Delete Measurement"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" onClick={handleEditMeasurement}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button variant="outline" size="sm" onClick={handleViewSample}>
                View Sample
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common operations for this measurement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center"
                onClick={handleVisualizeData}
              >
                <BarChart className="h-8 w-8 mb-2 text-primary" />
                <span>Visualize Data</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center"
                onClick={handleDownloadData}
              >
                <Download className="h-8 w-8 mb-2 text-primary" />
                <span>Download Data</span>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center"
                onClick={handleShareMeasurement}
              >
                <Share className="h-8 w-8 mb-2 text-primary" />
                <span>Share Measurement</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col items-center justify-center" asChild>
                <Link href={`/measurements/compare?ids=${id}`}>
                  <FileText className="h-8 w-8 mb-2 text-primary" />
                  <span>Compare With Other</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="h-24 flex flex-col items-center justify-center"
                onClick={() => router.push(`/measurements/${id}/analysis`)}
              >
                <BarChart2 className="h-8 w-8 mb-2 text-primary" />
                <span>Advanced Analysis</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Measurement Parameters</TabsTrigger>
          <TabsTrigger value="data">Raw Data</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Measurement Parameters</CardTitle>
              <CardDescription>Settings used for this measurement</CardDescription>
            </CardHeader>
            <CardContent>
              <MeasurementParameterDisplay parameters={measurement.parameters} measurementType={measurementType} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Raw Data</CardTitle>
              <CardDescription>First 10 rows of raw measurement data</CardDescription>
            </CardHeader>
            <CardContent>
              <MeasurementDataTable measurementId={id} onExport={handleDownloadData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>Measurement Files</CardTitle>
              <CardDescription>Files associated with this measurement</CardDescription>
            </CardHeader>
            <CardContent>
              <MeasurementFileList files={measurement.files || []} measurementId={id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Measurement Notes</CardTitle>
              <CardDescription>Observations and comments</CardDescription>
            </CardHeader>
            <CardContent>
              {measurement.notes ? (
                <div className="p-4 bg-muted/30 rounded-md border whitespace-pre-line">
                  <p className="text-sm">{measurement.notes}</p>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No notes available for this measurement</p>
                </div>
              )}

              {measurement.tags && measurement.tags.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {measurement.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

