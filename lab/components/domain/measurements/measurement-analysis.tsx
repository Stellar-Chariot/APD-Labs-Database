"use client"

/**
 * Component for analyzing measurement data.
 * This demonstrates better separation of concerns between UI and data processing.
 */

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Download } from "lucide-react"
import { measurementService } from "@/services/api/measurement-service"
import { measurementProcessor } from "@/services/processing/measurement-processor"
import type { Measurement, DataPoint } from "@/types/measurement-types"

interface MeasurementAnalysisProps {
  measurementId: string
}

export function MeasurementAnalysis({ measurementId }: MeasurementAnalysisProps) {
  const [activeTab, setActiveTab] = useState("raw")
  const [smoothingWindow, setSmoothingWindow] = useState("5")
  const [peakThreshold, setPeakThreshold] = useState("0.5")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [measurement, setMeasurement] = useState<Measurement | null>(null)
  const [rawData, setRawData] = useState<DataPoint[]>([])
  const [processedData, setProcessedData] = useState<DataPoint[]>([])
  const [peaks, setPeaks] = useState<DataPoint[]>([])

  // Load measurement and data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch the measurement
        const measurementData = await measurementService.getMeasurement(measurementId)
        setMeasurement(measurementData)

        // Process the raw data
        const data = await measurementProcessor.processRawData(measurementId)
        setRawData(data)
        setProcessedData(data)

        // Find peaks
        const peaksData = measurementProcessor.findPeaks(data, Number.parseFloat(peakThreshold))
        setPeaks(peaksData)
      } catch (err) {
        console.error("Error loading measurement data:", err)
        setError("Failed to load measurement data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [measurementId])

  // Apply smoothing when window size changes
  useEffect(() => {
    if (rawData.length > 0) {
      const smoothed = measurementProcessor.smoothData(rawData, Number.parseInt(smoothingWindow))
      setProcessedData(smoothed)

      // Update peaks based on smoothed data
      const peaksData = measurementProcessor.findPeaks(smoothed, Number.parseFloat(peakThreshold))
      setPeaks(peaksData)
    }
  }, [smoothingWindow, peakThreshold, rawData])

  // Handle data export
  const handleExportData = () => {
    if (!processedData.length) return

    // Create CSV content
    const headers = ["wavelength", "intensity", "normalized"]
    const csvContent = [
      headers.join(","),
      ...processedData.map((point) => `${point.wavelength},${point.intensity},${point.normalized}`),
    ].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `measurement-${measurementId}-analysis.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading measurement data...</p>
      </div>
    )
  }

  if (error || !measurement) {
    return <div className="bg-destructive/10 p-4 rounded-md text-destructive">{error || "Measurement not found"}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Measurement Analysis</CardTitle>
        <CardDescription>
          Analyze data from {measurement.title} ({measurement.measurementType.replace("_", " ")})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Smoothing Window</label>
            <Select value={smoothingWindow} onValueChange={setSmoothingWindow}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select window size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">No Smoothing</SelectItem>
                <SelectItem value="3">3 Points</SelectItem>
                <SelectItem value="5">5 Points</SelectItem>
                <SelectItem value="7">7 Points</SelectItem>
                <SelectItem value="9">9 Points</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Peak Threshold</label>
            <Select value={peakThreshold} onValueChange={setPeakThreshold}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select threshold" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.3">30% of Max</SelectItem>
                <SelectItem value="0.5">50% of Max</SelectItem>
                <SelectItem value="0.7">70% of Max</SelectItem>
                <SelectItem value="0.9">90% of Max</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1"></div>

          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
            <TabsTrigger value="processed">Processed Data</TabsTrigger>
            <TabsTrigger value="peaks">Peaks ({peaks.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="raw" className="space-y-4">
            <div className="h-[400px] border rounded-md p-4">
              {/* In a real implementation, this would be a chart component */}
              <div className="text-center text-muted-foreground">Raw data visualization would go here</div>
            </div>
            <div className="h-[200px] overflow-y-auto border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Wavelength
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Intensity
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Normalized
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rawData.slice(0, 20).map((point, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{point.wavelength.toFixed(2)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{point.intensity.toFixed(2)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{point.normalized.toFixed(4)}</td>
                    </tr>
                  ))}
                  {rawData.length > 20 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-center text-sm text-muted-foreground">
                        Showing 20 of {rawData.length} data points
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="processed" className="space-y-4">
            <div className="h-[400px] border rounded-md p-4">
              {/* In a real implementation, this would be a chart component */}
              <div className="text-center text-muted-foreground">Processed data visualization would go here</div>
            </div>
            <div className="h-[200px] overflow-y-auto border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Wavelength
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Intensity
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Normalized
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {processedData.slice(0, 20).map((point, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{point.wavelength.toFixed(2)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{point.intensity.toFixed(2)}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm">{point.normalized.toFixed(4)}</td>
                    </tr>
                  ))}
                  {processedData.length > 20 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-center text-sm text-muted-foreground">
                        Showing 20 of {processedData.length} data points
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="peaks" className="space-y-4">
            <div className="h-[400px] border rounded-md p-4">
              {/* In a real implementation, this would be a chart component */}
              <div className="text-center text-muted-foreground">Peak visualization would go here</div>
            </div>
            <div className="h-[200px] overflow-y-auto border rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Wavelength
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Intensity
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Normalized
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {peaks.length > 0 ? (
                    peaks.map((point, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{point.wavelength.toFixed(2)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{point.intensity.toFixed(2)}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm">{point.normalized.toFixed(4)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="px-4 py-2 text-center text-sm text-muted-foreground">
                        No peaks found with current threshold
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

