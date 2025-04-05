"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRecipeQuery } from "@/hooks/use-query-recipes"
import { RecipeForm } from "@/components/recipe-form"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorDisplay } from "@/components/ui/error-display"

export default function EditRecipePage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)

  // Get the recipe ID from the URL params
  const recipeId = Array.isArray(params?.id) ? params.id[0] : params?.id

  // Use React Query to fetch the recipe
  const { data: recipe, isLoading: recipeLoading, error, refetch } = useRecipeQuery(recipeId || "")

  useEffect(() => {
    if (!recipeLoading) {
      setIsLoading(false)
    }
  }, [recipeLoading])

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
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h2 className="text-lg font-medium text-yellow-800">Recipe Not Found</h2>
          <p className="text-yellow-700 mt-1">The requested recipe could not be found or may have been deleted.</p>
          <Button className="mt-4" onClick={() => router.push("/recipes")}>
            View All Recipes
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Edit MBE Recipe</h1>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recipe Information</CardTitle>
          <CardDescription>
            Edit the details of the MBE growth recipe. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecipeForm initialData={recipe} isEditing={true} />
        </CardContent>
      </Card>
    </div>
  )
}

