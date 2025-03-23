"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Upload, Search, RefreshCw } from "lucide-react"
import dynamic from "next/dynamic"
import { ErrorBoundary } from "react-error-boundary"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

// Replace the ForceGraph2D dynamic import with this optimized version
const ForceGraph2D = dynamic(
  () =>
    import("react-force-graph").then((mod) => {
      // Ensure we're in browser environment before trying to use ForceGraph2D
      if (typeof window !== "undefined") {
        return mod.ForceGraph2D
      }
      // Return a placeholder component if not in browser
      return () => <div>Graph visualization not available</div>
    }),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-[500px] bg-muted/20 border rounded-md">
        <div className="text-muted-foreground">Loading graph visualization...</div>
      </div>
    ),
  },
)

export function RelationshipGraph() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [graphData, setGraphData] = useState<any>(null)
  const [focusNode, setFocusNode] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<string>("all")
  const [isClient, setIsClient] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState("graph")
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Replace the useEffect for isClient with this improved version
  useEffect(() => {
    // Add a small delay to ensure DOM is fully ready before setting isClient
    const timer = setTimeout(() => {
      setIsClient(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  // Completely revise the useEffect for graph data to be more robust
  useEffect(() => {
    if (!isClient) return

    // This would be fetched from GraphQL in a real implementation
    const generateGraphData = () => {
      try {
        const samples = [
          { id: "s1", name: "T250306A", type: "sample", metadata: { substrate: "GaAs", grower: "Scott Sifferman" } },
          { id: "s2", name: "T250307B", type: "sample", metadata: { substrate: "InP", grower: "Maria Chen" } },
          { id: "s3", name: "T250310C", type: "sample", metadata: { substrate: "GaAs", grower: "James Wilson" } },
          { id: "s4", name: "T250312D", type: "sample", metadata: { substrate: "Si", grower: "Scott Sifferman" } },
          { id: "s5", name: "T250315E", type: "sample", metadata: { substrate: "GaAs", grower: "Maria Chen" } },
        ]

        const recipes = [
          { id: "r1", name: "B200319A", type: "recipe", metadata: { temperature: "600°C", pressure: "1e-10 Torr" } },
          { id: "r2", name: "B200320B", type: "recipe", metadata: { temperature: "550°C", pressure: "5e-10 Torr" } },
          { id: "r3", name: "B200321C", type: "recipe", metadata: { temperature: "620°C", pressure: "2e-10 Torr" } },
          { id: "r4", name: "B200322D", type: "recipe", metadata: { temperature: "580°C", pressure: "3e-10 Torr" } },
          { id: "r5", name: "B200323E", type: "recipe", metadata: { temperature: "590°C", pressure: "2e-10 Torr" } },
        ]

        const measurements = [
          { id: "m1", name: "UV PL 1", type: "measurement", metadata: { temperature: "295K", excitation: "532nm" } },
          { id: "m2", name: "UV PR 1", type: "measurement", metadata: { temperature: "295K", modulation: "1kHz" } },
          { id: "m3", name: "IR PL 1", type: "measurement", metadata: { temperature: "77K", excitation: "808nm" } },
          { id: "m4", name: "UV PL 2", type: "measurement", metadata: { temperature: "295K", excitation: "405nm" } },
          { id: "m5", name: "IR PL 2", type: "measurement", metadata: { temperature: "10K", excitation: "980nm" } },
          { id: "m6", name: "UV PR 2", type: "measurement", metadata: { temperature: "295K", modulation: "2kHz" } },
          { id: "m7", name: "UV PL 3", type: "measurement", metadata: { temperature: "150K", excitation: "325nm" } },
        ]

        const links = [
          // Sample to Recipe links
          { source: "s1", target: "r1", value: 1 },
          { source: "s2", target: "r2", value: 1 },
          { source: "s3", target: "r3", value: 1 },
          { source: "s4", target: "r4", value: 1 },
          { source: "s5", target: "r5", value: 1 },

          // Sample to Measurement links
          { source: "s1", target: "m1", value: 1 },
          { source: "s1", target: "m2", value: 1 },
          { source: "s2", target: "m3", value: 1 },
          { source: "s2", target: "m4", value: 1 },
          { source: "s3", target: "m5", value: 1 },
          { source: "s4", target: "m6", value: 1 },
          { source: "s5", target: "m7", value: 1 },
        ]

        const nodes = [...samples, ...recipes, ...measurements]

        return { nodes, links }
      } catch (error) {
        console.error("Error generating graph data:", error)
        return { nodes: [], links: [] }
      }
    }

    // Set a small timeout to ensure DOM is fully ready
    const timer = setTimeout(() => {
      setGraphData(generateGraphData())
    }, 100)

    return () => clearTimeout(timer)
  }, [isClient])

  // Replace the entire filteredGraphData function with this safer version
  const filteredGraphData = () => {
    if (!isClient || !graphData) return { nodes: [], links: [] }

    try {
      if (filterType === "all" && !searchTerm) return graphData

      let filteredNodes = graphData.nodes

      // Apply type filter
      if (filterType !== "all") {
        filteredNodes = filteredNodes.filter((node) => {
          if (filterType === "sample-recipe") {
            return node.type === "sample" || node.type === "recipe"
          }
          if (filterType === "sample-measurement") {
            return node.type === "sample" || node.type === "measurement"
          }
          return node.type === filterType
        })
      }

      // Apply search filter
      if (searchTerm) {
        filteredNodes = filteredNodes.filter((node) => node.name.toLowerCase().includes(searchTerm.toLowerCase()))
      }

      const nodeIds = new Set(filteredNodes.map((node) => node.id))

      const filteredLinks = graphData.links.filter((link) => {
        const sourceId = typeof link.source === "object" ? link.source.id : link.source
        const targetId = typeof link.target === "object" ? link.target.id : link.target
        return nodeIds.has(sourceId) && nodeIds.has(targetId)
      })

      return { nodes: filteredNodes, links: filteredLinks }
    } catch (error) {
      console.error("Error filtering graph data:", error)
      return { nodes: [], links: [] }
    }
  }

  // Get node color based on type
  const getNodeColor = (node: any) => {
    switch (node.type) {
      case "sample":
        return "hsl(45, 100%, 50%)" // Gold/yellow
      case "recipe":
        return "hsl(210, 100%, 50%)" // Blue
      case "measurement":
        return "hsl(130, 100%, 40%)" // Green
      default:
        return "hsl(0, 0%, 70%)" // Gray
    }
  }

  // Focus on a specific node
  const handleFocusNode = (nodeId: string) => {
    setFocusNode(nodeId)

    if (graphData) {
      const node = graphData.nodes.find((n) => n.id === nodeId)
      if (node) {
        setSelectedNode(node)
        setActiveTab("details")
      }
    }
  }

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!graphData) return

    setIsLoading(true)

    // Simulate search delay
    setTimeout(() => {
      const results = graphData.nodes.filter((node) => node.name.toLowerCase().includes(searchTerm.toLowerCase()))

      setSearchResults(results)
      setIsLoading(false)

      if (results.length === 0) {
        toast.info("No results found")
      }
    }, 500)
  }

  // Handle node selection from search results
  const handleSelectSearchResult = (node: any) => {
    setSelectedNode(node)
    setActiveTab("details")
    setFocusNode(node.id)
  }

  // Handle export graph data
  const handleExportData = () => {
    if (!graphData) return

    try {
      const dataStr = JSON.stringify(graphData, null, 2)
      const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

      const exportFileDefaultName = `relationship-graph-${new Date().toISOString().slice(0, 10)}.json`

      const linkElement = document.createElement("a")
      linkElement.setAttribute("href", dataUri)
      linkElement.setAttribute("download", exportFileDefaultName)
      linkElement.click()

      toast.success("Graph data exported successfully")
    } catch (error) {
      console.error("Error exporting graph data:", error)
      toast.error("Failed to export graph data")
    }
  }

  // Handle import graph data
  const handleImportData = () => {
    // In a real implementation, this would open a file picker
    // and parse the imported JSON file
    toast.info("Import functionality would be implemented here")
  }

  // Get related nodes
  const getRelatedNodes = (nodeId: string) => {
    if (!graphData) return []

    const relatedLinks = graphData.links.filter((link) => {
      const sourceId = typeof link.source === "object" ? link.source.id : link.source
      const targetId = typeof link.target === "object" ? link.target.id : link.target
      return sourceId === nodeId || targetId === nodeId
    })

    const relatedNodeIds = new Set<string>()

    relatedLinks.forEach((link) => {
      const sourceId = typeof link.source === "object" ? link.source.id : link.source
      const targetId = typeof link.target === "object" ? link.target.id : link.target

      if (sourceId === nodeId) {
        relatedNodeIds.add(targetId)
      } else {
        relatedNodeIds.add(sourceId)
      }
    })

    return graphData.nodes.filter((node) => relatedNodeIds.has(node.id))
  }

  // Navigate to node detail page
  const handleNavigateToDetail = (node: any) => {
    if (!node) return

    switch (node.type) {
      case "sample":
        router.push(`/samples/${node.id}`)
        break
      case "recipe":
        router.push(`/recipes/${node.id}`)
        break
      case "measurement":
        router.push(`/measurements/${node.id}`)
        break
      default:
        break
    }
  }

  // Add this function inside the RelationshipGraph component, before the return statement
  // This will optimize the graph rendering for larger datasets
  const getOptimizedGraphData = () => {
    if (!isClient || !graphData) return { nodes: [], links: [] }

    const data = filteredGraphData()

    // For large datasets, limit the number of nodes to improve performance
    if (data.nodes.length > 100) {
      // Create a warning toast
      toast.warning("Large dataset detected. Showing only the first 100 nodes for better performance.")

      // Limit nodes to 100
      const limitedNodes = data.nodes.slice(0, 100)
      const nodeIds = new Set(limitedNodes.map((node) => node.id))

      // Only keep links between the limited nodes
      const limitedLinks = data.links.filter((link) => {
        const sourceId = typeof link.source === "object" ? link.source.id : link.source
        const targetId = typeof link.target === "object" ? link.target.id : link.target
        return nodeIds.has(sourceId) && nodeIds.has(targetId)
      })

      return { nodes: limitedNodes, links: limitedLinks }
    }

    return data
  }

  // If we're not on the client yet, show a loading placeholder
  if (!isClient || !graphData) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2 justify-between">
          <div className="w-[200px] h-10 bg-muted animate-pulse rounded-md"></div>
          <div className="flex gap-2">
            <div className="w-24 h-10 bg-muted animate-pulse rounded-md"></div>
            <div className="w-24 h-10 bg-muted animate-pulse rounded-md"></div>
          </div>
        </div>
        <div className="h-[500px] border rounded-md bg-muted/20 flex items-center justify-center">
          <div className="text-muted-foreground">Loading relationship graph...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-wrap gap-2 justify-between mb-4">
          <TabsList>
            <TabsTrigger value="graph">Graph View</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="import-export">Import/Export</TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilterType("all")
                setSearchTerm("")
                setSearchResults([])
                setSelectedNode(null)
                setActiveTab("graph")
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset View
            </Button>
          </div>
        </div>

        <TabsContent value="graph" className="space-y-4">
          <div className="flex flex-wrap gap-2 justify-between">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Relationships</SelectItem>
                <SelectItem value="sample">Samples Only</SelectItem>
                <SelectItem value="recipe">Recipes Only</SelectItem>
                <SelectItem value="measurement">Measurements Only</SelectItem>
                <SelectItem value="sample-recipe">Samples & Recipes</SelectItem>
                <SelectItem value="sample-measurement">Samples & Measurements</SelectItem>
              </SelectContent>
            </Select>

            <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="search"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
              <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </form>
          </div>

          <div className="h-[500px] border rounded-md overflow-hidden" ref={containerRef}>
            {graphData && isClient && containerRef.current ? (
              <ErrorBoundary
                fallback={
                  <div className="flex items-center justify-center h-[500px] bg-muted/20 border rounded-md">
                    <div className="text-muted-foreground">
                      Unable to load graph visualization. Please try again later.
                    </div>
                  </div>
                }
              >
                <ForceGraph2D
                  graphData={getOptimizedGraphData()}
                  nodeLabel="name"
                  nodeColor={getNodeColor}
                  nodeRelSize={6}
                  linkWidth={1}
                  linkColor={() => "rgba(0,0,0,0.2)"}
                  width={containerRef.current?.clientWidth || 800}
                  height={500}
                  cooldownTicks={100}
                  onEngineStop={() => console.log("Graph rendering stabilized")}
                  onNodeClick={(node) => {
                    if (node && node.id) {
                      handleFocusNode(node.id)
                    }
                  }}
                />
              </ErrorBoundary>
            ) : (
              <div className="flex items-center justify-center h-[500px] bg-muted/20 border rounded-md">
                <div className="text-muted-foreground">Initializing graph visualization...</div>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(45, 100%, 50%)" }}></div>
              <span className="text-sm">Samples</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(210, 100%, 50%)" }}></div>
              <span className="text-sm">Recipes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "hsl(130, 100%, 40%)" }}></div>
              <span className="text-sm">Measurements</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Relationships</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex w-full items-center space-x-2 mb-6">
                <Input
                  type="search"
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
              </form>

              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-4">
                  {searchResults.map((node) => (
                    <Card
                      key={node.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleSelectSearchResult(node)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{node.name}</h3>
                            <p className="text-sm text-muted-foreground capitalize">{node.type}</p>
                          </div>
                          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: getNodeColor(node) }}></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : searchTerm ? (
                <div className="flex justify-center items-center h-40">
                  <p className="text-muted-foreground">No results found</p>
                </div>
              ) : (
                <div className="flex justify-center items-center h-40">
                  <p className="text-muted-foreground">Enter a search term to find samples, recipes, or measurements</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          {selectedNode ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{selectedNode.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">Type</dt>
                      <dd className="capitalize">{selectedNode.type}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">ID</dt>
                      <dd>{selectedNode.id}</dd>
                    </div>
                    {selectedNode.metadata &&
                      Object.entries(selectedNode.metadata).map(([key, value]) => (
                        <div key={key}>
                          <dt className="text-sm font-medium text-muted-foreground capitalize">{key}</dt>
                          <dd>{value as string}</dd>
                        </div>
                      ))}
                  </dl>
                  <div className="mt-4">
                    <Button onClick={() => handleNavigateToDetail(selectedNode)}>View Details</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Related Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedNode && (
                    <div className="space-y-4">
                      {getRelatedNodes(selectedNode.id).map((node) => (
                        <div
                          key={node.id}
                          className="flex items-center justify-between p-2 border rounded-md cursor-pointer hover:bg-muted/50"
                          onClick={() => handleSelectSearchResult(node)}
                        >
                          <div className="flex items-center">
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{ backgroundColor: getNodeColor(node) }}
                            ></div>
                            <div>
                              <p className="font-medium">{node.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">{node.type}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleNavigateToDetail(node)
                            }}
                          >
                            View
                          </Button>
                        </div>
                      ))}

                      {getRelatedNodes(selectedNode.id).length === 0 && (
                        <p className="text-center text-muted-foreground py-4">No related items found</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex justify-center items-center h-40">
              <p className="text-muted-foreground">Select a node from the graph or search results to view details</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="import-export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import/Export Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="font-medium">Export Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Export the current relationship graph data as a JSON file that can be imported later.
                  </p>
                  <Button onClick={handleExportData}>
                    <Download className="mr-2 h-4 w-4" />
                    Export Graph Data
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Import Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Import relationship graph data from a previously exported JSON file.
                  </p>
                  <Button onClick={handleImportData}>
                    <Upload className="mr-2 h-4 w-4" />
                    Import Graph Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

