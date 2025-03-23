"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle, Download, Share2, Save } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { measurementService } from "@/services/measurement-service"
import { visualizationService } from "@/services/visualization-service"
import MeasurementVisualization from "@/components/measurement-visualization"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

export default function MeasurementCompare() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [measurements, setMeasurements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)

  // Save visualization form state
  const [saveForm, setSaveForm] = useState({
    title: "",
    description: "",
    type: "comparison",
  })

  useEffect(() => {
    async function loadMeasurements() {
      try {
        setIsLoading(true)

        // Get measurement IDs from URL
        const ids = searchParams.get("ids")?.split(",") || []

        if (ids.length === 0) {
          setError("No measurements selected for comparison")
          setIsLoading(false)
          return
        }

        // Load measurements
        const measurementData = await Promise.all(ids.map((id) => measurementService.getMeasurement(id)))

        setMeasurements(measurementData)
        setError(null)
      } catch (err) {
        console.error("Error loading measurements:", err)
        setError("Failed to load measurement data")
      } finally {
        setIsLoading(false)
      }
    }

    loadMeasurements()
  }, [searchParams])

  const handleSaveVisualization = async () => {
    try {
      // Validate form
      if (!saveForm.title) {
        toast.error("Please enter a title")
        return
      }

      // Create visualization
      const measurementIds = measurements.map((m) => m.id)

      await visualizationService.createVisualization({
        title: saveForm.title,
        description: saveForm.description,
        type: saveForm.type as any,
        measurements: measurementIds,
      })

      setIsSaveDialogOpen(false)
      toast.success("Visualization saved successfully")

      // Reset form
      setSaveForm({
        title: "",
        description: "",
        type: "comparison",
      })

      // Navigate to visualizations
      router.push("/visualizations")
    } catch (err) {
      console.error("Error saving visualization:", err)
      toast.error("Failed to save visualization")
    }
  }

  const handleDownload = () => {
    // In a real app, this would generate and download a file
    toast.success("Comparison data downloaded")
  }

  const handleShare = () => {
    // Copy link to clipboard
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast.success("Link copied to clipboard")
    setIsShareDialogOpen(false)
  }

  const handleSelectMoreMeasurements = () => {
    router.push("/measurements?select=true")
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading measurement data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Measurement Comparison</CardTitle>
                <CardDescription>Comparing {measurements.length} measurements</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={() => setIsShareDialogOpen(true)}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setIsSaveDialogOpen(true)}>
                  <Save className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visualization</CardTitle>
            <CardDescription>Visual comparison of selected measurements</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="aspect-video w-full bg-muted overflow-hidden">
              {measurements.length > 0 ? (
                <MeasurementVisualization measurements={measurements} type="comparison" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p className="text-muted-foreground">No measurements available for comparison</p>
                  <Button className="mt-4" onClick={handleSelectMoreMeasurements}>
                    Select Measurements
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Measurement Details</CardTitle>
            <CardDescription>Details of the measurements being compared</CardDescription>
          </CardHeader>
          <CardContent>
            {measurements.length > 0 ? (
              <div className="space-y-4">
                {measurements.map((measurement) => (
                  <Card key={measurement.id}>
                    <CardHeader className="py-3">
                      <CardTitle className="text-lg">{measurement.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="py-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium">Measurement Type</h4>
                          <p className="text-sm text-muted-foreground">{measurement.measurementType}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Sample ID</h4>
                          <p className="text-sm text-muted-foreground">{measurement.sampleId}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Created</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(measurement.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium">Created By</h4>
                          <p className="text-sm text-muted-foreground">{measurement.createdBy}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="py-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/measurements/${measurement.id}`)}
                      >
                        View Measurement
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40">
                <p className="text-muted-foreground">No measurements selected</p>
                <Button className="mt-4" onClick={handleSelectMoreMeasurements}>
                  Select Measurements
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={handleSelectMoreMeasurements}>Select More Measurements</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Save Dialog */}
      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save as Visualization</DialogTitle>
            <DialogDescription>Save this comparison as a reusable visualization</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={saveForm.title}
                onChange={(e) => setSaveForm({ ...saveForm, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={saveForm.description}
                onChange={(e) => setSaveForm({ ...saveForm, description: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSaveDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVisualization}>Save Visualization</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share Comparison</DialogTitle>
            <DialogDescription>Share this comparison with others</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-2">
              <Input value={typeof window !== "undefined" ? window.location.href : ""} readOnly />
              <Button onClick={handleShare}>Copy</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

