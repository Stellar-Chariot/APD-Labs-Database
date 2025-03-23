import { create } from "zustand"
import type { Measurement } from "@/types/measurement-types"

interface MeasurementState {
  measurements: Measurement[]
  filteredMeasurements: Measurement[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  activeTab: string

  // Actions
  fetchMeasurements: (filters?: Record<string, any>) => Promise<void>
  setSearchQuery: (query: string) => void
  setActiveTab: (tab: string) => void
  addMeasurement: (measurement: Measurement) => void
  updateMeasurement: (id: string, measurement: Partial<Measurement>) => void
  deleteMeasurement: (id: string) => void
}

export const useMeasurementStore = create<MeasurementState>((set, get) => ({
  measurements: [],
  filteredMeasurements: [],
  isLoading: false,
  error: null,
  searchQuery: "",
  activeTab: "all",

  fetchMeasurements: async (filters = {}) => {
    set({ isLoading: true, error: null })

    try {
      // Build query string with filters
      const params = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })

      // Add search query and active tab if they exist
      const { searchQuery, activeTab } = get()
      if (searchQuery) params.append("search", searchQuery)
      if (activeTab !== "all") params.append("measurementType", activeTab)

      const response = await fetch(`/api/measurements?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch measurements")
      }

      const measurements = await response.json()

      set({
        measurements,
        filteredMeasurements: measurements,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An unknown error occurred",
        isLoading: false,
      })
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query })

    // Filter measurements based on search query
    const { measurements, activeTab } = get()

    let filtered = [...measurements]

    if (query) {
      const searchLower = query.toLowerCase()
      filtered = filtered.filter(
        (measurement) =>
          measurement.title.toLowerCase().includes(searchLower) ||
          (measurement.description && measurement.description.toLowerCase().includes(searchLower)),
      )
    }

    // Apply active tab filter
    if (activeTab !== "all") {
      filtered = filtered.filter((measurement) => measurement.measurementType === activeTab)
    }

    set({ filteredMeasurements: filtered })
  },

  setActiveTab: (tab) => {
    set({ activeTab: tab })

    // Filter measurements based on active tab
    const { measurements, searchQuery } = get()

    let filtered = [...measurements]

    if (tab !== "all") {
      filtered = filtered.filter((measurement) => measurement.measurementType === tab)
    }

    // Apply search query filter
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (measurement) =>
          measurement.title.toLowerCase().includes(searchLower) ||
          (measurement.description && measurement.description.toLowerCase().includes(searchLower)),
      )
    }

    set({ filteredMeasurements: filtered })
  },

  addMeasurement: (measurement) => {
    set((state) => ({
      measurements: [...state.measurements, measurement],
    }))

    // Re-apply filters
    const { setActiveTab, activeTab } = get()
    setActiveTab(activeTab)
  },

  updateMeasurement: (id, updatedFields) => {
    set((state) => ({
      measurements: state.measurements.map((measurement) =>
        measurement.id === id ? { ...measurement, ...updatedFields } : measurement,
      ),
    }))

    // Re-apply filters
    const { setActiveTab, activeTab } = get()
    setActiveTab(activeTab)
  },

  deleteMeasurement: (id) => {
    set((state) => ({
      measurements: state.measurements.filter((measurement) => measurement.id !== id),
    }))

    // Re-apply filters
    const { setActiveTab, activeTab } = get()
    setActiveTab(activeTab)
  },
}))

