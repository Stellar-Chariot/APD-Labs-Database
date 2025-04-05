"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, ExternalLink } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { Measurement } from "@/types/measurement"
import type { Sample } from "@/types/sample"
import { VisualizationDialog } from "@/components/visualization-dialog"

interface VisualizationGridProps {
  measurements: Measurement[]
  samples?: Sample[] // Added samples prop to the interface
}

export function VisualizationGrid({ measurements = [], samples = [] }: VisualizationGridProps) {
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedSampleId, setSelectedSampleId] = useState<string>("all")
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null)

  // Safety check for measurements
  if (!Array.isArray(measurements)) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Visualization Error</AlertTitle>
        <AlertDescription>Invalid measurement data format. Expected an array.</AlertDescription>
      </Alert>
    )
  }

  // Get unique measurement types
  const measurementTypes = Array.from(new Set(measurements.map((m) => m.type)))

  // Get unique sample IDs
  const sampleIds = Array.from(new Set(measurements.map((m) => m.sampleId)))

  // Get sample names for display
  const sampleNames = new Map<string, string>()
  if (Array.isArray(samples)) {
    samples.forEach((sample) => {
      if (sample && sample.id) {
        sampleNames.set(sample.id, sample.name || sample.id)
      }
    })
  }

  // Filter measurements by selected type and sample
  const filteredMeasurements = measurements.filter(
    (m) =>
      (selectedType === "all" || m.type === selectedType) &&
      (selectedSampleId === "all" || m.sampleId === selectedSampleId),
  )

  // Handle opening the visualization dialog
  const handleOpenVisualization = (measurement: Measurement) => {
    setSelectedMeasurement(measurement)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {measurementTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {samples && samples.length > 0 && (
            <Select value={selectedSampleId} onValueChange={setSelectedSampleId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by sample" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Samples</SelectItem>
                {sampleIds.map((sampleId) => (
                  <SelectItem key={sampleId} value={sampleId}>
                    {sampleNames.get(sampleId) || sampleId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredMeasurements.length} of {measurements.length} measurements
        </div>
      </div>

      {filteredMeasurements.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">No measurements found for the selected filters.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMeasurements.map((measurement) => (
            <Card key={measurement.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Visualization preview/placeholder */}
                <div
                  className="h-48 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleOpenVisualization(measurement)}
                >
                  <BarChart className="h-12 w-12 text-gray-400 mb-2" />
                  <p className="text-sm font-medium">{measurement.type.toUpperCase()} Visualization</p>
                  <p className="text-xs text-muted-foreground">Click to view</p>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{measurement.name || measurement.id}</h3>
                      <p className="text-sm text-muted-foreground">
                        {measurement.type.toUpperCase()} • {new Date(measurement.date).toLocaleDateString()}
                        {sampleNames.get(measurement.sampleId) && ` • ${sampleNames.get(measurement.sampleId)}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleOpenVisualization(measurement)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                  </div>

                  {/* Show a few key metadata points */}
                  {measurement.metadata && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      {measurement.metadata.temperature && <div>Temperature: {measurement.metadata.temperature}K</div>}
                      {measurement.metadata.power && <div>Power: {measurement.metadata.power}mW</div>}
                      {measurement.metadata.peakWavelength && <div>Peak: {measurement.metadata.peakWavelength}nm</div>}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Visualization Dialog */}
      {selectedMeasurement && (
        <VisualizationDialog
          measurement={selectedMeasurement}
          open={!!selectedMeasurement}
          onClose={() => setSelectedMeasurement(null)}
        />
      )}
    </div>
  )
}

