"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface RecipeLayer {
  id: number
  recipe_id: number
  layer_number: number
  material: string
  thickness: number
  growth_time: number
  temperature: number
  description: string | null
}

// Define a set of colors for different materials
const materialColors: { [key: string]: string } = {
  GaN: "#3b82f6", // blue
  AlN: "#6366f1", // indigo
  InN: "#8b5cf6", // violet
  AlGaN: "#a855f7", // purple
  InGaN: "#d946ef", // fuchsia
  SiC: "#ec4899", // pink
  Si: "#f43f5e", // rose
  Sapphire: "#f97316", // orange
  GaAs: "#eab308", // yellow
  InP: "#84cc16", // lime
  Ge: "#22c55e", // green
  ZnO: "#14b8a6", // teal
  SiO2: "#06b6d4", // cyan
  // Default color for any other materials
  default: "#6b7280", // gray
}

// Function to get color for a material
const getMaterialColor = (material: string): string => {
  // Extract base material (e.g., "GaN:Si" -> "GaN")
  const baseMaterial = material.split(":")[0].trim()

  // Check if we have a predefined color for this material
  for (const [key, value] of Object.entries(materialColors)) {
    if (baseMaterial.includes(key)) {
      return value
    }
  }

  // Return default color if no match
  return materialColors.default
}

export function RecipeLayersVisualization({ layers }: { layers: RecipeLayer[] }) {
  const [totalThickness, setTotalThickness] = useState(0)

  // Calculate total thickness for scaling
  useEffect(() => {
    if (layers.length > 0) {
      const total = layers.reduce((sum, layer) => sum + layer.thickness, 0)
      setTotalThickness(total)
    }
  }, [layers])

  if (layers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Layer Structure</CardTitle>
          <CardDescription>Visual representation of recipe layers</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <p className="text-muted-foreground">No layers defined for this recipe yet</p>
        </CardContent>
      </Card>
    )
  }

  // Sort layers by layer number (bottom to top)
  const sortedLayers = [...layers].sort((a, b) => b.layer_number - a.layer_number)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Layer Structure</CardTitle>
        <CardDescription>Visual representation of recipe layers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex">
          {/* Layer visualization */}
          <div className="w-1/2 pr-4">
            <div className="border rounded-md h-[400px] flex flex-col justify-end relative">
              {sortedLayers.map((layer) => {
                // Calculate height percentage based on thickness
                const heightPercentage = (layer.thickness / totalThickness) * 100
                // Ensure minimum height for very thin layers
                const height = Math.max(heightPercentage, 3)

                return (
                  <TooltipProvider key={layer.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="w-full flex items-center px-3 border-t transition-colors hover:brightness-110"
                          style={{
                            height: `${height}%`,
                            backgroundColor: getMaterialColor(layer.material),
                            color: "white",
                          }}
                        >
                          <span className="font-semibold truncate">
                            {layer.material} ({layer.thickness} Å)
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-sm">
                        <div className="space-y-1">
                          <p className="font-semibold">{layer.material}</p>
                          <p>Layer {layer.layer_number}</p>
                          <p>Thickness: {layer.thickness} Å</p>
                          <p>Growth Time: {layer.growth_time} s</p>
                          <p>Temperature: {layer.temperature} °C</p>
                          {layer.description && <p>{layer.description}</p>}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )
              })}

              {/* Substrate indicator */}
              <div className="w-full h-[10%] bg-gray-200 border-t flex items-center justify-center">
                <span className="text-sm font-medium text-gray-700">Substrate</span>
              </div>
            </div>
          </div>

          {/* Layer legend */}
          <div className="w-1/2 pl-4">
            <div className="border rounded-md p-4 h-[400px] overflow-y-auto">
              <h3 className="font-medium mb-3">Layer Details</h3>
              <div className="space-y-3">
                {sortedLayers.map((layer) => (
                  <div key={layer.id} className="flex items-start space-x-2">
                    <div
                      className="w-4 h-4 mt-1 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: getMaterialColor(layer.material) }}
                    ></div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{layer.material}</span>
                        <Badge variant="outline">Layer {layer.layer_number}</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        <p>Thickness: {layer.thickness} Å</p>
                        <p>Growth Time: {layer.growth_time} s</p>
                        <p>Temperature: {layer.temperature} °C</p>
                        {layer.description && <p className="mt-1 italic">{layer.description}</p>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
