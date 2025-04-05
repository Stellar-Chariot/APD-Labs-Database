"use client"

import { useAppState } from "@/context/state-context"
import { createMeasurement, updateMeasurement, deleteMeasurement } from "@/services/measurement-service"
import type { Measurement } from "@/types/measurement"
import { useCallback } from "react"

export function useMeasurements() {
  const { state, dispatch } = useAppState()
  const { data: measurements, loading, error, selectedMeasurement } = state.measurements

  // Add a new measurement
  const addMeasurement = useCallback(
    async (measurement: Partial<Measurement>) => {
      try {
        const newMeasurement = await createMeasurement(measurement)
        if (newMeasurement) {
          dispatch({ type: "ADD_MEASUREMENT", payload: newMeasurement })
          dispatch({
            type: "ADD_NOTIFICATION",
            payload: {
              type: "success",
              message: `Measurement ${newMeasurement.name || newMeasurement.id} created successfully`,
            },
          })
          return newMeasurement
        }
        throw new Error("Failed to create measurement")
      } catch (error) {
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: {
            type: "error",
            message: error instanceof Error ? error.message : "Failed to create measurement",
          },
        })
        throw error
      }
    },
    [dispatch],
  )

  // Update an existing measurement
  const modifyMeasurement = useCallback(
    async (id: string, measurement: Partial<Measurement>) => {
      try {
        const updatedMeasurement = await updateMeasurement(id, measurement)
        if (updatedMeasurement) {
          dispatch({ type: "UPDATE_MEASUREMENT", payload: updatedMeasurement })
          dispatch({
            type: "ADD_NOTIFICATION",
            payload: {
              type: "success",
              message: `Measurement ${updatedMeasurement.name || updatedMeasurement.id} updated successfully`,
            },
          })
          return updatedMeasurement
        }
        throw new Error("Failed to update measurement")
      } catch (error) {
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: {
            type: "error",
            message: error instanceof Error ? error.message : "Failed to update measurement",
          },
        })
        throw error
      }
    },
    [dispatch],
  )

  // Delete a measurement
  const removeMeasurement = useCallback(
    async (id: string) => {
      try {
        await deleteMeasurement(id)
        dispatch({ type: "DELETE_MEASUREMENT", payload: id })
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: {
            type: "success",
            message: "Measurement deleted successfully",
          },
        })
      } catch (error) {
        dispatch({
          type: "ADD_NOTIFICATION",
          payload: {
            type: "error",
            message: error instanceof Error ? error.message : "Failed to delete measurement",
          },
        })
        throw error
      }
    },
    [dispatch],
  )

  // Get a measurement by ID
  const getMeasurementById = useCallback(
    (id: string) => {
      return measurements.find((measurement) => measurement.id === id) || null
    },
    [measurements],
  )

  // Get measurements by sample ID
  const getMeasurementsBySampleId = useCallback(
    (sampleId: string) => {
      return measurements.filter((measurement) => measurement.sampleId === sampleId)
    },
    [measurements],
  )

  // Select a measurement
  const selectMeasurement = useCallback(
    (id: string | null) => {
      dispatch({ type: "SELECT_MEASUREMENT", payload: id })
    },
    [dispatch],
  )

  return {
    measurements,
    loading,
    error,
    selectedMeasurement,
    addMeasurement,
    modifyMeasurement,
    removeMeasurement,
    getMeasurementById,
    getMeasurementsBySampleId,
    selectMeasurement,
  }
}

