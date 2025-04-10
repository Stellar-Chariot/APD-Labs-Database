import { getSampleById, getMeasurements, getRecipesForSample } from "@/lib/actions"
import { Heading } from "@/components/ui/heading"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Eye, Layers } from "lucide-react"
import { RecipeLayersVisualization } from "@/components/recipes/recipe-layers-visualization"

export default async function SampleDetailPage({ params }: { params: { id: string } }) {
  const sampleId = Number.parseInt(params.id)
  const sample = await getSampleById(sampleId)

  if (!sample) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center space-x-2">
          <Link href="/samples">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Samples
            </Button>
          </Link>
        </div>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold">Sample not found</h2>
          <p className="text-muted-foreground">The sample you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  // Get all measurements for this sample
  const allMeasurements = await getMeasurements()
  const sampleMeasurements = allMeasurements.filter((m) => m.sample_id === sampleId)

  // Get recipes and layers for this sample
  const { recipes, layers } = await getRecipesForSample(sampleId)

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center space-x-2">
        <Link href="/samples">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Samples
          </Button>
        </Link>
      </div>

      <Heading title={`Sample: ${sample.name}`} description="Detailed information about this sample" />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sample Information</CardTitle>
            <CardDescription>Basic details about this sample</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd className="text-lg font-semibold">{sample.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Equipment</dt>
                <dd className="text-lg font-semibold">{sample.equipment_code}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Date</dt>
                <dd className="text-lg font-semibold">{`${sample.year}/${sample.month}/${sample.day}`}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Material</dt>
                <dd className="text-lg font-semibold">{sample.material}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Identifier</dt>
                <dd className="text-lg font-semibold">{sample.sample_identifier}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                <dd className="text-lg font-semibold">{new Date(sample.created_at).toLocaleDateString()}</dd>
              </div>
            </dl>
            {sample.description && (
              <div className="mt-4">
                <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                <dd className="mt-1 text-sm">{sample.description}</dd>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Measurements</CardTitle>
            <CardDescription>Measurements associated with this sample</CardDescription>
          </CardHeader>
          <CardContent>
            {sampleMeasurements.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleMeasurements.map((measurement) => (
                    <TableRow key={measurement.id}>
                      <TableCell className="font-medium">{measurement.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{measurement.measurement_type}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/measurements/${measurement.id}`}>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View measurement</span>
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-4 text-muted-foreground">No measurements found for this sample.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recipe information and layer visualization */}
      {recipes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Growth Recipe</CardTitle>
                <CardDescription>MBE recipe used for this sample</CardDescription>
              </div>
              <Link href={`/recipes/${recipes[0].id}`}>
                <Button variant="outline" size="sm">
                  <Layers className="mr-2 h-4 w-4" />
                  View Recipe
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                  <dd className="text-lg font-semibold">{recipes[0].name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Growth Temperature</dt>
                  <dd className="text-lg font-semibold">{recipes[0].growth_temperature} °C</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Growth Pressure</dt>
                  <dd className="text-lg font-semibold">{recipes[0].growth_pressure} Torr</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                  <dd className="text-lg font-semibold">{new Date(recipes[0].created_at).toLocaleDateString()}</dd>
                </div>
              </dl>
              {recipes[0].description && (
                <div className="mt-4">
                  <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                  <dd className="mt-1 text-sm">{recipes[0].description}</dd>
                </div>
              )}
              {recipes.length > 1 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    This sample has {recipes.length} recipes. Viewing the most recent one.{" "}
                    <Link href={`/recipes/${recipes[0].id}`} className="text-primary hover:underline">
                      See all recipes
                    </Link>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Layer visualization */}
          <RecipeLayersVisualization layers={layers} />
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Growth Recipe</CardTitle>
            <CardDescription>No recipe found for this sample</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">This sample doesn't have any associated growth recipes.</p>
              <Link href={`/recipes`}>
                <Button>
                  <Layers className="mr-2 h-4 w-4" />
                  Create Recipe
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
