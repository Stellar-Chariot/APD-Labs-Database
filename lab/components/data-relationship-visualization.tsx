"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Download, Upload, Search, RefreshCw, ZoomIn, ZoomOut } from "lucide-react"
import { toast } from "sonner"
import { measurementService } from "@/services/measurement-service"
import type { Sample, Measurement, Recipe } from "@/types/measurement-types"

interface DataRelationshipVisualizationProps {
  initialSampleId?: string
}

export default function DataRelationshipVisualization({ initialSampleId }: DataRelationshipVisualizationProps) {
  const [activeTab, setActiveTab] = useState("graph")
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null)
  const [relatedMeasurements, setRelatedMeasurements] = useState<Measurement[]>([])
  const [relatedRecipes, setRelatedRecipes] = useState<Recipe[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  // Load initial sample if provided
  useEffect(() => {
    if (initialSampleId) {
      handleSearch(initialSampleId)
    }
  }, [initialSampleId])

  const handleSearch = async (query: string = searchQuery) => {
    if (!query.trim()) {
      toast.error("Please enter a sample ID or name")
      return
    }

    setIsLoading(true)

    try {
      // In a real app, this would be an API call
      const sample = await measurementService.getSampleByIdOrName(query)

      if (sample) {
        setSelectedSample(sample)

        // Get related data
        const measurements = await measurementService.getMeasurementsBySampleId(sample.id)
        setRelatedMeasurements(measurements)

        const recipes = await measurementService.getRecipesBySampleId(sample.id)
        setRelatedRecipes(recipes)

        // Draw the relationship graph
        if (activeTab === "graph") {
          setTimeout(() => {
            drawRelationshipGraph(sample, measurements, recipes)
          }, 100)
        }
      } else {
        toast.error(`No sample found with ID or name: ${query}`)
        setSelectedSample(null)
        setRelatedMeasurements([])
        setRelatedRecipes([])
      }
    } catch (error) {
      console.error("Error searching for sample:", error)
      toast.error("Failed to search for sample")
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)

    if (value === "graph" && selectedSample) {
      // Redraw the graph when switching to the graph tab
      setTimeout(() => {
        drawRelationshipGraph(selectedSample, relatedMeasurements, relatedRecipes)
      }, 100)
    }
  }

  const handleExport = () => {
    if (!selectedSample) {
      toast.error("No data to export")
      return
    }

    try {
      // Create export data
      const exportData = {
        sample: selectedSample,
        measurements: relatedMeasurements,
        recipes: relatedRecipes,
        exportDate: new Date().toISOString(),
      }

      // Convert to JSON
      const jsonString = JSON.stringify(exportData, null, 2)
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(jsonString)}`

      // Create download link
      const link = document.createElement("a")
      link.setAttribute("href", dataUri)
      link.setAttribute("download", `sample-${selectedSample.identifier}-relationships.json`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("Data exported successfully")
    } catch (error) {
      console.error("Error exporting data:", error)
      toast.error("Failed to export data")
    }
  }

  const handleImport = () => {
    // Create file input
    const input = document.createElement("input")
    input.type = "file"
    input.accept = "application/json"

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string)

          // Validate imported data
          if (!data.sample || !data.measurements || !data.recipes) {
            throw new Error("Invalid data format")
          }

          // Set the imported data
          setSelectedSample(data.sample)
          setRelatedMeasurements(data.measurements)
          setRelatedRecipes(data.recipes)

          // Draw the relationship graph
          if (activeTab === "graph") {
            setTimeout(() => {
              drawRelationshipGraph(data.sample, data.measurements, data.recipes)
            }, 100)
          }

          toast.success("Data imported successfully")
        } catch (error) {
          console.error("Error importing data:", error)
          toast.error("Failed to import data")
        }
      }

      reader.readAsText(file)
    }

    input.click()
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.2, 2))
    if (selectedSample) {
      setTimeout(() => {
        drawRelationshipGraph(selectedSample, relatedMeasurements, relatedRecipes)
      }, 100)
    }
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.2, 0.5))
    if (selectedSample) {
      setTimeout(() => {
        drawRelationshipGraph(selectedSample, relatedMeasurements, relatedRecipes)
      }, 100)
    }
  }

  const handleReset = () => {
    setZoomLevel(1)
    if (selectedSample) {
      setTimeout(() => {
        drawRelationshipGraph(selectedSample, relatedMeasurements, relatedRecipes)
      }, 100)
    }
  }

  const drawRelationshipGraph = (sample: Sample, measurements: Measurement[], recipes: Recipe[]) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Apply zoom
    ctx.save()
    ctx.scale(zoomLevel, zoomLevel)

    // Calculate center positions
    const centerX = canvas.width / 2 / zoomLevel
    const centerY = canvas.height / 2 / zoomLevel

    // Draw sample node
    const sampleRadius = 50
    ctx.fillStyle = "#3b82f6" // blue
    ctx.beginPath()
    ctx.arc(centerX, centerY, sampleRadius, 0, Math.PI * 2)
    ctx.fill()

    // Draw sample text
    ctx.fillStyle = "white"
    ctx.font = "bold 14px Arial"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(sample.identifier, centerX, centerY - 10)
    ctx.font = "12px Arial"
    ctx.fillText(sample.name, centerX, centerY + 10)

    // Draw measurements
    const measurementRadius = 30
    const measurementDistance = 180

    measurements.forEach((measurement, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(1, measurements.length + recipes.length)
      const x = centerX + Math.cos(angle) * measurementDistance
      const y = centerY + Math.sin(angle) * measurementDistance

      // Draw connection line
      ctx.strokeStyle = "#94a3b8" // slate-400
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.stroke()

      // Draw measurement node
      ctx.fillStyle = "#10b981" // emerald-500
      ctx.beginPath()
      ctx.arc(x, y, measurementRadius, 0, Math.PI * 2)
      ctx.fill()

      // Draw measurement text
      ctx.fillStyle = "white"
      ctx.font = "bold 12px Arial"
      ctx.fillText(measurement.measurementType, x, y - 5)
      ctx.font = "10px Arial"
      ctx.fillText(measurement.id || "", x, y + 10)
    })

    // Draw recipes
    const recipeRadius = 30
    const recipeDistance = 180

    recipes.forEach((recipe, index) => {
      const angle = (Math.PI * 2 * (index + measurements.length)) / Math.max(1, measurements.length + recipes.length)
      const x = centerX + Math.cos(angle) * recipeDistance
      const y = centerY + Math.sin(angle) * recipeDistance

      // Draw connection line
      ctx.strokeStyle = "#94a3b8" // slate-400
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.lineTo(x, y)
      ctx.stroke()

      // Draw recipe node
      ctx.fillStyle = "#f59e0b" // amber-500
      ctx.beginPath()
      ctx.arc(x, y, recipeRadius, 0, Math.PI * 2)
      ctx.fill()

      // Draw recipe text
      ctx.fillStyle = "white"
      ctx.font = "bold 12px Arial"
      ctx.fillText("Recipe", x, y - 5)
      ctx.font = "10px Arial"
      ctx.fillText(recipe.id, x, y + 10)
    })

    // Restore canvas state
    ctx.restore()
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div className="flex-1 space-y-2">
          <Label htmlFor="search-sample">Search Sample</Label>
          <div className="flex gap-2">
            <Input
              id="search-sample"
              placeholder="Enter sample ID or name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={() => handleSearch()} disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImport}>
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={!selectedSample}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {selectedSample && (
        <Card>
          <CardHeader>
            <CardTitle>
              Sample: {selectedSample.identifier} - {selectedSample.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="mb-4">
                <TabsTrigger value="graph">Relationship Graph</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>

              <TabsContent value="graph" className="space-y-4">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" onClick={handleZoomIn}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleZoomOut}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>

                <div className="border rounded-md bg-white">
                  <canvas ref={canvasRef} className="w-full h-[500px]" style={{ display: "block" }} />
                </div>
              </TabsContent>

              <TabsContent value="list">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Sample Details</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm text-muted-foreground">ID:</div>
                      <div>{selectedSample.id}</div>
                      <div className="text-sm text-muted-foreground">Identifier:</div>
                      <div>{selectedSample.identifier}</div>
                      <div className="text-sm text-muted-foreground">Name:</div>
                      <div>{selectedSample.name}</div>
                      <div className="text-sm text-muted-foreground">Substrate:</div>
                      <div>{selectedSample.substrate}</div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Related Measurements ({relatedMeasurements.length})</h3>
                    {relatedMeasurements.length > 0 ? (
                      <div className="border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Title
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {relatedMeasurements.map((measurement) => (
                              <tr key={measurement.id}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{measurement.id}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{measurement.measurementType}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{measurement.title}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  {measurement.createdAt ? new Date(measurement.createdAt).toLocaleDateString() : "N/A"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No related measurements found</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Related Recipes ({relatedRecipes.length})</h3>
                    {relatedRecipes.length > 0 ? (
                      <div className="border rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                ID
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Type
                              </th>
                              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Created
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {relatedRecipes.map((recipe) => (
                              <tr key={recipe.id}>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{recipe.id}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{recipe.name}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">{recipe.recipeType}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-sm">
                                  {recipe.createdAt ? new Date(recipe.createdAt).toLocaleDateString() : "N/A"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No related recipes found</p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {!selectedSample && !isLoading && (
        <div className="flex flex-col items-center justify-center h-64 border rounded-md p-4">
          <p className="text-muted-foreground mb-2">No sample selected</p>
          <p className="text-sm text-muted-foreground">Search for a sample by ID or name to view relationships</p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center h-64 border rounded-md">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      )}
    </div>
  )
}

