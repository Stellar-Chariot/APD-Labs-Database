"use client"

import { useState, useEffect, useCallback } from "react"

// Define visualization types
export interface Visualization {
  id: string
  title: string
  description: string
  type: "comparison" | "temperature" | "parameter-study" | "analysis" | "custom"
  createdAt: Date
  createdBy: string
  thumbnail: string
  measurements: string[]
  config?: Record<string, any>
}

// Mock visualizations data
const VISUALIZATIONS: Visualization[] = [
  {
    id: "v1",
    title: "GaAs QW PL Comparison",
    description: "Comparison of PL spectra from different GaAs quantum well samples",
    type: "comparison",
    createdAt: new Date("2025-03-15T10:30:00Z"),
    createdBy: "Scott Sifferman",
    thumbnail: "/placeholder.svg?height=200&width=300",
    measurements: ["m1", "m4", "m7"],
    config: {
      xAxis: "wavelength",
      yAxis: "intensity",
      normalize: true,
      chartType: "line",
      colorScheme: "spectral",
      showLegend: true,
      showGrid: true,
      xLabel: "Wavelength (nm)",
      yLabel: "Intensity (a.u.)",
    },
  },
  {
    id: "v2",
    title: "Temperature Dependent PL",
    description: "PL spectra at different temperatures for sample T250306A",
    type: "temperature",
    createdAt: new Date("2025-03-16T14:45:00Z"),
    createdBy: "Maria Chen",
    thumbnail: "/placeholder.svg?height=200&width=300",
    measurements: ["m2", "m3", "m5"],
    config: {
      xAxis: "wavelength",
      yAxis: "intensity",
      normalize: true,
      chartType: "line",
      colorScheme: "viridis",
      showLegend: true,
      showGrid: true,
      xLabel: "Wavelength (nm)",
      yLabel: "Intensity (a.u.)",
    },
  },
  {
    id: "v3",
    title: "AlGaAs Barrier Thickness Study",
    description: "Effect of barrier thickness on QW emission properties",
    type: "parameter-study",
    createdAt: new Date("2025-03-18T09:15:00Z"),
    createdBy: "James Wilson",
    thumbnail: "/placeholder.svg?height=200&width=300",
    measurements: ["m1", "m2", "m6"],
    config: {
      xAxis: "wavelength",
      yAxis: "intensity",
      normalize: false,
      chartType: "line",
      colorScheme: "plasma",
      showLegend: true,
      showGrid: true,
      xLabel: "Energy (eV)",
      yLabel: "Intensity (a.u.)",
    },
  },
  {
    id: "v4",
    title: "InGaAs QD Size Distribution",
    description: "Analysis of quantum dot size distribution from PL data",
    type: "analysis",
    createdAt: new Date("2025-03-20T11:30:00Z"),
    createdBy: "Scott Sifferman",
    thumbnail: "/placeholder.svg?height=200&width=300",
    measurements: ["m5"],
    config: {
      xAxis: "size",
      yAxis: "frequency",
      normalize: false,
      chartType: "bar",
      colorScheme: "default",
      showLegend: false,
      showGrid: true,
      xLabel: "QD Size (nm)",
      yLabel: "Frequency",
    },
  },
]

// Simulate network delay
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Mock visualization service implementation
export const visualizationService = {
  // Hook for fetching visualizations with loading and error states
  useVisualizations: () => {
    const [visualizations, setVisualizations] = useState<Visualization[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchVisualizations = useCallback(async () => {
      try {
        setIsLoading(true)
        // Simulate API call
        await delay(500)
        setVisualizations([...VISUALIZATIONS])
        setError(null)
      } catch (err) {
        console.error("Error fetching visualizations:", err)
        setError("Failed to load visualizations")
      } finally {
        setIsLoading(false)
      }
    }, [])

    useEffect(() => {
      fetchVisualizations()
    }, [fetchVisualizations])

    return { visualizations, isLoading, error, refetch: fetchVisualizations }
  },

  // Get a single visualization by ID
  async getVisualization(id: string): Promise<Visualization> {
    await delay(300) // Simulate network delay

    const visualization = VISUALIZATIONS.find((v) => v.id === id)

    if (!visualization) {
      throw new Error(`Visualization with ID ${id} not found`)
    }

    return visualization
  },

  // Create a new visualization
  async createVisualization(
    data: Omit<Visualization, "id" | "createdAt" | "createdBy" | "thumbnail">,
  ): Promise<Visualization> {
    await delay(500) // Simulate network delay

    const newVisualization: Visualization = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      createdBy: "current-user", // In a real app, this would be the current user's name
      thumbnail: "/placeholder.svg?height=200&width=300", // In a real app, this would be generated from the visualization
    }

    // In a real app, this would be saved to a database
    console.log("Created visualization:", newVisualization)

    // Add to local array for demo purposes
    VISUALIZATIONS.push(newVisualization)

    return newVisualization
  },

  // Update a visualization
  async updateVisualization(id: string, updates: Partial<Visualization>): Promise<Visualization> {
    await delay(500) // Simulate network delay

    const index = VISUALIZATIONS.findIndex((v) => v.id === id)

    if (index === -1) {
      throw new Error(`Visualization with ID ${id} not found`)
    }

    // Update the visualization
    const updatedVisualization = {
      ...VISUALIZATIONS[index],
      ...updates,
    }

    // In a real app, this would update the database
    console.log("Updated visualization:", updatedVisualization)

    // Update local array for demo purposes
    VISUALIZATIONS[index] = updatedVisualization

    return updatedVisualization
  },

  // Delete a visualization
  async deleteVisualization(id: string): Promise<void> {
    await delay(500) // Simulate network delay

    const index = VISUALIZATIONS.findIndex((v) => v.id === id)

    if (index === -1) {
      throw new Error(`Visualization with ID ${id} not found`)
    }

    // In a real app, this would delete from the database
    console.log(`Deleted visualization with ID ${id}`)

    // Remove from local array for demo purposes
    VISUALIZATIONS.splice(index, 1)
  },
}

