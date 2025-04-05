"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { LayerStructureVisualization } from "@/components/layer-structure-visualization"
import type { MBERecipe } from "@/types/mbe-recipe"
import { useSampleQuery } from "@/hooks/use-query-samples"

interface LayerStructureDialogProps {
  recipe: MBERecipe
  open: boolean
  onClose: () => void
}

export function LayerStructureDialog({ recipe, open, onClose }: LayerStructureDialogProps) {
  // Fetch the sample data for additional context
  const { data: sample } = useSampleQuery(recipe.sampleId)

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div>
            <DialogTitle>Layer Structure: {recipe.name}</DialogTitle>
            {sample && <DialogDescription>Sample: {sample.name || sample.id}</DialogDescription>}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-1">
          <LayerStructureVisualization recipe={recipe} />
        </div>
      </DialogContent>
    </Dialog>
  )
}

