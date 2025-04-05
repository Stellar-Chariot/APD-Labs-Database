import { Suspense } from "react"
import { RecipesTable } from "@/components/recipes-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function RecipesPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">MBE Recipes</h1>
        <Link href="/recipes/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add New Recipe
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All MBE Recipes</CardTitle>
          <CardDescription>View and manage all Molecular Beam Epitaxy growth recipes in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading recipes...</div>}>
            <RecipesTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

