import type { MBERecipe } from "@/types/mbe-recipe"
import {
  fetchRecipes,
  fetchRecipeById,
  fetchRecipesBySampleId,
  createRecipeApi,
  updateRecipeApi,
  deleteRecipeApi,
} from "@/lib/simulated-api-adapter"
import { ApiRequestError } from "@/lib/api-client"

export async function getAllRecipes(): Promise<MBERecipe[]> {
  try {
    return await fetchRecipes()
  } catch (error) {
    console.error("Error fetching MBE recipes:", error)

    if (error instanceof ApiRequestError) {
      throw new Error(`Failed to fetch MBE recipes: ${error.message}`)
    }

    // Return an empty array instead of throwing an error for better UX
    return []
  }
}

export async function getRecipeById(id: string): Promise<MBERecipe | null> {
  try {
    if (!id) {
      throw new Error("Recipe ID is required")
    }

    return await fetchRecipeById(id)
  } catch (error) {
    console.error(`Error fetching MBE recipe ${id}:`, error)

    if (error instanceof ApiRequestError && error.status === 404) {
      return null // Not found is a valid response
    }

    if (error instanceof ApiRequestError) {
      throw new Error(`Failed to fetch MBE recipe: ${error.message}`)
    }

    return null
  }
}

export async function getRecipeBySampleId(sampleId: string): Promise<MBERecipe | null> {
  try {
    if (!sampleId) {
      throw new Error("Sample ID is required")
    }

    // This will return null if no recipe is found, which is a valid response
    return await fetchRecipesBySampleId(sampleId)
  } catch (error) {
    console.error(`Error fetching MBE recipe for sample ${sampleId}:`, error)

    if (error instanceof ApiRequestError && error.status === 404) {
      return null // Not found is a valid response
    }

    if (error instanceof ApiRequestError) {
      throw new Error(`Failed to fetch MBE recipe: ${error.message}`)
    }

    return null
  }
}

export async function createRecipe(recipe: Partial<MBERecipe>): Promise<MBERecipe> {
  try {
    return await createRecipeApi(recipe)
  } catch (error) {
    console.error("Error creating MBE recipe:", error)

    if (error instanceof ApiRequestError) {
      throw new Error(`Failed to create MBE recipe: ${error.message}`)
    }

    throw new Error("Failed to create MBE recipe")
  }
}

export async function updateRecipe(id: string, recipe: Partial<MBERecipe>): Promise<MBERecipe> {
  try {
    if (!id) {
      throw new Error("Recipe ID is required")
    }

    return await updateRecipeApi(id, recipe)
  } catch (error) {
    console.error(`Error updating MBE recipe ${id}:`, error)

    if (error instanceof ApiRequestError) {
      throw new Error(`Failed to update MBE recipe: ${error.message}`)
    }

    throw new Error(`Failed to update MBE recipe ${id}`)
  }
}

export async function deleteRecipe(id: string): Promise<void> {
  try {
    if (!id) {
      throw new Error("Recipe ID is required")
    }

    await deleteRecipeApi(id)
  } catch (error) {
    console.error(`Error deleting MBE recipe ${id}:`, error)

    if (error instanceof ApiRequestError) {
      throw new Error(`Failed to delete MBE recipe: ${error.message}`)
    }

    throw new Error(`Failed to delete MBE recipe ${id}`)
  }
}

