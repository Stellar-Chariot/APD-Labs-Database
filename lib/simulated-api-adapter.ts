import {
  getAllSamples,
  getSample,
  createSample,
  updateSample,
  deleteSample,
  getAllMeasurements,
  getMeasurement,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
  getAllRecipes,
  getRecipe,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from "@/lib/simulated-db"
import type { Sample } from "@/types/sample"
import type { Measurement } from "@/types/measurement"
import type { MBERecipe } from "@/types/mbe-recipe"
import type { NextApiRequest } from "next"

// This adapter translates between our API client and the simulated backend
// In a real application, this would be replaced with actual API calls

// Samples API
export async function fetchSamples(): Promise<Sample[]> {
  try {
    return await getAllSamples()
  } catch (error) {
    throw error
  }
}

export async function fetchSampleById(id: string): Promise<Sample> {
  try {
    const sample = await getSample(id)
    if (!sample) {
      throw new Error(`Sample with ID ${id} not found`)
    }
    return sample
  } catch (error) {
    throw error
  }
}

export async function createSampleApi(sample: Omit<Sample, "id" | "createdAt">): Promise<Sample> {
  try {
    const response = await createSample(sample)
    if (!response) {
      throw new Error("Failed to create sample")
    }
    return response
  } catch (error) {
    throw error
  }
}

export async function updateSampleApi(id: string, sample: Partial<Sample>): Promise<Sample> {
  try {
    const response = await updateSample(id, sample)
    if (!response) {
      throw new Error(`Sample with ID ${id} not found`)
    }
    return response
  } catch (error) {
    throw error
  }
}

export async function deleteSampleApi(id: string): Promise<void> {
  try {
    await deleteSample(id)
  } catch (error) {
    throw error
  }
}

// Measurements API
export async function fetchMeasurements(): Promise<Measurement[]> {
  try {
    return await getAllMeasurements()
  } catch (error) {
    throw error
  }
}

export async function fetchMeasurementById(id: string): Promise<Measurement> {
  try {
    const measurement = await getMeasurement(id)
    if (!measurement) {
      throw new Error(`Measurement with ID ${id} not found`)
    }
    return measurement
  } catch (error) {
    throw error
  }
}

export async function fetchMeasurementsBySampleId(sampleId: string): Promise<Measurement[]> {
  try {
    const measurements = await getAllMeasurements()
    return measurements.filter((m) => m.sampleId === sampleId)
  } catch (error) {
    throw error
  }
}

export async function createMeasurementApi(measurement: Partial<Measurement>): Promise<Measurement> {
  try {
    const response = await createMeasurement(measurement)
    if (!response) {
      throw new Error("Failed to create measurement")
    }
    return response
  } catch (error) {
    throw error
  }
}

export async function updateMeasurementApi(id: string, measurement: Partial<Measurement>): Promise<Measurement> {
  try {
    const response = await updateMeasurement(id, measurement)
    if (!response) {
      throw new Error(`Measurement with ID ${id} not found`)
    }
    return response
  } catch (error) {
    throw error
  }
}

export async function deleteMeasurementApi(id: string): Promise<void> {
  try {
    await deleteMeasurement(id)
  } catch (error) {
    throw error
  }
}

// MBE Recipes API
export async function fetchRecipes(): Promise<MBERecipe[]> {
  try {
    return await getAllRecipes()
  } catch (error) {
    throw error
  }
}

export async function fetchRecipeById(id: string): Promise<MBERecipe> {
  try {
    const response = await getRecipe(id)
    if (!response) {
      throw new Error(`Recipe with ID ${id} not found`)
    }
    return response
  } catch (error) {
    throw error
  }
}

export async function fetchRecipesBySampleId(sampleId: string): Promise<MBERecipe | null> {
  try {
    const recipes = await getAllRecipes()
    return recipes.find((recipe) => recipe.sampleId === sampleId) || null
  } catch (error) {
    throw error
  }
}

export async function createRecipeApi(recipe: Partial<MBERecipe>): Promise<MBERecipe> {
  try {
    const response = await createRecipe(recipe)
    if (!response) {
      throw new Error("Failed to create recipe")
    }
    return response
  } catch (error) {
    throw error
  }
}

export async function updateRecipeApi(id: string, recipe: Partial<MBERecipe>): Promise<MBERecipe> {
  try {
    const response = await updateRecipe(id, recipe)
    if (!response) {
      throw new Error(`Recipe with ID ${id} not found`)
    }
    return response
  } catch (error) {
    throw error
  }
}

export async function deleteRecipeApi(id: string): Promise<void> {
  try {
    await deleteRecipe(id)
  } catch (error) {
    throw error
  }
}

// File Upload API
export async function uploadFileApi(file: File): Promise<any> {
  try {
    throw new Error("File upload API not implemented")
  } catch (error) {
    throw error
  }
}

// Add or update these handler functions in your simulated backend

// Handler for GET /api/samples
export async function handleGetSamples(req: NextApiRequest) {
  const samples = await getAllSamples()
  return samples
}

// Handler for GET /api/measurements with filter support
export async function handleGetMeasurements(req: NextApiRequest) {
  let measurements = await getAllMeasurements()
  return measurements
}

export const api = {
  samples: {
    getAll: getAllSamples,
    get: getSample,
    create: createSample,
    update: updateSample,
    delete: deleteSample,
  },
  measurements: {
    getAll: getAllMeasurements,
    get: getMeasurement,
    create: createMeasurement,
    update: updateMeasurement,
    delete: deleteMeasurement,
  },
  recipes: {
    getAll: getAllRecipes,
    get: getRecipe,
    create: createRecipe,
    update: updateRecipe,
    delete: deleteRecipe,
  },
}

