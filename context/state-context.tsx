"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useMemo } from "react"
import type { AppState, AppAction } from "@/types/state"
import { rootReducer } from "./reducers"
import { getSamples } from "@/services/sample-service"
import { getAllMeasurements } from "@/services/measurement-service"

// Initial state
const initialState: AppState = {
  samples: {
    data: [],
    loading: false,
    error: null,
  },
  measurements: {
    data: [],
    loading: false,
    error: null,
    selectedMeasurement: null,
  },
  ui: {
    sidebarOpen: true,
    theme: "light",
    notifications: [],
  },
}

// Create context
type AppContextType = {
  state: AppState
  dispatch: React.Dispatch<AppAction>
}

const AppStateContext = createContext<AppContextType | undefined>(undefined)

// Provider component
export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(rootReducer, initialState)

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        // Fetch samples
        dispatch({ type: "FETCH_SAMPLES_REQUEST" })
        const samplesData = await getSamples()
        dispatch({ type: "FETCH_SAMPLES_SUCCESS", payload: samplesData })
      } catch (error) {
        dispatch({
          type: "FETCH_SAMPLES_FAILURE",
          payload: error instanceof Error ? error.message : "Failed to fetch samples",
        })
      }

      try {
        // Fetch measurements
        dispatch({ type: "FETCH_MEASUREMENTS_REQUEST" })
        const measurementsData = await getAllMeasurements()
        dispatch({ type: "FETCH_MEASUREMENTS_SUCCESS", payload: measurementsData })
      } catch (error) {
        dispatch({
          type: "FETCH_MEASUREMENTS_FAILURE",
          payload: error instanceof Error ? error.message : "Failed to fetch measurements",
        })
      }
    }

    loadInitialData()
  }, [])

  // Sync theme with system preference
  useEffect(() => {
    if (state.ui.theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
      const handleChange = () => {
        document.documentElement.classList.toggle("dark", mediaQuery.matches)
      }

      handleChange()
      mediaQuery.addEventListener("change", handleChange)

      return () => mediaQuery.removeEventListener("change", handleChange)
    } else {
      document.documentElement.classList.toggle("dark", state.ui.theme === "dark")
    }
  }, [state.ui.theme])

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => {
    return { state, dispatch }
  }, [state])

  return <AppStateContext.Provider value={contextValue}>{children}</AppStateContext.Provider>
}

// Custom hook to use the context
export function useAppState() {
  const context = useContext(AppStateContext)
  if (context === undefined) {
    throw new Error("useAppState must be used within an AppStateProvider")
  }
  return context
}

