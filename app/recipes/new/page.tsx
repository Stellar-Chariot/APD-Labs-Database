"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecipeForm } from "@/components/recipe-form"

export default function NewRecipePage() {
  const searchParams = useSearchParams()
  const sampleId = searchParams.get("sampleId")

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Add New MBE Recipe</h1>

      <Card>
        <CardHeader>
          <CardTitle>Recipe Information</CardTitle>
          <CardDescription>
            Enter the details of the new MBE growth recipe. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecipeForm initialData={sampleId ? { sampleId } : undefined} />
        </CardContent>
      </Card>
    </div>
  )
}

