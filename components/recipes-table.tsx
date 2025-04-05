"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Trash2, AlertTriangle, Edit, Layers } from "lucide-react"
import { useRecipesQuery, useDeleteRecipe } from "@/hooks/use-query-recipes"
import { ErrorDisplay, EmptyStateError } from "@/components/ui/error-display"
import { ErrorBoundary } from "@/components/error-boundary"
import { LayerStructureDialog } from "@/components/layer-structure-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useSamplesQuery } from "@/hooks/use-query-samples"

export function RecipesTable() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [recipeToDelete, setRecipeToDelete] = useState<string | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState(null)

  // Use React Query to fetch recipes
  const { data: recipes, isLoading, error, refetch } = useRecipesQuery()

  // Fetch samples to display sample names
  const { data: samples } = useSamplesQuery()

  // Create a map of sample IDs to sample names
  const sampleNames = new Map<string, string>()
  if (samples) {
    samples.forEach((sample) => {
      sampleNames.set(sample.id, sample.name || sample.id)
    })
  }

  // Use React Query mutation for deleting recipes
  const deleteRecipeMutation = useDeleteRecipe()

  // Safely filter recipes, ensuring recipes is an array
  const filteredRecipes = Array.isArray(recipes)
    ? recipes.filter((recipe) => {
        const searchString = searchQuery.toLowerCase()
        return (
          recipe.id.toLowerCase().includes(searchString) ||
          (recipe.name?.toLowerCase() || "").includes(searchString) ||
          (recipe.description?.toLowerCase() || "").includes(searchString) ||
          (recipe.sampleId?.toLowerCase() || "").includes(searchString) ||
          (sampleNames.get(recipe.sampleId)?.toLowerCase() || "").includes(searchString)
        )
      })
    : []

  const handleViewRecipe = (id: string) => {
    if (!id) {
      console.error("Cannot navigate to recipe detail: Missing ID")
      return
    }
    router.push(`/recipes/${encodeURIComponent(id)}`)
  }

  const handleEditRecipe = (id: string) => {
    if (!id) {
      console.error("Cannot navigate to recipe edit: Missing ID")
      return
    }
    router.push(`/recipes/${encodeURIComponent(id)}/edit`)
  }

  const handleViewSample = (sampleId: string) => {
    if (!sampleId) {
      console.error("Cannot navigate to sample detail: Missing ID")
      return
    }
    router.push(`/samples/${encodeURIComponent(sampleId)}`)
  }

  const handleDeleteRecipe = async () => {
    if (recipeToDelete) {
      await deleteRecipeMutation.mutateAsync(recipeToDelete)
      setRecipeToDelete(null)
    }
  }

  const handleViewLayerStructure = (recipe) => {
    setSelectedRecipe(recipe)
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
            disabled={isLoading}
            aria-label="Search recipes"
          />
        </div>

        {isLoading ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Sample</TableHead>
                  <TableHead>Growth Parameters</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                      Loading recipes...
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ) : error ? (
          <ErrorDisplay
            title="Failed to load recipes"
            message={error instanceof Error ? error.message : "Unknown error"}
            onRetry={() => refetch()}
          />
        ) : filteredRecipes.length === 0 ? (
          <EmptyStateError
            title={searchQuery ? "No matching recipes" : "No recipes available"}
            message={
              searchQuery
                ? "No recipes match your search criteria. Try adjusting your search terms."
                : "There are no MBE recipes available in the system."
            }
            actionLabel={searchQuery ? "Clear Search" : "Add Recipe"}
            onAction={searchQuery ? () => setSearchQuery("") : () => router.push("/recipes/new")}
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Sample</TableHead>
                  <TableHead>Growth Parameters</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecipes.map((recipe) => (
                  <TableRow key={recipe.id}>
                    <TableCell className="font-medium">{recipe.name || "Unnamed Recipe"}</TableCell>
                    <TableCell>
                      {recipe.sampleId && (
                        <Button variant="link" className="p-0 h-auto" onClick={() => handleViewSample(recipe.sampleId)}>
                          {sampleNames.get(recipe.sampleId) || recipe.sampleId}
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col space-y-1 text-sm">
                        {recipe.growthParameters?.substrateTemperature && (
                          <div>Temp: {recipe.growthParameters.substrateTemperature}</div>
                        )}
                        {recipe.growthParameters?.growthTime && <div>Time: {recipe.growthParameters.growthTime}</div>}
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-1"
                          onClick={() => handleViewLayerStructure(recipe)}
                        >
                          <Layers className="mr-2 h-4 w-4" />
                          View Layer Structure
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{new Date(recipe.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewRecipe(recipe.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditRecipe(recipe.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <AlertDialog
                          open={recipeToDelete === recipe.id}
                          onOpenChange={(open) => !open && setRecipeToDelete(null)}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setRecipeToDelete(recipe.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center">
                                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                                Delete Recipe
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this MBE recipe? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteRecipe}
                                className="bg-red-500 hover:bg-red-600"
                                disabled={deleteRecipeMutation.isPending}
                              >
                                {deleteRecipeMutation.isPending ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Layer Structure Dialog */}
      {selectedRecipe && (
        <LayerStructureDialog recipe={selectedRecipe} open={!!selectedRecipe} onClose={() => setSelectedRecipe(null)} />
      )}
    </ErrorBoundary>
  )
}

