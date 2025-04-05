"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Download, Plus, Minus, Layers, BarChart4, RefreshCw } from "lucide-react"
import { useMeasurementsQuery } from "@/hooks/use-query-measurements"
import { useSamplesQuery } from "@/hooks/use-query-samples"
import { SimpleComparisonView } from "@/components/simple-comparison-view"
import { ErrorBoundary } from "@/components/error-boundary"
import type { Measurement } from "@/types/measurement"

export default function MeasurementComparison() {
  const [selectedSampleId, setSelectedSampleId] = useState<string>("")
  const [selectedMeasurements, setSelectedMeasurements] = useState<string[]>([])
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch samples and measurements
  const { data: samples, isLoading: samplesLoading, refetch: refetchSamples } = useSamplesQuery()
  const { data: measurements, isLoading: measurementsLoading, refetch: refetchMeasurements } = useMeasurementsQuery()

  // Filter measurements by selected sample
  const sampleMeasurements = useMemo(() => {
    if (!measurements || !selectedSampleId) return []
    return measurements.filter((m) => m.sampleId === selectedSampleId)
  }, [measurements, selectedSampleId])

  // Get selected measurement objects without any mock data generation
  const selectedMeasurementObjects = useMemo(() => {
    if (!measurements) return []

    // Get the selected measurements
    return measurements.filter((m) => selectedMeasurements.includes(m.id))
  }, [measurements, selectedMeasurements])

  // Group measurements by type
  const measurementsByType = useMemo(() => {
    const groups: Record<string, Measurement[]> = {}
    sampleMeasurements.forEach((m) => {
      if (!groups[m.type]) groups[m.type] = []
      groups[m.type].push(m)
    })
    return groups
  }, [sampleMeasurements])

  // Handle sample selection
  const handleSampleChange = (sampleId: string) => {
    setSelectedSampleId(sampleId)
    setSelectedMeasurements([]) // Reset selected measurements when sample changes
  }

  // Handle measurement selection
  const handleMeasurementToggle = (measurementId: string) => {
    setSelectedMeasurements((prev) => {
      if (prev.includes(measurementId)) {
        return prev.filter((id) => id !== measurementId)
      } else {
        // Limit to 5 measurements at a time to prevent performance issues
        const newSelection = [...prev, measurementId]
        if (newSelection.length > 5) {
          // Show a notification that too many measurements were selected
          return newSelection.slice(0, 5)
        }
        return newSelection
      }
    })
  }

  // Handle adding all measurements of a type
  const handleAddAllOfType = (type: string) => {
    const measurementsOfType = sampleMeasurements.filter((m) => m.type === type)
    const measurementIds = measurementsOfType.map((m) => m.id)

    setSelectedMeasurements((prev) => {
      const newSelection = [...prev]
      measurementIds.forEach((id) => {
        if (!newSelection.includes(id)) {
          newSelection.push(id)
        }
      })
      return newSelection.slice(0, 5) // Limit to 5
    })
  }

  // Handle removing all measurements of a type
  const handleRemoveAllOfType = (type: string) => {
    const measurementsOfType = sampleMeasurements.filter((m) => m.type === type)
    const measurementIds = measurementsOfType.map((m) => m.id)

    setSelectedMeasurements((prev) => prev.filter((id) => !measurementIds.includes(id)))
  }

  // Handle refreshing data
  const handleRefreshData = async () => {
    setIsRefreshing(true)
    await Promise.all([refetchSamples(), refetchMeasurements()])
    setIsRefreshing(false)
  }

  // Handle exporting data
  const handleExportData = () => {
    if (selectedMeasurementObjects.length === 0) return

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,"

    // Get all x-axis values from all selected measurements
    const allXValues = new Set<number>()
    selectedMeasurementObjects.forEach((measurement) => {
      if (measurement.data && Array.isArray(measurement.data)) {
        const xKey = Object.keys(measurement.data[0] || {})[0]
        measurement.data.forEach((point) => {
          if (point[xKey] !== undefined) {
            allXValues.add(Number(point[xKey]))
          }
        })
      }
    })

    // Sort x values
    const sortedXValues = Array.from(allXValues).sort((a, b) => a - b)

    // Create header row
    const headers = ["x"]
    selectedMeasurementObjects.forEach((m) => {
      headers.push(`${m.name || m.id} (${m.type})`)
    })
    csvContent += headers.join(",") + "\r\n"

    // Create data rows
    sortedXValues.forEach((x) => {
      const row = [x.toString()]

      selectedMeasurementObjects.forEach((measurement) => {
        if (measurement.data && Array.isArray(measurement.data)) {
          const xKey = Object.keys(measurement.data[0] || {})[0]
          const yKey = Object.keys(measurement.data[0] || {})[1]

          const point = measurement.data.find((p) => Number(p[xKey]) === x)
          row.push(point ? String(point[yKey]) : "")
        } else {
          row.push("")
        }
      })

      csvContent += row.join(",") + "\r\n"
    })

    // Create download link
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `comparison_export_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Loading state
  if (samplesLoading || measurementsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Measurement Comparison</h1>
          <p className="text-muted-foreground">Compare measurements from the same sample under different conditions</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedSampleId} onValueChange={handleSampleChange}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Select a sample" />
            </SelectTrigger>
            <SelectContent>
              {samples?.map((sample) => (
                <SelectItem key={sample.id} value={sample.id}>
                  {sample.name || sample.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleRefreshData} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Data
          </Button>

          <Button variant="outline" onClick={handleExportData} disabled={selectedMeasurements.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      {!selectedSampleId ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Layers className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Select a Sample</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                Select a sample to view and compare its measurements under different conditions.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : sampleMeasurements.length === 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No measurements found</AlertTitle>
          <AlertDescription>
            This sample doesn't have any measurements. Please select a different sample or add measurements to this
            sample.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Available Measurements</CardTitle>
                <CardDescription>Select measurements to compare (max 5)</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[500px] overflow-y-auto">
                {Object.entries(measurementsByType).map(([type, typeMeasurements]) => (
                  <div key={type} className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium uppercase">{type}</h3>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleAddAllOfType(type)} title="Add all">
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAllOfType(type)}
                          title="Remove all"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {typeMeasurements.map((measurement) => {
                        // Extract environmental conditions from metadata
                        const temperature = measurement.metadata?.temperature
                          ? `${measurement.metadata.temperature}K`
                          : null
                        const power = measurement.metadata?.power ? `${measurement.metadata.power}mW` : null

                        // Create conditions string
                        const conditions = [temperature, power].filter(Boolean).join(", ")

                        return (
                          <div
                            key={measurement.id}
                            className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                              selectedMeasurements.includes(measurement.id)
                                ? "bg-primary/10 border border-primary/30"
                                : "hover:bg-muted"
                            }`}
                            onClick={() => handleMeasurementToggle(measurement.id)}
                          >
                            <div>
                              <div className="font-medium">{measurement.name || measurement.id}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(measurement.date).toLocaleDateString()}
                                {conditions && ` • ${conditions}`}
                              </div>
                            </div>
                            <div className="h-4 w-4 rounded-full border border-primary flex items-center justify-center">
                              {selectedMeasurements.includes(measurement.id) && (
                                <div className="h-2 w-2 rounded-full bg-primary"></div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {selectedMeasurementObjects.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <BarChart4 className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No Measurements Selected</h3>
                    <p className="text-sm text-muted-foreground mt-2 max-w-md">
                      Select measurements from the panel on the left to compare them.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <ErrorBoundary>
                <SimpleComparisonView measurements={selectedMeasurementObjects} />
              </ErrorBoundary>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

