"use client"

import { Input } from "@/components/ui/input"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, AlertCircle, Download, Share2, Edit, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { visualizationService, type Visualization } from "@/services/visualization-service"
import { measurementService } from "@/services/measurement-service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import MeasurementVisualization from "@/components/measurement-visualization"

interface VisualizationDetailProps {
  id: string
}

export default function VisualizationDetail({ id }: VisualizationDetailProps) {
  const router = useRouter()
  const [visualization, setVisualization] = useState<Visualization | null>(null)
  const [measurements, setMeasurements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("visualization")

  useEffect(() => {
    async function loadVisualization() {
      try {
        setIsLoading(true)
        const data = await visualizationService.getVisualization(id)
        setVisualization(data)

        // Load measurements
        if (data.measurements && data.measurements.length > 0) {
          const measurementData = await Promise.all(
            data.measurements.map((measurementId) => measurementService.getMeasurement(measurementId)),
          )
          setMeasurements(measurementData)
        }

        setError(null)
      } catch (err) {
        console.error("Error loading visualization:", err)
        setError("Failed to load visualization data")
      } finally {
        setIsLoading(false)
      }
    }

    loadVisualization()
  }, [id])

  const handleEditVisualization = () => {
    router.push(`/visualizations/${id}/edit`)
  }

  const handleDeleteVisualization = async () => {
    try {
      await visualizationService.deleteVisualization(id)

      setIsDeleteDialogOpen(false)
      toast.success("Visualization deleted successfully")
      router.push("/visualizations")
    } catch (err) {
      console.error("Error deleting visualization:", err)
      toast.error("Failed to delete visualization")
    }
  }

  const handleDownload = () => {
    // In a real app, this would generate and download a file
    toast.success("Visualization data downloaded")
  }

  const handleShare = () => {
    // Copy link to clipboard
    const url = `${window.location.origin}/visualizations/${id}`
    navigator.clipboard.writeText(url)
    toast.success("Link copied to clipboard")
    setIsShareDialogOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading visualization data...</p>
      </div>
    )
  }

  if (error || !visualization) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || "Visualization not found"}</AlertDescription>
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
                <CardTitle>{visualization.title}</CardTitle>
                <CardDescription>{visualization.description}</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="icon" onClick={() => setIsShareDialogOpen(true)}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleEditVisualization}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <div className="text-sm text-muted-foreground">
                Created by: <span className="font-medium">{visualization.createdBy}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Date: <span className="font-medium">{new Date(visualization.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Type: <span className="font-medium">{visualization.type}</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="visualization" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Visualization</CardTitle>
                <CardDescription>Visual representation of the data</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="aspect-video w-full bg-muted overflow-hidden">
                  {measurements.length > 0 ? (
                    <MeasurementVisualization
                      measurements={measurements}
                      type={visualization.type}
                      config={visualization.config}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <p className="text-muted-foreground">No measurements available for visualization</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Measurement Data</CardTitle>
                <CardDescription>Raw data used in this visualization</CardDescription>
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
                    <p className="text-muted-foreground">No measurements available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Visualization Settings</CardTitle>
                <CardDescription>Configure visualization options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center h-40">
                  <p className="text-muted-foreground">Visualization settings would be displayed here</p>
                  <Button className="mt-4" onClick={handleEditVisualization}>
                    Edit Visualization
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this visualization? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteVisualization}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Share Visualization</DialogTitle>
            <DialogDescription>Share this visualization with others</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-2">
              <Input
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/visualizations/${id}`}
                readOnly
              />
              <Button onClick={handleShare}>Copy</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

