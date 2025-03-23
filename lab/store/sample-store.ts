import { create } from "zustand"
import type { Sample } from "@/types/sample-types"

interface SampleState {
  samples: Sample[]
  filteredSamples: Sample[]
  isLoading: boolean
  error: string | null
  searchTerm: string
  substrateFilter: string
  sortField: keyof Sample
  sortDirection: "asc" | "desc"

  // Actions
  fetchSamples: () => Promise<void>
  setSearchTerm: (term: string) => void
  setSubstrateFilter: (substrate: string) => void
  setSortField: (field: keyof Sample) => void
  toggleSortDirection: () => void
}

export const useSampleStore = create<SampleState>((set, get) => ({
  samples: [],
  filteredSamples: [],
  isLoading: false,
  error: null,
  searchTerm: "",
  substrateFilter: "all",
  sortField: "createdAt",
  sortDirection: "desc",

  fetchSamples: async () => {
    set({ isLoading: true, error: null })

    try {
      // Build query string with filters
      const { searchTerm, substrateFilter } = get()
      const params = new URLSearchParams()

      if (searchTerm) params.append("search", searchTerm)
      if (substrateFilter !== "all") params.append("substrate", substrateFilter)

      const response = await fetch(`/api/samples?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch samples")
      }

      const samples = await response.json()

      // Apply sorting
      const { sortField, sortDirection } = get()
      const sortedSamples = sortSamples(samples, sortField, sortDirection)

      set({
        samples,
        filteredSamples: sortedSamples,
        isLoading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "An unknown error occurred",
        isLoading: false,
      })
    }
  },

  setSearchTerm: (term) => {
    set({ searchTerm: term })
    get().fetchSamples()
  },

  setSubstrateFilter: (substrate) => {
    set({ substrateFilter: substrate })
    get().fetchSamples()
  },

  setSortField: (field) => {
    const { sortField, sortDirection } = get()

    if (field === sortField) {
      // If clicking the same field, toggle direction
      get().toggleSortDirection()
    } else {
      // New field, set to ascending by default
      set({ sortField: field, sortDirection: "asc" })

      // Re-sort the filtered samples
      const { filteredSamples } = get()
      const sortedSamples = sortSamples(filteredSamples, field, "asc")
      set({ filteredSamples: sortedSamples })
    }
  },

  toggleSortDirection: () => {
    const { sortDirection, sortField, filteredSamples } = get()
    const newDirection = sortDirection === "asc" ? "desc" : "asc"

    set({ sortDirection: newDirection })

    // Re-sort the filtered samples
    const sortedSamples = sortSamples(filteredSamples, sortField, newDirection)
    set({ filteredSamples: sortedSamples })
  },
}))

// Helper function to sort samples
function sortSamples(samples: Sample[], field: keyof Sample, direction: "asc" | "desc"): Sample[] {
  return [...samples].sort((a, b) => {
    const aValue = a[field]
    const bValue = b[field]

    if (aValue instanceof Date && bValue instanceof Date) {
      return direction === "asc" ? aValue.getTime() - bValue.getTime() : bValue.getTime() - aValue.getTime()
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    }

    return 0
  })
}

