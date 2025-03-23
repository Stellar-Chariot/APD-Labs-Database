"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon, Search, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface SearchField {
  id: string
  label: string
  type: "text" | "select" | "date" | "number"
  options?: { value: string; label: string }[]
}

const searchFields: SearchField[] = [
  { id: "name", label: "Sample Name", type: "text" },
  {
    id: "type",
    label: "Sample Type",
    type: "select",
    options: [
      { value: "silicon", label: "Silicon" },
      { value: "germanium", label: "Germanium" },
      { value: "compound", label: "Compound Semiconductor" },
      { value: "organic", label: "Organic" },
    ],
  },
  { id: "createdBy", label: "Created By", type: "text" },
  { id: "createdAt", label: "Created Date", type: "date" },
  { id: "thickness", label: "Thickness (nm)", type: "number" },
  { id: "temperature", label: "Growth Temperature (°C)", type: "number" },
]

export function AdvancedSearch() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [filters, setFilters] = useState<Record<string, any>>(() => {
    const initialFilters: Record<string, any> = {}
    searchFields.forEach((field) => {
      const value = searchParams.get(field.id)
      if (value) initialFilters[field.id] = value
    })
    return initialFilters
  })

  const handleSearch = () => {
    const params = new URLSearchParams()

    if (searchQuery) {
      params.set("q", searchQuery)
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        if (value instanceof Date) {
          params.set(key, format(value, "yyyy-MM-dd"))
        } else {
          params.set(key, String(value))
        }
      }
    })

    router.push(`/samples?${params.toString()}`)
  }

  const handleReset = () => {
    setSearchQuery("")
    setFilters({})
    router.push("/samples")
  }

  const handleFilterChange = (id: string, value: any) => {
    setFilters((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const activeFilterCount = Object.keys(filters).filter(
    (key) => filters[key] !== undefined && filters[key] !== null && filters[key] !== "",
  ).length

  return (
    <div className="space-y-4 w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search samples..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <Button variant="outline" onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}>
          Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
        </Button>
        <Button onClick={handleSearch}>Search</Button>
      </div>

      {isAdvancedOpen && (
        <div className="border rounded-md p-4 bg-card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Advanced Filters</h3>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchFields.map((field) => (
              <div key={field.id} className="space-y-2">
                <Label htmlFor={field.id}>{field.label}</Label>

                {field.type === "text" && (
                  <Input
                    id={field.id}
                    value={filters[field.id] || ""}
                    onChange={(e) => handleFilterChange(field.id, e.target.value)}
                  />
                )}

                {field.type === "number" && (
                  <Input
                    id={field.id}
                    type="number"
                    value={filters[field.id] || ""}
                    onChange={(e) => handleFilterChange(field.id, e.target.value ? Number(e.target.value) : "")}
                  />
                )}

                {field.type === "select" && (
                  <Select
                    value={filters[field.id] || ""}
                    onValueChange={(value) => handleFilterChange(field.id, value)}
                  >
                    <SelectTrigger id={field.id}>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any</SelectItem>
                      {field.options?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {field.type === "date" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !filters[field.id] && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters[field.id] ? format(filters[field.id], "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={filters[field.id] || undefined}
                        onSelect={(date) => handleFilterChange(field.id, date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(filters).map(([key, value]) => {
            if (!value) return null

            const field = searchFields.find((f) => f.id === key)
            let displayValue = value

            if (field?.type === "date" && value instanceof Date) {
              displayValue = format(value, "MMM d, yyyy")
            } else if (field?.type === "select") {
              displayValue = field.options?.find((o) => o.value === value)?.label || value
            }

            return (
              <div key={key} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-sm">
                <span className="font-medium">{field?.label || key}:</span>
                <span>{displayValue}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 ml-1"
                  onClick={() => handleFilterChange(key, "")}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

