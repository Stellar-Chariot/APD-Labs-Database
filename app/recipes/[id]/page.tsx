import { getRecipeById } from "@/lib/actions"
import { Heading } from "@/components/ui/heading"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { AddRecipeLayerButton } from "@/components/recipes/add-recipe-layer-button"
import { RecipeLayersVisualization } from "@/components/recipes/recipe-layers-visualization"

export default async function RecipeDetailPage({ params }: { params: { id: string } }) {
  const recipeId = Number.parseInt(params.id)
  const { recipe, layers } = await getRecipeById(recipeId)

  if (!recipe) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center space-x-2">
          <Link href="/recipes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Recipes
            </Button>
          </Link>
        </div>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold">Recipe not found</h2>
          <p className="text-muted-foreground">The recipe you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center space-x-2">
        <Link href="/recipes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Recipes
          </Button>
        </Link>
      </div>

      <Heading title={`Recipe: ${recipe.name}`} description="Detailed information about this MBE recipe" />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recipe Information</CardTitle>
            <CardDescription>Basic details about this growth recipe</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd className="text-lg font-semibold">{recipe.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Sample</dt>
                <dd className="text-lg font-semibold">
                  <Link href={`/samples/${recipe.sample_id}`} className="hover:underline">
                    {recipe.sample_name}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Growth Temperature</dt>
                <dd className="text-lg font-semibold">{recipe.growth_temperature} °C</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Growth Pressure</dt>
                <dd className="text-lg font-semibold">{recipe.growth_pressure} Torr</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                <dd className="text-lg font-semibold">{new Date(recipe.created_at).toLocaleDateString()}</dd>
              </div>
            </dl>
            {recipe.description && (
              <div className="mt-4">
                <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                <dd className="mt-1 text-sm">{recipe.description}</dd>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recipe Layers</CardTitle>
              <CardDescription>Layer structure for this recipe</CardDescription>
            </div>
            <AddRecipeLayerButton recipeId={recipeId} nextLayerNumber={layers.length + 1} />
          </CardHeader>
          <CardContent>
            {layers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Layer</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Thickness (Å)</TableHead>
                    <TableHead>Temp (°C)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {layers.map((layer) => (
                    <TableRow key={layer.id}>
                      <TableCell className="font-medium">{layer.layer_number}</TableCell>
                      <TableCell>{layer.material}</TableCell>
                      <TableCell>{layer.thickness}</TableCell>
                      <TableCell>{layer.temperature}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground">No layers defined for this recipe yet.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add the layer visualization */}
      <RecipeLayersVisualization layers={layers} />
    </div>
  )
}
