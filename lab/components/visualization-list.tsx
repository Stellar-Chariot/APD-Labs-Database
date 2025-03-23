"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { visualizationService } from "@/services/visualization-service"
import VisualizationModal from "./visualization-modal"

export default function VisualizationList() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Get visualizations from service
  const { visualizations, isLoading, error, refetch } = visualizationService.useVisualizations()

  // Filter visualizations based on search
  const filteredVisualizations = visualizations.filter(
    (viz) =>
      search === "" ||
      viz.title.toLowerCase().includes(search.toLowerCase()) ||
      viz.description.toLowerCase().includes(search.toLowerCase()),
  )

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handleViewVisualization = (id: string) => {
    router.push(`/visualizations/${id}`)
  }

  const handleVisualizationCreated = () => {
    refetch()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Data Visualizations</h1>
        <Button className="bg-primary hover:bg-primary/90" onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Visualization
        </Button>
      </div>

      <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
        <Input
          type="search"
          placeholder="Search visualizations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full"
        />
        <Button type="submit" size="icon" className="bg-primary hover:bg-primary/90">
          <Search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </form>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="text-center py-4 text-red-500">Error loading visualizations: {error}</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredVisualizations.map((viz) => (
            <Card
              key={viz.id}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewVisualization(viz.id)}
            >
              <div className="aspect-video w-full bg-muted overflow-hidden">
                <img
                  src={viz.thumbnail || "/placeholder.svg?height=200&width=300"}
                  alt={viz.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{viz.title}</CardTitle>
                <CardDescription>{viz.description}</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{viz.createdBy}</span>
                  <span>{new Date(viz.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredVisualizations.length === 0 && (
            <div className="col-span-full flex items-center justify-center h-40 bg-muted/20 rounded-lg border border-dashed">
              <p className="text-muted-foreground">No visualizations found matching your search</p>
            </div>
          )}
        </div>
      )}

      {/* Visualization Creation Modal */}
      <VisualizationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleVisualizationCreated}
      />
    </div>
  )
}

