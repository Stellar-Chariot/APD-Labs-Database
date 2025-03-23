"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { SampleList } from "@/components/sample-list"
import { AdvancedSearch } from "@/components/advanced-search"
import { useSampleStore } from "@/store/sample-store"
import type { Sample } from "@/types/sample-types"

export default function SamplesPage() {
  const searchParams = useSearchParams()
  const { samples, fetchSamples, isLoading } = useSampleStore()
  const [filteredSamples, setFilteredSamples] = useState<Sample[]>([])

  useEffect(() => {
    fetchSamples()
  }, [fetchSamples])

  useEffect(() => {
    if (!samples) return

    // Get all search params
    const query = searchParams.get("q")?.toLowerCase()
    const filters: Record<string, string> = {}

    // Convert all search params to filters
    for (const [key, value] of searchParams.entries()) {
      if (key !== "q") {
        filters[key] = value
      }
    }

    // Filter samples based on search params
    const filtered = samples.filter((sample) => {
      // Text search across multiple fields
      if (query) {
        const matchesQuery =
          sample.name.toLowerCase().includes(query) ||
          sample.description.toLowerCase().includes(query) ||
          sample.createdBy.toLowerCase().includes(query) ||
          sample.type.toLowerCase().includes(query)

        if (!matchesQuery) return false
      }

      // Apply all other filters
      for (const [key, value] of Object.entries(filters)) {
        if (!value) continue

        // Handle date filters
        if (key === "createdAt") {
          const sampleDate = new Date(sample.createdAt).toISOString().split("T")[0]
          if (sampleDate !== value) return false
          continue
        }

        // Handle numeric filters with range support
        if (["thickness", "temperature"].includes(key)) {
          const numValue = Number.parseFloat(value)
          const sampleValue = sample.metadata?.[key] ? Number.parseFloat(sample.metadata[key]) : null

          if (sampleValue === null) return false
          if (sampleValue !== numValue) return false
          continue
        }

        // Handle string filters
        if (key === "type" && sample.type !== value) return false
        if (key === "createdBy" && !sample.createdBy.toLowerCase().includes(value.toLowerCase())) return false
        if (key === "name" && !sample.name.toLowerCase().includes(value.toLowerCase())) return false
      }

      return true
    })

    setFilteredSamples(filtered)
  }, [samples, searchParams])

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Samples</h1>
        <p className="text-muted-foreground">Browse, search and manage your research samples</p>
      </div>

      <AdvancedSearch />

      <SampleList samples={filteredSamples} isLoading={isLoading} />
    </div>
  )
}

