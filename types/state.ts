import type { Sample } from "@/types/sample"
import type { Measurement } from "@/types/measurement"

// Define the shape of our global state
export interface AppState {
  samples: {
    data: Sample[]
    loading: boolean
    error: string | null
  }
  measurements: {
    data: Measurement[]
    loading: boolean
    error: string | null
    selectedMeasurement: string | null
  }
  ui: {
    sidebarOpen: boolean
    theme: "light" | "dark" | "system"
    notifications: Array<{
      id: string
      type: "info" | "success" | "warning" | "error"
      message: string
    }>
  }
}

// Define action types
export type AppAction =
  // Sample actions
  | { type: "FETCH_SAMPLES_REQUEST" }
  | { type: "FETCH_SAMPLES_SUCCESS"; payload: Sample[] }
  | { type: "FETCH_SAMPLES_FAILURE"; payload: string }
  | { type: "ADD_SAMPLE"; payload: Sample }
  | { type: "UPDATE_SAMPLE"; payload: Sample }
  | { type: "DELETE_SAMPLE"; payload: string }

  // Measurement actions
  | { type: "FETCH_MEASUREMENTS_REQUEST" }
  | { type: "FETCH_MEASUREMENTS_SUCCESS"; payload: Measurement[] }
  | { type: "FETCH_MEASUREMENTS_FAILURE"; payload: string }
  | { type: "ADD_MEASUREMENT"; payload: Measurement }
  | { type: "UPDATE_MEASUREMENT"; payload: Measurement }
  | { type: "DELETE_MEASUREMENT"; payload: string }
  | { type: "SELECT_MEASUREMENT"; payload: string | null }

  // UI actions
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_SIDEBAR"; payload: boolean }
  | { type: "SET_THEME"; payload: "light" | "dark" | "system" }
  | { type: "ADD_NOTIFICATION"; payload: Omit<AppState["ui"]["notifications"][0], "id"> }
  | { type: "REMOVE_NOTIFICATION"; payload: string }

