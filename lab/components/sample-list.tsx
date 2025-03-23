"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Filter, ArrowUpDown, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { measurementService } from "@/services/measurement-service"
import { useSampleStore } from "@/store/sample-store"
import type { Sample } from "@/types"

// Add the following imports at the top
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export default function SampleList() {
  const router = useRouter()
  const {
    filteredSamples,
    isLoading,
    searchTerm,
    substrateFilter,
    sortField,
    sortDirection,
    fetchSamples,
    setSearchTerm,
    setSubstrateFilter,
    setSortField,
  } = useSampleStore()

  const [measurementCounts, setMeasurementCounts] = useState<Record<string, number>>({})

  // Add the following state inside the component
  const [selectedSamples, setSelectedSamples] = useState<string[]>([])

  // Load samples on component mount
  useEffect(() => {
    fetchSamples()
  }, [fetchSamples])

  // Fetch measurement counts for each sample
  useEffect(() => {
    async function loadMeasurementCounts() {
      const counts: Record<string, number> = {}

      for (const sample of filteredSamples) {
        const count = await measurementService.getMeasurementCountForSample(sample.id)
        counts[sample.id] = count
      }

      setMeasurementCounts(counts)
    }

    if (filteredSamples.length > 0) {
      loadMeasurementCounts()
    }
  }, [filteredSamples])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchSamples()
  }

  const handleSort = (field: keyof Sample) => {
    setSortField(field)
  }

  const handleViewSample = (id: string) => {
    router.push(`/samples/${id}`)
  }

  const handleCreateSample = () => {
    router.push("/samples/new")
  }

  const getSubstrateColor = (substrate: string) => {
    const colors: Record<string, string> = {
      GaAs: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      InP: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
      Si: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
      GaN: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      Sapphire: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    }

    return colors[substrate] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }

  // Add the following functions inside the component
  const handleSelectSample = (id: string) => {
    setSelectedSamples((prev) => (prev.includes(id) ? prev.filter((sampleId) => sampleId !== id) : [...prev, id]))
  }

  const handleSelectAll = () => {
    if (selectedSamples.length === filteredSamples.length) {
      setSelectedSamples([])
    } else {
      setSelectedSamples(filteredSamples.map((sample) => sample.id))
    }
  }

  const handleBatchDelete = async () => {
    if (selectedSamples.length === 0) return

    if (confirm(`Are you sure you want to delete ${selectedSamples.length} selected samples?`)) {
      try {
        // In a real app, this would call the API to delete the samples
        // For now, we'll just show a success message
        toast.success(`${selectedSamples.length} samples deleted successfully`)
        setSelectedSamples([])
        fetchSamples()
      } catch (error) {
        toast.error("Failed to delete samples")
      }
    }
  }

  const handleBatchExport = () => {
    if (selectedSamples.length === 0) return

    // In a real app, this would generate a CSV or JSON file
    const selectedData = filteredSamples.filter((sample) => selectedSamples.includes(sample.id))

    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(selectedData, null, 2))}`

    const link = document.createElement("a")
    link.href = jsonString
    link.download = "selected-samples.json"
    link.click()

    toast.success(`Exported ${selectedSamples.length} samples`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Samples</h1>
        <Button onClick={handleCreateSample} className="bg-primary hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Create Sample
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <Input
            type="search"
            placeholder="Search samples..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
          <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </form>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={substrateFilter} onValueChange={setSubstrateFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Substrate" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Substrates</SelectItem>
              <SelectItem value="GaAs">GaAs</SelectItem>
              <SelectItem value="InP">InP</SelectItem>
              <SelectItem value="Si">Si</SelectItem>
              <SelectItem value="GaN">GaN</SelectItem>
              <SelectItem value="Sapphire">Sapphire</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4">
          <CardTitle>Sample List</CardTitle>
          <CardDescription>View and manage your samples</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredSamples.length > 0 ? (
            <>
              {selectedSamples.length > 0 && (
                <div className="bg-muted p-2 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedSamples.length} sample{selectedSamples.length !== 1 ? "s" : ""} selected
                  </span>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleBatchExport}>
                      Export Selected
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleBatchDelete}>
                      Delete Selected
                    </Button>
                  </div>
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={filteredSamples.length > 0 && selectedSamples.length === filteredSamples.length}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("identifier")}>
                      <div className="flex items-center">
                        ID
                        {sortField === "identifier" && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                      <div className="flex items-center">
                        Name
                        {sortField === "name" && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Substrate</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort("growthDate")}>
                      <div className="flex items-center">
                        Growth Date
                        {sortField === "growthDate" && (
                          <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Grower</TableHead>
                    <TableHead>Measurements</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSamples.map((sample) => (
                    <TableRow key={sample.id} className={selectedSamples.includes(sample.id) ? "bg-muted/50" : ""}>
                      <TableCell>
                        <Checkbox
                          checked={selectedSamples.includes(sample.id)}
                          onCheckedChange={() => handleSelectSample(sample.id)}
                          aria-label={`Select ${sample.identifier}`}
                        />
                      </TableCell>
                      <TableCell>{sample.identifier}</TableCell>
                      <TableCell>{sample.name}</TableCell>
                      <TableCell>
                        <Badge className={getSubstrateColor(sample.substrate)}>{sample.substrate}</Badge>
                      </TableCell>
                      <TableCell>{new Date(sample.growthDate).toLocaleDateString()}</TableCell>
                      <TableCell>{sample.grower}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {measurementCounts[sample.id] || 0} measurement{measurementCounts[sample.id] !== 1 ? "s" : ""}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Sample Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleViewSample(sample.id)}>
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/samples/${sample.id}/edit`)}>
                              Edit Sample
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/samples/${sample.id}/measurements/new`)}>
                              Add Measurement
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${sample.identifier}?`)) {
                                  // Delete logic would go here
                                  toast.success(`Sample ${sample.identifier} deleted`)
                                  fetchSamples()
                                }
                              }}
                            >
                              Delete Sample
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-muted-foreground mb-4">No samples found matching your criteria</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("")
                  setSubstrateFilter("all")
                  fetchSamples()
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between p-4">
          <div className="text-sm text-muted-foreground">
            Showing {filteredSamples.length} of {filteredSamples.length} samples
          </div>
          <div className="flex space-x-2">{/* Pagination would go here in a real implementation */}</div>
        </CardFooter>
      </Card>
    </div>
  )
}

