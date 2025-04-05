"use client"
import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, AlertTriangle, Layers } from "lucide-react"
import { useRecipeQuery, useDeleteRecipe } from "@/hooks/use-query-recipes"
import { useSamplesQuery } from "@/hooks/use-query-samples"
import { Skeleton } from "@/components/ui/skeleton"
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

export default function RecipeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [showLayerStructure, setShowLayerStructure] = useState(false)

  // Get the recipe ID from the URL params
  const recipeId = Array.isArray(params?.id) ? params.id[0] : params?.id

  // Use React Query to fetch the recipe
  const { data: recipe, isLoading, error, refetch } = useRecipeQuery(recipeId || "")

  // Fetch samples to get the sample name
  const { data: samples } = useSamplesQuery()

  // Get the sample name
  const sampleName =
    recipe?.sampleId && samples ? samples.find((s) => s.id === recipe.sampleId)?.name || recipe.sampleId : null

  // Use React Query mutation for deleting recipes
  const deleteRecipeMutation = useDeleteRecipe()

  const handleDeleteRecipe = async () => {
    if (recipe?.id) {
      await deleteRecipeMutation.mutateAsync(recipe.id)
      router.push("/recipes")
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Error Loading Recipe</h1>
          <Button variant="outline" onClick={() => router.push("/recipes")}>
            Back to Recipes
          </Button>
        </div>
        <ErrorDisplay
          title="Failed to load recipe"
          message={error instanceof Error ? error.message : "Unknown error"}
          onRetry={() => refetch()}
        />
      </div>
    )
  }

  // Not found state
  if (!recipe) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Recipe Not Found</h1>
          <Button variant="outline" onClick={() => router.push("/recipes")}>
            Back to Recipes
          </Button>
        </div>
        <EmptyStateError
          title="Recipe Not Found"
          message="The requested recipe could not be found or may have been deleted."
          actionLabel="View All Recipes"
          onAction={() => router.push("/recipes")}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{recipe.name}</h1>
          {sampleName && (
            <p className="text-muted-foreground">
              Sample:{" "}
              <Button variant="link" className="p-0 h-auto" onClick={() => router.push(`/samples/${recipe.sampleId}`)}>
                {sampleName}
              </Button>
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => router.push("/recipes")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Button>
          <Button variant="outline" onClick={() => router.push(`/recipes/${recipe.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="text-red-500 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="mr-2 h-4 w-4" />
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
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ErrorBoundary>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Layer Structure</CardTitle>
                <CardDescription>Visualization of the layer structure for this recipe</CardDescription>
              </div>
              <Button onClick={() => setShowLayerStructure(true)}>
                <Layers className="mr-2 h-4 w-4" />
                View Full Structure
              </Button>
            </CardHeader>
            <CardContent>
              <div className="text-sm">
                {recipe.growthParameters?.layerStructure ? (
                  <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md border">
                    {recipe.growthParameters.layerStructure}
                  </pre>
                ) : (
                  <p className="text-muted-foreground">No detailed layer structure information available.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </ErrorBoundary>

        <ErrorBoundary>
          <Card>
            <CardHeader>
              <CardTitle>Growth Parameters</CardTitle>
              <CardDescription>MBE growth parameters for this recipe</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Substrate Temperature</dt>
                  <dd>{recipe.growthParameters?.substrateTemperature || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Gallium Flux</dt>
                  <dd>{recipe.growthParameters?.galliumFlux || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Nitrogen Flow</dt>
                  <dd>{recipe.growthParameters?.nitrogenFlow || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Growth Time</dt>
                  <dd>{recipe.growthParameters?.growthTime || "N/A"}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Chamber Pressure</dt>
                  <dd>{recipe.growthParameters?.chamberPressure || "N/A"}</dd>
                </div>
                {recipe.growthParameters?.additionalParams && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Additional Parameters</dt>
                    <dd>{recipe.growthParameters.additionalParams}</dd>
                  </div>
                )}
                <div className="col-span-1 md:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                  <dd className="mt-1 whitespace-pre-wrap">{recipe.description || "No description available."}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </ErrorBoundary>
      </div>

      {/* Layer Structure Dialog */}
      {recipe && (
        <LayerStructureDialog recipe={recipe} open={showLayerStructure} onClose={() => setShowLayerStructure(false)} />
      )}
    </div>
  )
}

