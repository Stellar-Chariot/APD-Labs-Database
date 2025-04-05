"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getAllRecipes,
  getRecipeById,
  getRecipeBySampleId,
  createRecipe,
  updateRecipe,
  deleteRecipe,
} from "@/services/mbe-recipe-service"
import { useUI } from "@/hooks/use-ui"
import type { MBERecipe } from "@/types/mbe-recipe"

// Query keys
export const recipeKeys = {
  all: ["recipes"] as const,
  lists: () => [...recipeKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...recipeKeys.lists(), filters] as const,
  bySample: (sampleId: string) => [...recipeKeys.lists(), { sampleId }] as const,
  details: () => [...recipeKeys.all, "detail"] as const,
  detail: (id: string) => [...recipeKeys.details(), id] as const,
}

// Hook for fetching all recipes
export function useRecipesQuery(options = {}) {
  return useQuery({
    queryKey: recipeKeys.lists(),
    queryFn: () => getAllRecipes(),
    ...options,
  })
}

// Hook for fetching a single recipe
export function useRecipeQuery(id: string, options = {}) {
  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: () => getRecipeById(id),
    enabled: !!id,
    ...options,
  })
}

// Hook for fetching a recipe by sample ID
export function useRecipeBySampleQuery(sampleId: string, options = {}) {
  return useQuery({
    queryKey: recipeKeys.bySample(sampleId),
    queryFn: () => getRecipeBySampleId(sampleId),
    enabled: !!sampleId,
    ...options,
  })
}

// Hook for creating a recipe
export function useCreateRecipe() {
  const queryClient = useQueryClient()
  const { addNotification } = useUI()

  return useMutation({
    mutationFn: (newRecipe: Partial<MBERecipe>) => createRecipe(newRecipe),
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() })

      // If the recipe has a sampleId, also invalidate the sample-specific recipe
      if (data.sampleId) {
        queryClient.invalidateQueries({ queryKey: recipeKeys.bySample(data.sampleId) })
      }

      // Show success notification
      addNotification({
        type: "success",
        message: `Recipe ${data.name} created successfully`,
      })
    },
    onError: (error: Error) => {
      // Show error notification
      addNotification({
        type: "error",
        message: `Failed to create recipe: ${error.message}`,
      })
    },
  })
}

// Hook for updating a recipe
export function useUpdateRecipe() {
  const queryClient = useQueryClient()
  const { addNotification } = useUI()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MBERecipe> }) => updateRecipe(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: recipeKeys.detail(id) })

      // Snapshot the previous value
      const previousRecipe = queryClient.getQueryData(recipeKeys.detail(id))

      // Optimistically update to the new value
      queryClient.setQueryData(recipeKeys.detail(id), (old: MBERecipe | undefined) => {
        return old ? { ...old, ...data } : undefined
      })

      // Return a context object with the snapshot
      return { previousRecipe }
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() })
      queryClient.invalidateQueries({ queryKey: recipeKeys.detail(data.id) })

      // If the recipe has a sampleId, also invalidate the sample-specific recipe
      if (data.sampleId) {
        queryClient.invalidateQueries({ queryKey: recipeKeys.bySample(data.sampleId) })
      }

      // Show success notification
      addNotification({
        type: "success",
        message: `Recipe ${data.name} updated successfully`,
      })
    },
    onError: (error: Error, { id }, context) => {
      // Revert back to the previous value if available
      if (context?.previousRecipe) {
        queryClient.setQueryData(recipeKeys.detail(id), context.previousRecipe)
      }

      // Show error notification
      addNotification({
        type: "error",
        message: `Failed to update recipe: ${error.message}`,
      })
    },
    onSettled: (_, __, { id }) => {
      // Always refetch after error or success to ensure data consistency
      queryClient.invalidateQueries({ queryKey: recipeKeys.detail(id) })
    },
  })
}

// Hook for deleting a recipe
export function useDeleteRecipe() {
  const queryClient = useQueryClient()
  const { addNotification } = useUI()

  return useMutation({
    mutationFn: (id: string) => deleteRecipe(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() })

      // Remove from cache
      queryClient.removeQueries({ queryKey: recipeKeys.detail(id) })

      // Show success notification
      addNotification({
        type: "success",
        message: "Recipe deleted successfully",
      })
    },
    onError: (error: Error) => {
      // Show error notification
      addNotification({
        type: "error",
        message: `Failed to delete recipe: ${error.message}`,
      })
    },
  })
}

