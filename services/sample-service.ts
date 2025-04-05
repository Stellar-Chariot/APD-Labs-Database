import type { Sample } from "@/types/sample"
import {
  fetchSamples,
  fetchSampleById,
  createSampleApi,
  updateSampleApi,
  deleteSampleApi,
} from "@/lib/simulated-api-adapter"
import { ApiRequestError } from "@/lib/api-client"

export async function getSamples(): Promise<Sample[]> {
  try {
    return await fetchSamples()
  } catch (error) {
    console.error("Error fetching samples:", error)

    if (error instanceof ApiRequestError) {
      throw new Error(`Failed to fetch samples: ${error.message}`)
    }

    // Return an empty array instead of throwing an error for better UX
    return []
  }
}

export async function getSampleById(id: string): Promise<Sample | null> {
  try {
    if (!id) {
      throw new Error("Sample ID is required")
    }

    return await fetchSampleById(id)
  } catch (error) {
    console.error(`Error fetching sample ${id}:`, error)

    if (error instanceof ApiRequestError && error.status === 404) {
      return null // Not found is a valid response
    }

    if (error instanceof ApiRequestError) {
      throw new Error(`Failed to fetch sample: ${error.message}`)
    }

    return null
  }
}

export async function createSample(sample: Omit<Sample, "id" | "createdAt">): Promise<Sample> {
  try {
    return await createSampleApi(sample)
  } catch (error) {
    console.error("Error creating sample:", error)

    if (error instanceof ApiRequestError) {
      throw new Error(`Failed to create sample: ${error.message}`)
    }

    throw new Error("Failed to create sample")
  }
}

export async function updateSample(id: string, sample: Partial<Sample>): Promise<Sample> {
  try {
    if (!id) {
      throw new Error("Sample ID is required")
    }

    return await updateSampleApi(id, sample)
  } catch (error) {
    console.error(`Error updating sample ${id}:`, error)

    if (error instanceof ApiRequestError) {
      throw new Error(`Failed to update sample: ${error.message}`)
    }

    throw new Error(`Failed to update sample ${id}`)
  }
}

export async function deleteSample(id: string): Promise<void> {
  try {
    if (!id) {
      throw new Error("Sample ID is required")
    }

    await deleteSampleApi(id)
  } catch (error) {
    console.error(`Error deleting sample ${id}:`, error)

    if (error instanceof ApiRequestError) {
      throw new Error(`Failed to delete sample: ${error.message}`)
    }

    throw new Error(`Failed to delete sample ${id}`)
  }
}

