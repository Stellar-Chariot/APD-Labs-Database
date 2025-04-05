"use client"

import { useAppState } from "@/context/state-context"
import { createSample, updateSample, deleteSample } from "@/services/sample-service"
import type { Sample } from "@/types/sample"
import { useCallback } from "react"

export function useSamples() {
  const { state, dispatch } = useAppState()
  const { data: samples, loading, error } = state.samples

  // Add a new sample
  const addSample = useCallback(
    async (sample: Omit<Sample, "id" | "createdAt">) => {
      try {
        const newSample = await createSample(sample)
        dispatch({ type: "ADD_SAMPLE", payload: newSample })
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: {
            type: "success",
            message: `Sample ${newSample.name} created successfully`,
          },
        })
        return newSample
      } catch (error) {
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: {
            type: "error",
            message: error instanceof Error ? error.message : "Failed to create sample",
          },
        })
        throw error
      }
    },
    [dispatch],
  )

  // Update an existing sample
  const modifySample = useCallback(
    async (id: string, sample: Partial<Sample>) => {
      try {
        const updatedSample = await updateSample(id, sample)
        dispatch({ type: "UPDATE_SAMPLE", payload: updatedSample })
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: {
            type: "success",
            message: `Sample ${updatedSample.name} updated successfully`,
          },
        })
        return updatedSample
      } catch (error) {
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: {
            type: "error",
            message: error instanceof Error ? error.message : "Failed to update sample",
          },
        })
        throw error
      }
    },
    [dispatch],
  )

  // Delete a sample
  const removeSample = useCallback(
    async (id: string) => {
      try {
        await deleteSample(id)
        dispatch({ type: "DELETE_SAMPLE", payload: id })
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: {
            type: "success",
            message: "Sample deleted successfully",
          },
        })
      } catch (error) {
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: {
            type: "error",
            message: error instanceof Error ? error.message : "Failed to delete sample",
          },
        })
        throw error
      }
    },
    [dispatch],
  )

  // Get a sample by ID
  const getSampleById = useCallback(
    (id: string) => {
      return samples.find((sample) => sample.id === id) || null
    },
    [samples],
  )

  return {
    samples,
    loading,
    error,
    addSample,
    modifySample,
    removeSample,
    getSampleById,
  }
}

