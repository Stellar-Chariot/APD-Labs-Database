"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetchMeasurements } from "@/lib/api-client"
import { MeasurementsTable } from "@/components/measurements-table"
import { MeasurementsFilter } from "@/components/measurements-filter"
import { Button } from "@/components/ui/button"
import { Plus, Loader2, Filter } from "lucide-react"
import Link from "next/link"

export default function MeasurementsPage() {
  const [selectedSample, setSelectedSample] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)

  // Fetch measurements with filters
  const {
    data: measurementsData = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["measurements", selectedSample, selectedType],
    queryFn: () => fetchMeasurements({ sampleId: selectedSample, type: selectedType }),
  })

  // Ensure measurements is an array
  const measurements = Array.isArray(measurementsData) ? measurementsData : []
  console.log("Measurements array length:", measurements.length)

  // Check if filters are active
  const filtersActive = selectedSample !== null || selectedType !== null

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Measurements</h1>
        <Link href="/measurements/new">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Measurement
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center">
        <MeasurementsFilter
          onSampleChange={setSelectedSample}
          onTypeChange={setSelectedType}
          selectedSample={selectedSample}
          selectedType={selectedType}
        />

        {isLoading && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Loading measurements...
          </div>
        )}
      </div>

      {filtersActive && !isLoading && (
        <div className="bg-muted p-4 rounded-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span>
              Showing filtered results
              {measurements.length > 0 ? ` (${measurements.length} measurements)` : ""}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedSample(null)
              setSelectedType(null)
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}

      {isError && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          Error loading measurements: {error instanceof Error ? error.message : "Unknown error"}
        </div>
      )}

      {!isLoading && !isError && measurements.length === 0 && (
        <div className="bg-muted p-8 rounded-md text-center">
          <h3 className="text-lg font-medium mb-2">No measurements found</h3>
          <p className="text-muted-foreground mb-4">
            {filtersActive
              ? "Try changing or clearing your filters to see more results."
              : "There are no measurements in the system yet."}
          </p>
          {filtersActive && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedSample(null)
                setSelectedType(null)
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      )}

      {measurements.length > 0 && <MeasurementsTable measurements={measurements} isLoading={isLoading} />}
    </div>
  )
}

