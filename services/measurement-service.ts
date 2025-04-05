import type { Measurement } from "@/types/measurement"
import {
  fetchMeasurements,
  fetchMeasurementById,
  fetchMeasurementsBySampleId,
  createMeasurementApi,
  updateMeasurementApi,
  deleteMeasurementApi,
} from "@/lib/simulated-api-adapter"
import { ApiRequestError } from "@/lib/api-client"

export async function getAllMeasurements(): Promise<Measurement[]> {
  try {
    return await fetchMeasurements()
  } catch (error) {
    console.error("Error fetching measurements:", error)

    if (error instanceof ApiRequestError) {
      throw new Error(`Failed to fetch measurements: ${error.message}`)
    }

    // Return an empty array instead of throwing an error for better UX
    return []
  }
}

export async function getMeasurementById(id: string): Promise<Measurement | null> {
  try {
    if (!id) {
      throw new Error("Measurement ID is required")
    }

    return await fetchMeasurementById(id)
  } catch (error) {
    console.error(`Error fetching measurement ${id}:`, error)

    if (error instanceof ApiRequestError && error.status === 404) {
      return null // Not found is a valid response
    }

    if (error instanceof ApiRequestError) {
      throw new Error(`Failed to fetch measurement: ${error.message}`)
    }

    return null
  }
}

export async function getMeasurementsBySampleId(sampleId: string): Promise<Measurement[]> {
  try {
    if (!sampleId) {
      throw new Error("Sample ID is required")
    }

    return await fetchMeasurementsBySampleId(sampleId)
  } catch (error) {
    console.error(`Error fetching measurements for sample ${sampleId}:`, error)

    if (error instanceof ApiRequestError) {
      throw new Error(`Failed to fetch measurements: ${error.message}`)
    }

    // Return an empty array instead of throwing an error for better UX
    return []
  }
}

export async function createMeasurement(measurement: Partial<Measurement>): Promise<Measurement> {
  try {
    return await createMeasurementApi(measurement)
  } catch (error) {
    console.error("Error creating measurement:", error)

    if (error instanceof ApiRequestError) {
      throw new Error(`Failed to create measurement: ${error.message}`)
    }

    throw new Error("Failed to create measurement")
  }
}

export async function updateMeasurement(id: string, measurement: Partial<Measurement>): Promise<Measurement> {
  try {
    if (!id) {
      throw new Error("Measurement ID is required")
    }

    return await updateMeasurementApi(id, measurement)
  } catch (error) {
    console.error(`Error updating measurement ${id}:`, error)

    if (error instanceof ApiRequestError) {
      throw new Error(`Failed to update measurement: ${error.message}`)
    }

    throw new Error(`Failed to update measurement ${id}`)
  }
}

export async function deleteMeasurement(id: string): Promise<void> {
  try {
    if (!id) {
      throw new Error("Measurement ID is required")
    }

    await deleteMeasurementApi(id)
  } catch (error) {
    console.error(`Error deleting measurement ${id}:`, error)

    if (error instanceof ApiRequestError) {
      throw new Error(`Failed to delete measurement: ${error.message}`)
    }

    throw new Error(`Failed to delete measurement ${id}`)
  }
}

