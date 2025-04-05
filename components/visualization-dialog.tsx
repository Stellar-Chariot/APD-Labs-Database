"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { DynamicVisualization } from "@/components/dynamic-visualization"
import type { Measurement } from "@/types/measurement"
import { useSampleQuery } from "@/hooks/use-query-samples"

interface VisualizationDialogProps {
  measurement: Measurement
  open: boolean
  onClose: () => void
}

export function VisualizationDialog({ measurement, open, onClose }: VisualizationDialogProps) {
  // Fetch the sample data for additional context
  const { data: sample } = useSampleQuery(measurement.sampleId)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>{measurement.name || measurement.id}</DialogTitle>
            <DialogDescription>
              {measurement.type.toUpperCase()} • {new Date(measurement.date).toLocaleDateString()}
              {sample && ` • Sample: ${sample.name || sample.id}`}
            </DialogDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-1">
          <DynamicVisualization measurement={measurement} height={500} showControls={true} />

          {/* Add metadata display */}
          {Object.keys(measurement.metadata || {}).length > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md border">
              <h3 className="text-sm font-medium mb-2">Measurement Metadata</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                {Object.entries(measurement.metadata || {}).map(([key, value]) => (
                  <div key={key} className="flex">
                    <dt className="font-medium mr-2">{key}:</dt>
                    <dd>{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

