"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getAllMeasurements,
  getMeasurementById,
  getMeasurementsBySampleId,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
} from "@/services/measurement-service"
import { useUI } from "@/hooks/use-ui"
import type { Measurement } from "@/types/measurement"

// Query keys
export const measurementKeys = {
  all: ["measurements"] as const,
  lists: () => [...measurementKeys.all, "list"] as const,
  list: (filters: Record<string, any>) => [...measurementKeys.lists(), filters] as const,
  bySample: (sampleId: string) => [...measurementKeys.lists(), { sampleId }] as const,
  details: () => [...measurementKeys.all, "detail"] as const,
  detail: (id: string) => [...measurementKeys.details(), id] as const,
}

// Hook for fetching all measurements
export function useMeasurementsQuery(options = {}) {
  return useQuery({
    queryKey: measurementKeys.lists(),
    queryFn: () => getAllMeasurements(),
    ...options,
  })
}

// Hook for fetching a single measurement
export function useMeasurementQuery(id: string, options = {}) {
  return useQuery({
    queryKey: measurementKeys.detail(id),
    queryFn: () => getMeasurementById(id),
    enabled: !!id,
    ...options,
  })
}

// Hook for fetching measurements by sample ID
export function useMeasurementsBySampleQuery(sampleId: string, options = {}) {
  return useQuery({
    queryKey: measurementKeys.bySample(sampleId),
    queryFn: () => getMeasurementsBySampleId(sampleId),
    enabled: !!sampleId,
    ...options,
  })
}

// Hook for creating a measurement with optimistic updates
export function useCreateMeasurement() {
  const queryClient = useQueryClient()
  const { addNotification } = useUI()

  return useMutation({
    mutationFn: (newMeasurement: Partial<Measurement>) => createMeasurement(newMeasurement),
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: measurementKeys.lists() })

      // If the measurement has a sampleId, also invalidate the sample-specific measurements
      if (data.sampleId) {
        queryClient.invalidateQueries({ queryKey: measurementKeys.bySample(data.sampleId) })
      }

      // Show success notification
      addNotification({
        type: "success",
        message: `Measurement ${data.name || data.id} created successfully`,
      })
    },
    onError: (error: Error) => {
      // Show error notification
      addNotification({
        type: "error",
        message: `Failed to create measurement: ${error.message}`,
      })
    },
  })
}

// Hook for updating a measurement with optimistic updates
export function useUpdateMeasurement() {
  const queryClient = useQueryClient()
  const { addNotification } = useUI()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Measurement> }) => updateMeasurement(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: measurementKeys.detail(id) })

      // Snapshot the previous value
      const previousMeasurement = queryClient.getQueryData(measurementKeys.detail(id))

      // Optimistically update to the new value
      queryClient.setQueryData(measurementKeys.detail(id), (old: Measurement | undefined) => {
        return old ? { ...old, ...data } : undefined
      })

      // Return a context object with the snapshot
      return { previousMeasurement }
    },
    onSuccess: (data) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: measurementKeys.lists() })
      queryClient.invalidateQueries({ queryKey: measurementKeys.detail(data.id) })

      // If the measurement has a sampleId, also invalidate the sample-specific measurements
      if (data.sampleId) {
        queryClient.invalidateQueries({ queryKey: measurementKeys.bySample(data.sampleId) })
      }

      // Show success notification
      addNotification({
        type: "success",
        message: `Measurement ${data.name || data.id} updated successfully`,
      })
    },
    onError: (error: Error, { id }, context) => {
      // Revert back to the previous value if available
      if (context?.previousMeasurement) {
        queryClient.setQueryData(measurementKeys.detail(id), context.previousMeasurement)
      }

      // Show error notification
      addNotification({
        type: "error",
        message: `Failed to update measurement: ${error.message}`,
      })
    },
    onSettled: (_, __, { id }) => {
      // Always refetch after error or success to ensure data consistency
      queryClient.invalidateQueries({ queryKey: measurementKeys.detail(id) })
    },
  })
}

// Hook for deleting a measurement
export function useDeleteMeasurement() {
  const queryClient = useQueryClient()
  const { addNotification } = useUI()

  return useMutation({
    mutationFn: (id: string) => deleteMeasurement(id),
    onSuccess: (_, id) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: measurementKeys.lists() })

      // Remove from cache
      queryClient.removeQueries({ queryKey: measurementKeys.detail(id) })

      // Show success notification
      addNotification({
        type: "success",
        message: "Measurement deleted successfully",
      })
    },
    onError: (error: Error) => {
      // Show error notification
      addNotification({
        type: "error",
        message: `Failed to delete measurement: ${error.message}`,
      })
    },
  })
}

