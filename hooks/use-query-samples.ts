"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getSamples, getSampleById, createSample, updateSample, deleteSample } from "@/services/sample-service"
import { useUI } from "@/hooks/use-ui"
import type { Sample } from "@/types/sample"

// Query keys
export const sampleKeys = {
  all: ["samples"] as const,
  lists: () => [...sampleKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...sampleKeys.lists(), filters] as const,
  details: () => [...sampleKeys.all, "detail"] as const,
  detail: (id: string) => [...sampleKeys.details(), id] as const,
}

// Hook for fetching all samples
export function useSamplesQuery(options = {}) {
  return useQuery({
    queryKey: sampleKeys.lists(),
    queryFn: () => getSamples(),
    ...options,
  })
}

// Hook for fetching a single sample
export function useSampleQuery(id: string, options = {}) {
  return useQuery({
    queryKey: sampleKeys.detail(id),
    queryFn: () => getSampleById(id),
    enabled: !!id,
    ...options,
  })
}

// Hook for creating a sample with optimistic updates
export function useCreateSample() {
  const queryClient = useQueryClient()
  const { addNotification } = useUI()

  return useMutation({
    mutationFn: (newSample: Omit<Sample, "id" | "createdAt">) => createSample(newSample),
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: sampleKeys.lists() })

      // Show success notification
      addNotification({
        type: "success",
        message: `Sample ${data.name} created successfully`,
      })
    },
    onError: (error: Error) => {
      // Show error notification
      addNotification({
        type: "error",
        message: `Failed to create sample: ${error.message}`,
      })
    },
  })
}

// Hook for updating a sample with optimistic updates
export function useUpdateSample() {
  const queryClient = useQueryClient()
  const { addNotification } = useUI()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Sample> }) => updateSample(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: sampleKeys.detail(id) })

      // Snapshot the previous value
      const previousSample = queryClient.getQueryData(sampleKeys.detail(id))

      // Optimistically update to the new value
      queryClient.setQueryData(sampleKeys.detail(id), (old: Sample | undefined) => {
        return old ? { ...old, ...data } : undefined
      })

      // Return a context object with the snapshot
      return { previousSample }
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: sampleKeys.lists() })
      queryClient.invalidateQueries({ queryKey: sampleKeys.detail(data.id) })

      // Show success notification
      addNotification({
        type: "success",
        message: `Sample ${data.name} updated successfully`,
      })
    },
    onError: (error: Error, { id }, context) => {
      // Revert back to the previous value if available
      if (context?.previousSample) {
        queryClient.setQueryData(sampleKeys.detail(id), context.previousSample)
      }

      // Show error notification
      addNotification({
        type: "error",
        message: `Failed to update sample: ${error.message}`,
      })
    },
    onSettled: (_, __, { id }) => {
      // Always refetch after error or success to ensure data consistency
      queryClient.invalidateQueries({ queryKey: sampleKeys.detail(id) })
    },
  })
}

// Hook for deleting a sample
export function useDeleteSample() {
  const queryClient = useQueryClient()
  const { addNotification } = useUI()

  return useMutation({
    mutationFn: (id: string) => deleteSample(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: sampleKeys.lists() })

      // Remove from cache
      queryClient.removeQueries({ queryKey: sampleKeys.detail(id) })

      // Show success notification
      addNotification({
        type: "success",
        message: "Sample deleted successfully",
      })
    },
    onError: (error: Error) => {
      // Show error notification
      addNotification({
        type: "error",
        message: `Failed to delete sample: ${error.message}`,
      })
    },
  })
}

