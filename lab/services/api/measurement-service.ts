"use client"

/**
 * Refactored measurement service that extends the base service.
 * This provides more consistent error handling and caching.
 */

import { useState, useEffect } from "react"
import { BaseService, type ApiResponse } from "./base-service"
import type {
  Measurement,
  MeasurementParameter,
  MeasurementType,
  MeasurementTypeId,
  Sample,
} from "@/types/measurement-types"

// Mock data (same as before)
const MEASUREMENTS: Measurement[] = [
  // ... existing mock data
]

const SAMPLES: Sample[] = [
  // ... existing mock data
]

const MEASUREMENT_TYPES: MeasurementType[] = [
  // ... existing mock data
]

const PARAMETER_DEFINITIONS: Record<MeasurementTypeId, MeasurementParameter[]> = {
  // ... existing mock data
}

// Simulate network delay
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

class MeasurementServiceImpl extends BaseService {
  // Get all measurement types
  async getMeasurementTypes(): Promise<MeasurementType[]> {
    return this.apiRequest(
      async () => {
        await delay(300) // Simulate network delay
        return MEASUREMENT_TYPES
      },
      { cacheKey: "measurement-types", cacheDuration: 30 * 60 * 1000 }, // Cache for 30 minutes
    )
  }

  // Get parameters for a specific measurement type
  async getMeasurementParameters(typeId: MeasurementTypeId): Promise<MeasurementParameter[]> {
    return this.apiRequest(
      async () => {
        await delay(300) // Simulate network delay
        return PARAMETER_DEFINITIONS[typeId] || []
      },
      { cacheKey: `measurement-parameters-${typeId}`, cacheDuration: 30 * 60 * 1000 },
    )
  }

  // Get all samples
  async getSamples(): Promise<Sample[]> {
    return this.apiRequest(
      async () => {
        await delay(300) // Simulate network delay
        return SAMPLES
      },
      { cacheKey: "samples", cacheDuration: 5 * 60 * 1000 }, // Cache for 5 minutes
    )
  }

  // Create a new measurement
  async createMeasurement(measurement: Measurement): Promise<Measurement> {
    return this.apiRequest(async () => {
      await delay(500) // Simulate network delay

      const newMeasurement: Measurement = {
        ...measurement,
        id: measurement.id || generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      // In a real app, this would be saved to a database
      console.log("Created measurement:", newMeasurement)

      // Add to local array for demo purposes
      if (!measurement.id) {
        MEASUREMENTS.push(newMeasurement)
      }

      return newMeasurement
    })
  }

  // Get all measurements with optional filtering
  async getMeasurements(filters?: Record<string, any>): Promise<Measurement[]> {
    return this.apiRequest(async () => {
      await delay(300) // Simulate network delay

      let filteredMeasurements = [...MEASUREMENTS]

      // Apply filters if provided
      if (filters) {
        if (filters.sampleId) {
          filteredMeasurements = filteredMeasurements.filter((m) => m.sampleId === filters.sampleId)
        }

        if (filters.measurementType) {
          filteredMeasurements = filteredMeasurements.filter((m) => m.measurementType === filters.measurementType)
        }

        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          filteredMeasurements = filteredMeasurements.filter(
            (m) =>
              m.title.toLowerCase().includes(searchLower) ||
              (m.description && m.description.toLowerCase().includes(searchLower)),
          )
        }
      }

      return filteredMeasurements
    })
  }

  // Get a single measurement by ID
  async getMeasurement(id: string): Promise<Measurement> {
    return this.apiRequest(
      async () => {
        await delay(300) // Simulate network delay

        const measurement = MEASUREMENTS.find((m) => m.id === id)

        if (!measurement) {
          throw new Error(`Measurement with ID ${id} not found`)
        }

        return measurement
      },
      { cacheKey: `measurement-${id}`, cacheDuration: 5 * 60 * 1000 },
    )
  }

  // React hook for fetching measurements with loading and error states
  useMeasurements(filters?: Record<string, any>): ApiResponse<Measurement[]> {
    const [data, setData] = useState<Measurement[] | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
          const result = await this.getMeasurements(filters)
          setData(result)
        } catch (e: any) {
          setError(e)
        } finally {
          setLoading(false)
        }
      }

      fetchData()
    }, [JSON.stringify(filters)])

    return { data, loading, error }
  }

  // React hook for fetching a single measurement
  useMeasurement(id: string): ApiResponse<Measurement> {
    const [data, setData] = useState<Measurement | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
          const result = await this.getMeasurement(id)
          setData(result)
        } catch (e: any) {
          setError(e)
        } finally {
          setLoading(false)
        }
      }

      fetchData()
    }, [id])

    return { data, loading, error }
  }

  // Get count of measurements for a sample
  async getMeasurementCountForSample(sampleId: string): Promise<number> {
    return this.apiRequest(async () => {
      await delay(200) // Simulate network delay
      return MEASUREMENTS.filter((m) => m.sampleId === sampleId).length
    })
  }

  // React hook for getting measurement count for a sample
  useMeasurementCountForSample(sampleId: string): ApiResponse<number> {
    const [data, setData] = useState<number | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
      const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
          const result = await this.getMeasurementCountForSample(sampleId)
          setData(result)
        } catch (e: any) {
          setError(e)
        } finally {
          setLoading(false)
        }
      }

      fetchData()
    }, [sampleId])

    return { data, loading, error }
  }
}

// Export a singleton instance
export const measurementService = new MeasurementServiceImpl()

