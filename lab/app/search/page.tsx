"use client"

import type React from "react"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

// Add ErrorBoundary component around the search results
import ErrorBoundary from "@/components/error-boundary"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get("q") || ""
  const [searchQuery, setSearchQuery] = useState(query)
  const [activeTab, setActiveTab] = useState("all")

  // Mock search results
  const [results, setResults] = useState({
    samples: [] as any[],
    measurements: [] as any[],
    recipes: [] as any[],
    total: 0,
  })

  // Replace the entire useEffect hook with this improved version that includes proper cleanup
  // and safer state management

  useEffect(() => {
    // Flag to track if the component is mounted
    let isMounted = true

    if (!query) {
      // Reset results if query is empty
      if (isMounted) {
        setResults({
          samples: [],
          measurements: [],
          recipes: [],
          total: 0,
        })
      }
      return () => {
        isMounted = false
      }
    }

    // In a real app, this would be an API call
    // For now, we'll simulate search results
    const mockSamples = [
      {
        id: "1",
        identifier: "T250306A",
        name: "GaAs QW Structure",
        type: "sample",
        substrate: "GaAs",
        grower: "Scott Sifferman",
        date: new Date("2025-03-06").toLocaleDateString(),
        highlight: "Quantum well structure with <mark>GaAs</mark> layers",
      },
      {
        id: "2",
        identifier: "T250307B",
        name: "AlGaAs Barrier Test",
        type: "sample",
        substrate: "GaAs",
        grower: "Maria Chen",
        date: new Date("2025-03-07").toLocaleDateString(),
        highlight: "Testing <mark>AlGaAs</mark> barrier properties",
      },
      {
        id: "4",
        identifier: "T250312D",
        name: "GaN HEMT Structure",
        type: "sample",
        substrate: "Sapphire",
        grower: "James Wilson",
        date: new Date("2025-03-12").toLocaleDateString(),
        highlight: "GaN HEMT structure grown by <mark>James Wilson</mark>",
      },
      {
        id: "7",
        identifier: "T250320G",
        name: "AlGaN/GaN HEMT",
        type: "sample",
        substrate: "Sapphire",
        grower: "James Wilson",
        date: new Date("2025-03-20").toLocaleDateString(),
        highlight: "AlGaN/GaN HEMT structure by <mark>James Wilson</mark>",
      },
    ]

    const mockMeasurements = [
      {
        id: "m1",
        title: "Room Temperature PL Measurement",
        type: "measurement",
        sampleId: "1",
        sampleIdentifier: "T250306A",
        creator: "Scott Sifferman",
        date: new Date("2025-03-07").toLocaleDateString(),
        highlight: "Photoluminescence measurement of <mark>GaAs</mark> quantum well",
      },
      {
        id: "m3",
        title: "IR PL at 77K",
        type: "measurement",
        sampleId: "1",
        sampleIdentifier: "T250306A",
        creator: "Scott Sifferman",
        date: new Date("2025-03-09").toLocaleDateString(),
        highlight: "Infrared PL of <mark>GaAs</mark> structure at low temperature",
      },
      {
        id: "m6",
        title: "UV PR Measurement",
        type: "measurement",
        sampleId: "4",
        sampleIdentifier: "T250312D",
        creator: "James Wilson",
        date: new Date("2025-03-14").toLocaleDateString(),
        highlight: "UV PR measurement performed by <mark>James Wilson</mark>",
      },
      {
        id: "m7",
        title: "UV PL at 4K",
        type: "measurement",
        sampleId: "5",
        sampleIdentifier: "T250315E",
        creator: "James Wilson",
        date: new Date("2025-03-16").toLocaleDateString(),
        highlight: "Low temperature UV PL by <mark>James Wilson</mark>",
      },
    ]

    const mockRecipes = [
      {
        id: "r1",
        identifier: "B200319A",
        name: "GaAs/AlGaAs QW",
        type: "recipe",
        substrate: "GaAs",
        creator: "Scott Sifferman",
        date: new Date("2020-03-19").toLocaleDateString(),
        highlight: "<mark>GaAs</mark> quantum well with <mark>AlGaAs</mark> barriers",
      },
      {
        id: "r4",
        identifier: "B200322D",
        name: "GaN HEMT Structure",
        type: "recipe",
        substrate: "Sapphire",
        creator: "James Wilson",
        date: new Date("2020-03-22").toLocaleDateString(),
        highlight: "GaN HEMT structure recipe by <mark>James Wilson</mark>",
      },
    ]

    // Use a safer approach to filtering
    try {
      // Filter based on query with improved search logic
      const filteredSamples = mockSamples.filter((s) => {
        const searchableFields = [
          s.identifier?.toLowerCase() || "",
          s.name?.toLowerCase() || "",
          s.substrate?.toLowerCase() || "",
          s.grower?.toLowerCase() || "",
          s.highlight?.toLowerCase() || "",
        ]

        return searchableFields.some((field) => field.includes(query.toLowerCase()))
      })

      const filteredMeasurements = mockMeasurements.filter((m) => {
        const searchableFields = [
          m.title?.toLowerCase() || "",
          m.sampleIdentifier?.toLowerCase() || "",
          m.creator?.toLowerCase() || "",
          m.highlight?.toLowerCase() || "",
        ]

        return searchableFields.some((field) => field.includes(query.toLowerCase()))
      })

      const filteredRecipes = mockRecipes.filter((r) => {
        const searchableFields = [
          r.identifier?.toLowerCase() || "",
          r.name?.toLowerCase() || "",
          r.substrate?.toLowerCase() || "",
          r.creator?.toLowerCase() || "",
          r.highlight?.toLowerCase() || "",
        ]

        return searchableFields.some((field) => field.includes(query.toLowerCase()))
      })

      // Only update state if the component is still mounted
      if (isMounted) {
        setResults({
          samples: filteredSamples,
          measurements: filteredMeasurements,
          recipes: filteredRecipes,
          total: filteredSamples.length + filteredMeasurements.length + filteredRecipes.length,
        })
      }
    } catch (error) {
      console.error("Error during search:", error)
      // Set empty results in case of error
      if (isMounted) {
        setResults({
          samples: [],
          measurements: [],
          recipes: [],
          total: 0,
        })
      }
    }

    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false
    }
  }, [query])

  // Replace the handleSearch function with this improved version
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (searchQuery?.trim()) {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      }
    } catch (error) {
      console.error("Error during search navigation:", error)
    }
  }

  // Replace the handleViewItem function with this improved version
  const handleViewItem = (item: any) => {
    if (!item || !item.type || !item.id) {
      console.error("Invalid item data:", item)
      return
    }

    try {
      switch (item.type) {
        case "sample":
          router.push(`/samples/${item.id}`)
          break
        case "measurement":
          router.push(`/measurements/${item.id}`)
          break
        case "recipe":
          router.push(`/recipes/${item.id}`)
          break
        default:
          console.warn("Unknown item type:", item.type)
      }
    } catch (error) {
      console.error("Error during navigation:", error)
    }
  }

  // Wrap the entire component return with error handling
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
        <p className="text-muted-foreground">
          {results.total} results found for "{query}"
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex w-full max-w-lg items-center space-x-2">
        <Input
          type="search"
          placeholder="Search samples, measurements, recipes..."
          value={searchQuery || ""}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
        <Button type="submit" className="bg-primary hover:bg-primary/90">
          <Search className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Results ({results.total || 0})</TabsTrigger>
          <TabsTrigger value="samples">Samples ({results.samples?.length || 0})</TabsTrigger>
          <TabsTrigger value="measurements">Measurements ({results.measurements?.length || 0})</TabsTrigger>
          <TabsTrigger value="recipes">Recipes ({results.recipes?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ErrorBoundary>
            <div className="space-y-4">
              {results.samples.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Samples</CardTitle>
                    <CardDescription>Sample matches for your search</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.samples.map((sample) => (
                        <div
                          key={sample.id}
                          className="flex items-center justify-between space-x-4 rounded-md border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleViewItem(sample)}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{sample.identifier}</h4>
                              <Badge variant="outline">{sample.substrate}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{sample.name}</p>
                            {sample.grower && <p className="text-xs text-muted-foreground">Grower: {sample.grower}</p>}
                            <p className="text-xs mt-1" dangerouslySetInnerHTML={{ __html: sample.highlight }}></p>
                          </div>
                          <div className="text-sm text-muted-foreground">{sample.date}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {results.measurements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Measurements</CardTitle>
                    <CardDescription>Measurement matches for your search</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.measurements.map((measurement) => (
                        <div
                          key={measurement.id}
                          className="flex items-center justify-between space-x-4 rounded-md border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleViewItem(measurement)}
                        >
                          <div>
                            <h4 className="font-medium">{measurement.title}</h4>
                            <p className="text-sm text-muted-foreground">Sample: {measurement.sampleIdentifier}</p>
                            {measurement.creator && (
                              <p className="text-xs text-muted-foreground">Created by: {measurement.creator}</p>
                            )}
                            <p className="text-xs mt-1" dangerouslySetInnerHTML={{ __html: measurement.highlight }}></p>
                          </div>
                          <div className="text-sm text-muted-foreground">{measurement.date}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {results.recipes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recipes</CardTitle>
                    <CardDescription>Recipe matches for your search</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {results.recipes.map((recipe) => (
                        <div
                          key={recipe.id}
                          className="flex items-center justify-between space-x-4 rounded-md border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleViewItem(recipe)}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{recipe.identifier}</h4>
                              <Badge variant="outline">{recipe.substrate}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{recipe.name}</p>
                            {recipe.creator && (
                              <p className="text-xs text-muted-foreground">Created by: {recipe.creator}</p>
                            )}
                            <p className="text-xs mt-1" dangerouslySetInnerHTML={{ __html: recipe.highlight }}></p>
                          </div>
                          <div className="text-sm text-muted-foreground">{recipe.date}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {results.total === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="rounded-full bg-muted p-3 mb-4">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No results found</h3>
                  <p className="text-muted-foreground mt-1">We couldn't find any matches for "{query}"</p>
                  <p className="text-sm text-muted-foreground mt-4">
                    Try adjusting your search terms or browse all items
                  </p>
                </div>
              )}
            </div>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="samples">
          <ErrorBoundary>
            <Card>
              <CardHeader>
                <CardTitle>Sample Results</CardTitle>
                <CardDescription>Sample matches for your search</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.samples.map((sample) => (
                    <div
                      key={sample.id}
                      className="flex items-center justify-between space-x-4 rounded-md border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleViewItem(sample)}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{sample.identifier}</h4>
                          <Badge variant="outline">{sample.substrate}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{sample.name}</p>
                        {sample.grower && <p className="text-xs text-muted-foreground">Grower: {sample.grower}</p>}
                        <p className="text-xs mt-1" dangerouslySetInnerHTML={{ __html: sample.highlight }}></p>
                      </div>
                      <div className="text-sm text-muted-foreground">{sample.date}</div>
                    </div>
                  ))}

                  {results.samples.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-muted-foreground">No sample results found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="measurements">
          <ErrorBoundary>
            <Card>
              <CardHeader>
                <CardTitle>Measurement Results</CardTitle>
                <CardDescription>Measurement matches for your search</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.measurements.map((measurement) => (
                    <div
                      key={measurement.id}
                      className="flex items-center justify-between space-x-4 rounded-md border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleViewItem(measurement)}
                    >
                      <div>
                        <h4 className="font-medium">{measurement.title}</h4>
                        <p className="text-sm text-muted-foreground">Sample: {measurement.sampleIdentifier}</p>
                        {measurement.creator && (
                          <p className="text-xs text-muted-foreground">Created by: {measurement.creator}</p>
                        )}
                        <p className="text-xs mt-1" dangerouslySetInnerHTML={{ __html: measurement.highlight }}></p>
                      </div>
                      <div className="text-sm text-muted-foreground">{measurement.date}</div>
                    </div>
                  ))}

                  {results.measurements.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-muted-foreground">No measurement results found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="recipes">
          <ErrorBoundary>
            <Card>
              <CardHeader>
                <CardTitle>Recipe Results</CardTitle>
                <CardDescription>Recipe matches for your search</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.recipes.map((recipe) => (
                    <div
                      key={recipe.id}
                      className="flex items-center justify-between space-x-4 rounded-md border p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleViewItem(recipe)}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{recipe.identifier}</h4>
                          <Badge variant="outline">{recipe.substrate}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{recipe.name}</p>
                        {recipe.creator && (
                          <p className="text-xs text-muted-foreground">Created by: {recipe.creator}</p>
                        )}
                        <p className="text-xs mt-1" dangerouslySetInnerHTML={{ __html: recipe.highlight }}></p>
                      </div>
                      <div className="text-sm text-muted-foreground">{recipe.date}</div>
                    </div>
                  ))}

                  {results.recipes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <p className="text-muted-foreground">No recipe results found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </ErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  )
}

