"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import type { MBERecipe } from "@/types/mbe-recipe"
import type { Sample } from "@/types/sample"
import { useSampleQuery } from "@/hooks/use-query-samples"

interface Layer {
  material: string
  thickness: number
  color: string
  description?: string
}

interface LayerStructureVisualizationProps {
  recipe: MBERecipe
  compact?: boolean
}

export function LayerStructureVisualization({ recipe, compact = false }: LayerStructureVisualizationProps) {
  const [showDetails, setShowDetails] = useState(!compact)
  const [layers, setLayers] = useState<Layer[]>([])

  // Fetch the linked sample data
  const { data: sample } = useSampleQuery(recipe.sampleId)

  // Parse layer structure from recipe and sample data
  useEffect(() => {
    const parsedLayers = parseLayerStructure(recipe, sample)
    setLayers(parsedLayers)
  }, [recipe, sample])

  // If no layers could be parsed, show a message
  if (layers.length === 0) {
    return (
      <Card className={compact ? "h-full" : ""}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Layer Structure</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">No layer structure information available.</div>
        </CardContent>
      </Card>
    )
  }

  // Calculate total height for visualization
  const totalHeight = compact
    ? Math.min(200, layers.length * 50)
    : // For compact view, up to 200px or based on layers
      Math.min(600, Math.max(400, layers.length * 60)) // For detailed view, between 400-600px

  // Calculate max thickness for scaling
  const totalThickness = layers.reduce((sum, layer) => sum + layer.thickness, 0)

  // Minimum height for very thin layers (for visibility)
  const minLayerHeight = compact ? 20 : 40

  // Calculate heights proportionally
  const calculateHeight = (thickness: number) => {
    // Calculate proportional height
    const proportionalHeight = (thickness / totalThickness) * (totalHeight - layers.length * minLayerHeight)
    // Add minimum height to ensure visibility
    return proportionalHeight + minLayerHeight
  }

  // Update the component to ensure the visualization fits properly

  // Change the Card component to have auto height
  return (
    <Card className={`${compact ? "h-full" : "min-h-[500px]"} flex flex-col`}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Layer Structure</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setShowDetails(!showDetails)} className="h-8 w-8 p-0">
          {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="sr-only">{showDetails ? "Hide" : "Show"} Details</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <div className="flex flex-col md:flex-row gap-4 h-full">
          <div className={`flex-1 flex flex-col items-center ${showDetails ? "md:w-1/2" : "w-full"}`}>
            <div className="w-full max-w-[200px] border border-gray-300 bg-blue-50 overflow-auto">
              {layers.map((layer, index) => {
                // Calculate height based on thickness - proportional but with minimum size
                const height = calculateHeight(layer.thickness)
                return (
                  <div
                    key={index}
                    className="relative border-b border-gray-300 flex items-center justify-center p-2"
                    style={{
                      height: `${height}px`,
                      backgroundColor: layer.color,
                      minHeight: `${minLayerHeight}px`,
                    }}
                  >
                    <div className="text-sm font-medium text-center break-words w-full overflow-hidden">
                      {layer.material} {layer.thickness}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {showDetails && (
            <div className="flex-1 md:w-1/2 overflow-auto">
              <div className="text-sm">
                <h4 className="font-medium mb-2">Growth Parameters</h4>
                <dl className="grid grid-cols-2 gap-1">
                  {recipe.growthParameters &&
                    Object.entries(recipe.growthParameters).map(
                      ([key, value]) =>
                        value &&
                        key !== "layerStructure" && (
                          <React.Fragment key={key}>
                            <dt className="text-xs font-medium text-muted-foreground">{formatParameterName(key)}</dt>
                            <dd className="text-xs">{value}</dd>
                          </React.Fragment>
                        ),
                    )}
                </dl>

                {sample && (
                  <>
                    <h4 className="font-medium mt-4 mb-2">Sample Information</h4>
                    <dl className="grid grid-cols-2 gap-1">
                      <dt className="text-xs font-medium text-muted-foreground">Sample ID</dt>
                      <dd className="text-xs">{sample.id}</dd>
                      <dt className="text-xs font-medium text-muted-foreground">Sample Type</dt>
                      <dd className="text-xs">{sample.type || "N/A"}</dd>
                      {sample.metadata?.substrate && (
                        <>
                          <dt className="text-xs font-medium text-muted-foreground">Substrate</dt>
                          <dd className="text-xs">{sample.metadata.substrate}</dd>
                        </>
                      )}
                    </dl>
                  </>
                )}

                {recipe.description && (
                  <>
                    <h4 className="font-medium mt-4 mb-2">Notes</h4>
                    <p className="text-xs whitespace-pre-wrap">{recipe.description}</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to parse layer structure from recipe and sample
function parseLayerStructure(recipe: MBERecipe, sample?: Sample | null): Layer[] {
  const layers: Layer[] = []

  // First try to parse from the dedicated layerStructure field
  if (recipe.growthParameters?.layerStructure) {
    const parsedLayers = parseLayerStructureText(recipe.growthParameters.layerStructure)
    if (parsedLayers.length > 0) {
      return parsedLayers
    }
  }

  // Then try to parse from the description
  if (recipe.description) {
    const parsedLayers = parseLayerStructureFromDescription(recipe.description)
    if (parsedLayers.length > 0) {
      return parsedLayers
    }
  }

  // If we have sample data, use it to inform our layer structure
  if (sample) {
    // Create a basic structure based on sample type
    const sampleType = sample.type?.toLowerCase() || ""
    const substrate = sample.metadata?.substrate || "Substrate"

    if (sampleType.includes("gan")) {
      layers.push(
        { material: "GaN", thickness: 100, color: getMaterialColor("GaN") },
        { material: "AlGaN", thickness: 2000, color: getMaterialColor("AlGaN") },
        { material: "GaN", thickness: 1000, color: getMaterialColor("GaN") },
        { material: substrate, thickness: 1500, color: getMaterialColor(substrate) },
      )
    } else if (sampleType.includes("gaas")) {
      layers.push(
        { material: "GaAs", thickness: 100, color: getMaterialColor("GaAs") },
        { material: "AlGaAs", thickness: 3000, color: getMaterialColor("AlGaAs") },
        { material: "GaAs", thickness: 2000, color: getMaterialColor("GaAs") },
        { material: substrate, thickness: 1500, color: getMaterialColor(substrate) },
      )
    } else {
      // Generic structure based on recipe name
      const materialMatches = recipe.name?.match(/(GaN|AlGaN|InGaN|GaAs|AlAs|AlGaAs)/g) || []
      if (materialMatches.length > 0) {
        // Create a simple structure with the detected materials
        const uniqueMaterials = Array.from(new Set(materialMatches))
        uniqueMaterials.forEach((material, index) => {
          layers.push({
            material,
            thickness: 1000 - index * 200, // Just for visualization
            color: getMaterialColor(material),
          })
        })
      } else {
        // Default to a simple two-layer structure
        layers.push(
          { material: "Layer", thickness: 2000, color: getMaterialColor("Layer") },
          { material: substrate, thickness: 1500, color: getMaterialColor(substrate) },
        )
      }

      // Add substrate
      layers.push({
        material: substrate,
        thickness: 1500,
        color: getMaterialColor(substrate),
      })
    }
  }

  return layers
}

// Helper function to parse layer structure from text
function parseLayerStructureText(text: string): Layer[] {
  const layers: Layer[] = []

  // Split by lines and process each line
  const lines = text.split(/[\n,;]/).filter((line) => line.trim().length > 0)

  for (const line of lines) {
    // Try to match thickness and material
    // Patterns like: "100 Ang GaAs", "GaAs 100nm", "AlGaAs (3000Å)", etc.
    const match =
      line.match(/(\d+)\s*(?:Ang|nm|Å)?\s*(GaAs|AlAs|AlGaAs|GaN|AlGaN|InGaN|Si|Sapphire|SiC|Substrate)/i) ||
      line.match(/(GaAs|AlAs|AlGaAs|GaN|AlGaN|InGaN|Si|Sapphire|SiC|Substrate)\s*(\d+)\s*(?:Ang|nm|Å)?/i)

    if (match) {
      const [_, part1, part2] = match

      // Determine which part is the thickness and which is the material
      let thickness: number
      let material: string

      if (isNaN(Number(part1))) {
        material = part1
        thickness = Number.parseInt(part2)
      } else {
        thickness = Number.parseInt(part1)
        material = part2
      }

      layers.push({
        material,
        thickness,
        color: getMaterialColor(material),
      })
    } else if (line.toLowerCase().includes("substrate")) {
      // Add substrate
      const substrateMatch = line.match(/(GaAs|Si|Sapphire|SiC)/i)
      layers.push({
        material: substrateMatch ? substrateMatch[1] : "Substrate",
        thickness: 1500,
        color: getMaterialColor(substrateMatch ? substrateMatch[1] : "Substrate"),
      })
    }
  }

  return layers
}

// Helper function to parse layer structure from description
function parseLayerStructureFromDescription(description: string): Layer[] {
  const layers: Layer[] = []

  // Split by lines
  const lines = description.split("\n")

  // Look for a section that might contain layer structure
  let inLayerSection = false
  for (const line of lines) {
    if (
      line.toLowerCase().includes("layer structure") ||
      line.toLowerCase().includes("structure:") ||
      line.toLowerCase().includes("layers:")
    ) {
      inLayerSection = true
      continue
    }

    if (inLayerSection) {
      // Try to match layer information
      const match = line.match(/(\d+)\s*(?:Ang|nm|Å)?\s*(GaAs|AlAs|AlGaAs|GaN|AlGaN|InGaN|Si|Sapphire|SiC)/i)
      if (match) {
        layers.push({
          material: match[2],
          thickness: Number.parseInt(match[1]),
          color: getMaterialColor(match[2]),
        })
      } else if (line.toLowerCase().includes("substrate")) {
        // Add substrate
        const substrateMatch = line.match(/(GaAs|Si|Sapphire|SiC)/i)
        layers.push({
          material: substrateMatch ? substrateMatch[1] : "Substrate",
          thickness: 1500,
          color: getMaterialColor(substrateMatch ? substrateMatch[1] : "Substrate"),
        })
      } else if (line.trim() === "") {
        // Empty line might indicate end of layer section
        if (layers.length > 0) {
          inLayerSection = false
        }
      }
    }
  }

  return layers
}

// Helper function to get color for material
function getMaterialColor(material: string): string {
  const materialColors: Record<string, string> = {
    GaAs: "#d1fae5", // green-100
    AlAs: "#dbeafe", // blue-100
    AlGaAs: "#c7d2fe", // indigo-100
    GaN: "#a7f3d0", // green-200
    AlGaN: "#bfdbfe", // blue-200
    InGaN: "#fef3c7", // yellow-100
    Si: "#f3f4f6", // gray-100
    Sapphire: "#ede9fe", // violet-100
    SiC: "#e5e7eb", // gray-200
    Substrate: "#e5e7eb", // gray-200
    Layer: "#f3f4f6", // gray-100
  }

  // Case-insensitive matching
  const materialLower = material.toLowerCase()
  for (const [key, value] of Object.entries(materialColors)) {
    if (key.toLowerCase() === materialLower) {
      return value
    }
  }

  return "#f3f4f6" // Default to gray-100
}

// Helper function to format parameter names
function formatParameterName(name: string): string {
  return name
    .replace(/([A-Z])/g, " $1") // Add space before capital letters
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
}

