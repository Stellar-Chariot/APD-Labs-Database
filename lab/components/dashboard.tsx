"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentSamples } from "./recent-samples"
import { ActivityLog } from "./activity-log"
import { StatsCards } from "./stats-cards"
import { SearchBar } from "./search-bar"
import dynamic from "next/dynamic"
import ErrorBoundary from "./error-boundary"
import { Button } from "@/components/ui/button"

// Update the dynamic import of RelationshipGraph to be more robust
const RelationshipGraph = dynamic(
  () =>
    import("./relationship-graph")
      .then((mod) => mod.RelationshipGraph)
      .catch((error) => {
        console.error("Failed to load RelationshipGraph:", error)
        // Return a fallback component
        return () => (
          <div className="h-[500px] border rounded-md bg-muted/20 flex items-center justify-center">
            <div className="text-muted-foreground">
              Graph visualization could not be loaded. Please try again later.
            </div>
          </div>
        )
      }),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] border rounded-md bg-muted/20 flex items-center justify-center">
        <div className="text-muted-foreground">Loading relationship graph...</div>
      </div>
    ),
  },
)

export default function Dashboard() {
  // Update the search functionality to work properly
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    console.log("Searching for:", query)
    // In a real implementation, this would trigger a GraphQL query
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Scientific Data Dashboard</h1>
        {/* In the JSX, update the SearchBar component */}
        <SearchBar onSearch={handleSearch} />
      </div>

      <StatsCards />

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="samples">Recent Samples</TabsTrigger>
          <TabsTrigger value="relationships">Data Relationships</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="space-y-4">
          <ActivityLog />
        </TabsContent>
        <TabsContent value="samples" className="space-y-4">
          <RecentSamples searchQuery={searchQuery} />
        </TabsContent>
        {/* In the TabsContent for relationships, add error handling */}
        <TabsContent value="relationships" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Relationship Visualization</CardTitle>
              <CardDescription>Visualize connections between samples, measurements, and recipes</CardDescription>
            </CardHeader>
            <CardContent>
              <ErrorBoundary
                fallback={
                  <div className="h-[500px] border rounded-md bg-muted/20 flex items-center justify-center">
                    <div className="text-muted-foreground">
                      An error occurred while loading the relationship graph.
                      <Button
                        variant="link"
                        className="p-0 h-auto text-primary ml-2"
                        onClick={() => window.location.reload()}
                      >
                        Reload
                      </Button>
                    </div>
                  </div>
                }
              >
                {typeof window !== "undefined" ? (
                  <RelationshipGraph />
                ) : (
                  <div className="h-[500px] border rounded-md bg-muted/20 flex items-center justify-center">
                    <div className="text-muted-foreground">Loading relationship graph...</div>
                  </div>
                )}
              </ErrorBoundary>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

