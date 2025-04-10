"use client"

import { useEffect, useState } from "react"
import { getRecipes } from "@/lib/actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"

interface Recipe {
  id: number
  sample_id: number
  sample_name: string
  name: string
  growth_temperature: number
  growth_pressure: number
  description: string
  created_at: string
}

export function RecipeList() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const data = await getRecipes()
        setRecipes(data)
      } catch (error) {
        console.error("Failed to fetch recipes:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecipes()
  }, [])

  if (loading) {
    return <div className="text-center p-4">Loading recipes...</div>
  }

  if (recipes.length === 0) {
    return <div className="text-center p-4">No recipes found. Create your first recipe to get started.</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Sample</TableHead>
            <TableHead>Temperature (°C)</TableHead>
            <TableHead>Pressure</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recipes.map((recipe) => (
            <TableRow key={recipe.id}>
              <TableCell className="font-medium">{recipe.name}</TableCell>
              <TableCell>
                <Link href={`/samples/${recipe.sample_id}`} className="hover:underline">
                  {recipe.sample_name}
                </Link>
              </TableCell>
              <TableCell>{recipe.growth_temperature}</TableCell>
              <TableCell>{recipe.growth_pressure}</TableCell>
              <TableCell className="text-right">
                <Link href={`/recipes/${recipe.id}`}>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View recipe</span>
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
