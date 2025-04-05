"use client"
import { Check, ChevronDown, Loader2, Beaker, FileType } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useQuery } from "@tanstack/react-query"
import { fetchSamples, fetchMeasurementTypes } from "@/lib/api-client"

interface MeasurementsFilterProps {
  onSampleChange: (sampleId: string | null) => void
  onTypeChange: (type: string | null) => void
  selectedSample: string | null
  selectedType: string | null
}

export function MeasurementsFilter({
  onSampleChange,
  onTypeChange,
  selectedSample,
  selectedType,
}: MeasurementsFilterProps) {
  // Fetch samples
  const {
    data: samplesData,
    isLoading: samplesLoading,
    isError: samplesError,
  } = useQuery({
    queryKey: ["samples"],
    queryFn: fetchSamples,
  })

  // Ensure samples is an array
  const samples = Array.isArray(samplesData) ? samplesData : []

  // Fetch measurement types
  const {
    data: typesData,
    isLoading: typesLoading,
    isError: typesError,
  } = useQuery({
    queryKey: ["measurementTypes"],
    queryFn: fetchMeasurementTypes,
  })

  // Ensure measurement types is an array
  const measurementTypes = Array.isArray(typesData) ? typesData : []

  return (
    <div className="flex items-center space-x-4">
      {/* Sample Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Beaker className="h-4 w-4" />
            {selectedSample
              ? `Sample: ${samples.find((s) => s.id === selectedSample)?.name || "Unknown"}`
              : "Filter by Sample"}
            {samplesLoading && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Select Sample</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => onSampleChange(null)} className="flex items-center justify-between">
            All Samples
            {selectedSample === null && <Check className="h-4 w-4" />}
          </DropdownMenuItem>

          {samplesLoading ? (
            <DropdownMenuItem disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading samples...
            </DropdownMenuItem>
          ) : samplesError ? (
            <DropdownMenuItem disabled className="text-destructive">
              Error loading samples
            </DropdownMenuItem>
          ) : samples.length === 0 ? (
            <DropdownMenuItem disabled>No samples available</DropdownMenuItem>
          ) : (
            samples.map((sample) => (
              <DropdownMenuItem
                key={sample.id}
                onClick={() => onSampleChange(sample.id)}
                className="flex items-center justify-between"
              >
                {sample.name}
                {selectedSample === sample.id && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Measurement Type Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <FileType className="h-4 w-4" />
            {selectedType
              ? `Type: ${measurementTypes.find((t) => t.id === selectedType)?.name || "Unknown"}`
              : "Filter by Type"}
            {typesLoading && <Loader2 className="h-3 w-3 animate-spin ml-1" />}
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Select Measurement Type</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => onTypeChange(null)} className="flex items-center justify-between">
            All Types
            {selectedType === null && <Check className="h-4 w-4" />}
          </DropdownMenuItem>

          {typesLoading ? (
            <DropdownMenuItem disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading measurement types...
            </DropdownMenuItem>
          ) : typesError ? (
            <DropdownMenuItem disabled className="text-destructive">
              Error loading measurement types
            </DropdownMenuItem>
          ) : measurementTypes.length === 0 ? (
            <DropdownMenuItem disabled>No measurement types available</DropdownMenuItem>
          ) : (
            measurementTypes.map((type) => (
              <DropdownMenuItem
                key={type.id}
                onClick={() => onTypeChange(type.id)}
                className="flex items-center justify-between"
              >
                {type.name}
                {selectedType === type.id && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            ))
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

