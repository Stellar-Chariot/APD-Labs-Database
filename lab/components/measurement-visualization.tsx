"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Download, Share, Maximize2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// Import our visualization components
import { CanvasChart } from "./visualizations/canvas-chart"
import { HtmlChart } from "./visualizations/html-chart"
import { DataTable } from "./visualizations/data-table"
import type { DataPoint, Measurement, ChartConfig } from "./visualizations/chart-types"
import { mockDataService, FALLBACK_DATA } from "@/services/mock-data-service"
import { measurementService } from "@/services/measurement-service" // Import measurementService

// Fallback measurement in case the service fails
const FALLBACK_MEASUREMENT: Measurement = {
  id: "m1",
  title: "Room Temperature PL Measurement",
  measurementType: "UV_PL",
  description: "Photoluminescence measurement at room temperature (295K)",
  parameters: {
    wavelengthStart: 600,
    wavelengthEnd: 850,
    resolution: 0.5,
    integrationTime: 0.1,
    temperature: 295,
    excitationWavelength: 532,
    excitationPower: 10,
    spotSize: 100,
  },
  sample: {
    id: "s1",
    identifier: "T250306A",
    name: "GaAs QW Structure",
    substrate: "GaAs",
  },
  createdAt: new Date("2025-03-07T14:30:00Z"),
  createdBy: "Scott Sifferman",
}

// Available measurements for comparison
const AVAILABLE_COMPARISONS = [
  { id: "m1", label: "UV PL (Room Temp)" },
  { id: "m2", label: "UV PR (300K)" },
  { id: "m3", label: "IR PL (77K)" },
]

export default function MeasurementVisualization({ id = "m1" }) {
  const router = useRouter()
  const [measurement, setMeasurement] = useState<Measurement | null>(null)
  const [data, setData] = useState<DataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [xAxis, setXAxis] = useState("wavelength")
  const [yAxis, setYAxis] = useState("intensity")
  const [isNormalized, setIsNormalized] = useState(false)
  const [activeTab, setActiveTab] = useState("parameters")
  const [isClient, setIsClient] = useState(false)

  // Comparison state
  const [selectedComparisons, setSelectedComparisons] = useState<string[]>([])
  const [comparisonData, setComparisonData] = useState<DataPoint[][]>([])
  const [comparisonMeasurements, setComparisonMeasurements] = useState<Measurement[]>([])
  const [loadingComparison, setLoadingComparison] = useState(false)
  const [showComparison, setShowComparison] = useState(false)

  // Search State
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSample, setSelectedSample] = useState(null)
  const [relatedMeasurements, setRelatedMeasurements] = useState([])
  const [relatedRecipes, setRelatedRecipes] = useState([])

  // Set isClient to true when component mounts
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Update Y-axis when normalization changes
  useEffect(() => {
    setYAxis(isNormalized ? "normalized" : "intensity")
  }, [isNormalized])

  // Fetch measurement data
  useEffect(() => {
    if (!isClient) return

    async function fetchData() {
      setLoading(true)
      setError(null)

      try {
        // Fetch measurement details
        const measurementData = await mockDataService.getMeasurement(id)
        if (measurementData) {
          setMeasurement(measurementData)

          // Fetch measurement data points
          const chartData = await mockDataService.getMeasurementData(id)
          setData(chartData)
        } else {
          // Use fallback data if measurement not found
          console.warn(`Measurement ${id} not found, using fallback data`)
          setMeasurement(FALLBACK_MEASUREMENT)
          setData(FALLBACK_DATA)
          setError(`Measurement with ID ${id} not found`)
        }
      } catch (err) {
        console.error("Error fetching measurement data:", err)
        setError(`Error loading measurement: ${err instanceof Error ? err.message : "Unknown error"}`)
        setMeasurement(FALLBACK_MEASUREMENT)
        setData(FALLBACK_DATA)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Reset comparison when measurement changes
    setShowComparison(false)
    setComparisonData([])
    setComparisonMeasurements([])
  }, [id, isClient])

  // Create chart configuration
  const chartConfig: ChartConfig = {
    xAxis,
    yAxis,
    isNormalized,
    title: showComparison ? "Measurement Comparison" : measurement?.title || "Measurement Data",
    showLegend: true,
  }

  const handleExportData = () => {
    // In a real implementation, this would generate a CSV file
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "wavelength,intensity,normalized\n" +
      data.map((row) => `${row.wavelength},${row.intensity},${row.normalized}`).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${measurement?.title || "measurement"}_data.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast.success("Data exported successfully")
  }

  const handleShareVisualization = () => {
    // In a real implementation, this would generate a shareable link
    navigator.clipboard.writeText(window.location.href)
    toast.success("Link copied to clipboard")
  }

  const handleFullScreen = () => {
    // In a real implementation, this would toggle fullscreen mode
    toast.info("Full screen mode toggled")
  }

  const handleBackToMeasurement = () => {
    router.push(`/measurements/${id}`)
  }

  const handleComparisonToggle = (comparisonId: string) => {
    setSelectedComparisons((prev) => {
      if (prev.includes(comparisonId)) {
        return prev.filter((id) => id !== comparisonId)
      } else {
        return [...prev, comparisonId]
      }
    })
  }

  const handleGenerateComparison = async () => {
    if (selectedComparisons.length === 0) {
      toast.error("Please select at least one measurement to compare")
      return
    }

    setLoadingComparison(true)

    try {
      // Include the current measurement in the comparison
      const comparisonIds = [id, ...selectedComparisons.filter((cid) => cid !== id)]

      const { measurements, data } = await mockDataService.getComparisonData(comparisonIds)

      setComparisonMeasurements(measurements)
      setComparisonData(data)
      setShowComparison(true)

      // Switch to the first tab to show the comparison
      setActiveTab("parameters")

      toast.success("Comparison generated successfully")
    } catch (err) {
      console.error("Error generating comparison:", err)
      toast.error("Failed to generate comparison")
    } finally {
      setLoadingComparison(false)
    }
  }

  const handleClearComparison = () => {
    setShowComparison(false)
    setComparisonData([])
    setComparisonMeasurements([])
  }

  // Prepare data for visualization
  const visualizationData = showComparison ? comparisonData : data

  // Prepare labels for comparison
  const datasetLabels = showComparison ? comparisonMeasurements.map((m) => m.sample.identifier) : []

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={handleBackToMeasurement}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{measurement?.title || "Loading..."}</h1>
          <p className="text-muted-foreground">
            Sample: {measurement?.sample.identifier || "..."} - {measurement?.sample.name || "..."}
          </p>
        </div>
      </div>

      {error && <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-md">{error}</div>}

      {showComparison && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-2 rounded-md flex justify-between items-center">
          <div>
            <p className="font-medium">Comparison Mode</p>
            <p className="text-sm">Showing comparison with {comparisonMeasurements.length - 1} other measurement(s)</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleClearComparison}>
            Clear Comparison
          </Button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{showComparison ? "Comparison Visualization" : "Data Visualization"}</CardTitle>
            <CardDescription>
              {showComparison
                ? "Comparing multiple measurements"
                : `${measurement?.measurementType.replace("_", " ") || "Measurement"} data visualization`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] border rounded-md p-4 bg-white">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Loading chart data...</p>
                </div>
              ) : isClient && Array.isArray(visualizationData) && visualizationData.length > 0 ? (
                <CanvasChart data={visualizationData} config={chartConfig} datasetLabels={datasetLabels} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <p className="text-muted-foreground">No data available</p>
                </div>
              )}
            </div>

            {/* HTML fallback visualization */}
            <div className="mt-4 border rounded-md p-4 bg-white">
              {loading ? (
                <div className="h-[100px] flex items-center justify-center">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              ) : (
                <HtmlChart data={visualizationData} config={chartConfig} datasetLabels={datasetLabels} />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visualization Controls</CardTitle>
            <CardDescription>Customize the data display</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="x-axis">X-Axis</Label>
              <Select value={xAxis} onValueChange={setXAxis}>
                <SelectTrigger id="x-axis">
                  <SelectValue placeholder="Select X-Axis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wavelength">Wavelength (nm)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="y-axis">Y-Axis</Label>
              <Select value={yAxis} onValueChange={setYAxis}>
                <SelectTrigger id="y-axis">
                  <SelectValue placeholder="Select Y-Axis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intensity">Intensity (a.u.)</SelectItem>
                  <SelectItem value="normalized">Normalized Intensity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="normalize" checked={isNormalized} onCheckedChange={setIsNormalized} />
              <Label htmlFor="normalize">Normalize Data</Label>
            </div>

            <div className="pt-4 space-y-2">
              <Button className="w-full" variant="outline" onClick={handleExportData}>
                <Download className="mr-2 h-4 w-4" /> Export Data
              </Button>
              <Button className="w-full" variant="outline" onClick={handleShareVisualization}>
                <Share className="mr-2 h-4 w-4" /> Share Visualization
              </Button>
              <Button className="w-full" variant="outline" onClick={handleFullScreen}>
                <Maximize2 className="mr-2 h-4 w-4" /> Full Screen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="parameters">Measurement Parameters</TabsTrigger>
          <TabsTrigger value="data">Raw Data</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
        </TabsList>

        <TabsContent value="parameters">
          <Card>
            <CardHeader>
              <CardTitle>Measurement Parameters</CardTitle>
              <CardDescription>Settings used for this measurement</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-24 flex items-center justify-center">
                  <p className="text-muted-foreground">Loading parameters...</p>
                </div>
              ) : measurement ? (
                <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  {Object.entries(measurement.parameters).map(([key, value]) => (
                    <div key={key}>
                      <dt className="text-sm font-medium text-muted-foreground">
                        {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                      </dt>
                      <dd>{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="text-muted-foreground">No parameters available</p>
              )}
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
              {loading ? (
                <div className="h-24 flex items-center justify-center">
                  <p className="text-muted-foreground">Loading data...</p>
                </div>
              ) : (
                <DataTable data={data} config={chartConfig} maxRows={10} onExport={handleExportData} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compare">
          <Card>
            <CardHeader>
              <CardTitle>Compare Measurements</CardTitle>
              <CardDescription>Select other measurements to compare with this one</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">Select measurements to compare:</p>

                <div className="space-y-2">
                  {AVAILABLE_COMPARISONS.filter((comp) => comp.id !== id).map((comparison) => (
                    <div key={comparison.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`compare-${comparison.id}`}
                        className="rounded border-gray-300"
                        checked={selectedComparisons.includes(comparison.id)}
                        onChange={() => handleComparisonToggle(comparison.id)}
                      />
                      <label htmlFor={`compare-${comparison.id}`}>{comparison.label}</label>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleGenerateComparison}
                    disabled={loadingComparison || selectedComparisons.length === 0}
                  >
                    {loadingComparison && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Comparison
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Fix the handleSearch function to properly handle the case when no search query is provided

const handleSearch = async (query = "") => {
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
      // if (activeTab === "graph") { // activeTab is not defined in this scope
      //   setTimeout(() => {
      //     drawRelationshipGraph(sample, measurements, recipes)
      //   }, 100)
      // }
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

