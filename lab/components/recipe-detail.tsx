"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, Edit, Download, Copy } from "lucide-react"
import Link from "next/link"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { toast } from "sonner"

interface RecipeDetailProps {
  id: string
}

export default function RecipeDetail({ id }: RecipeDetailProps) {
  const [activeTab, setActiveTab] = useState("structure")

  // In a real implementation, this would be fetched via GraphQL using the recipe ID
  const recipe = {
    id,
    identifier: "B200319A",
    name: "GaAs/AlGaAs QW",
    growthDate: new Date("2020-03-19"),
    substrate: "GaAs",
    grower: "Scott Sifferman",
    description: "Standard GaAs/AlGaAs quantum well structure grown at 600°C",
    createdAt: new Date("2020-03-20T10:15:00Z"),
    metadata: {
      substrateSize: '1/4 3"',
      backingWafer: "sapphire",
      rotationRpm: 5,
    },
    layers: [
      { id: "l1", material: "GaAs", thickness: 100, purpose: "cap", composition: null },
      { id: "l2", material: "AlAs", thickness: 100, purpose: "blocking layer", composition: null },
      { id: "l3", material: "AlGaAs", thickness: 3000, purpose: "barrier", composition: "Al0.3Ga0.7As" },
      { id: "l4", material: "GaAs", thickness: 100, purpose: "QW", composition: null },
      { id: "l5", material: "AlGaAs", thickness: 3000, purpose: "barrier", composition: "Al0.3Ga0.7As" },
      { id: "l6", material: "AlAs", thickness: 100, purpose: "blocking layer", composition: null },
      { id: "l7", material: "GaAs", thickness: 2000, purpose: "buffer", composition: null },
      { id: "l8", material: "GaAs", thickness: 0, purpose: "substrate", isSubstrate: true, composition: null },
    ],
    growthParameters: {
      temperature: "600°C",
      pressure: "1e-10 Torr",
      growthRate: "1 μm/hr",
      arsenic: "1.89e-7 Torr",
      gallium: "0.88 Å/sec",
      aluminum: "3.61e-8 Torr",
    },
    samples: [
      { id: "s1", identifier: "T250306A", name: "GaAs QW Structure" },
      { id: "s2", identifier: "T250307B", name: "AlGaAs Barrier Test" },
      { id: "s3", identifier: "T250318F", name: "InGaAs/GaAs SL" },
    ],
    notes: "6000 Ang of Al0.3Ga0.7As is enough to absorb 90% of an incident 532 nm pump laser",
  }

  // Helper function to get color for layer visualization
  const getLayerColor = (material: string) => {
    const colors: Record<string, string> = {
      GaAs: "layer-GaAs",
      AlAs: "layer-AlAs",
      AlGaAs: "layer-AlGaAs",
      InGaAs: "layer-InGaAs",
    }

    return colors[material] || "layer-substrate"
  }

  // Calculate total thickness (excluding substrate)
  const totalThickness = recipe.layers
    .filter((layer) => !layer.isSubstrate)
    .reduce((sum, layer) => sum + layer.thickness, 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/recipes">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {recipe.identifier} - {recipe.name}
          </h1>
          <p className="text-muted-foreground">MBE Growth Recipe</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recipe Information</CardTitle>
            <CardDescription>Basic details about this growth recipe</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Growth Date</dt>
                <dd>{recipe.growthDate.toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Substrate</dt>
                <dd>
                  <Badge variant="outline">{recipe.substrate}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Grower</dt>
                <dd>{recipe.grower}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                <dd>{recipe.createdAt.toLocaleDateString()}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                <dd className="mt-1">{recipe.description}</dd>
              </div>
            </dl>
            <div className="mt-4 flex justify-end space-x-2">
              <Button variant="outline" size="sm">
                <Copy className="mr-2 h-4 w-4" /> Clone Recipe
              </Button>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" /> Edit Recipe
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Edit Recipe</h4>
                      <p className="text-sm text-muted-foreground">Make changes to the recipe information</p>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" defaultValue={recipe.name} className="col-span-2 h-8" />
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="substrate">Substrate</Label>
                        <Input id="substrate" defaultValue={recipe.substrate} className="col-span-2 h-8" />
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="grower">Grower</Label>
                        <Input id="grower" defaultValue={recipe.grower} className="col-span-2 h-8" />
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" defaultValue={recipe.description} className="col-span-2" rows={3} />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      size="sm"
                      onClick={() => {
                        // In a real implementation, this would call a GraphQL mutation
                        // to update the recipe
                        toast.success("Recipe updated successfully!")
                      }}
                    >
                      Save changes
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Layer Structure</CardTitle>
            <CardDescription>Total thickness: {totalThickness} Å</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recipe.layers
                .filter((layer) => !layer.isSubstrate)
                .map((layer, index) => (
                  <div
                    key={layer.id}
                    className={`layer-block ${getLayerColor(layer.material)}`}
                    style={{
                      height: `${Math.max(36, Math.min(100, layer.thickness / 50))}px`,
                    }}
                  >
                    <div className="font-medium">{layer.material}</div>
                    <div className="text-sm">
                      {layer.thickness}Å - {layer.purpose}
                      {layer.composition && ` (${layer.composition})`}
                    </div>
                  </div>
                ))}
              <div className="layer-block layer-substrate">
                <div className="font-medium">{recipe.substrate}</div>
                <div className="text-sm">Substrate</div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Export Structure
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="structure">Layer Details</TabsTrigger>
          <TabsTrigger value="parameters">Growth Parameters</TabsTrigger>
          <TabsTrigger value="samples">Related Samples</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="structure">
          <Card>
            <CardHeader>
              <CardTitle>Layer Structure Details</CardTitle>
              <CardDescription>Detailed information about each layer</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Layer</TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Thickness (Å)</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Composition</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recipe.layers.map((layer, index) => (
                    <TableRow key={layer.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <Badge className={getLayerColor(layer.material)}>{layer.material}</Badge>
                      </TableCell>
                      <TableCell>{layer.isSubstrate ? "—" : layer.thickness}</TableCell>
                      <TableCell>{layer.purpose}</TableCell>
                      <TableCell>{layer.composition || "—"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="parameters">
          <Card>
            <CardHeader>
              <CardTitle>Growth Parameters</CardTitle>
              <CardDescription>MBE growth conditions</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {Object.entries(recipe.growthParameters).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm font-medium text-muted-foreground">
                      {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1")}
                    </dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 p-4 bg-muted/30 rounded-md border">
                <h4 className="font-medium mb-2">Stationary Values</h4>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">GaTip:</span> 1.89e-7 Torr ~ 0.88 Å/s
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">GaAs:</span> 0.88 Å/sec
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">eval t_GaTip:</span> 997.0
                    </p>
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium">AlBase:</span> 3.61e-8 Torr
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">AlGaAs:</span> 1.26 Å/sec estimated
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">eval t_AlBase:</span> 1070.4
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="samples">
          <Card>
            <CardHeader>
              <CardTitle>Related Samples</CardTitle>
              <CardDescription>Samples grown using this recipe</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recipe.samples.map((sample) => (
                  <div
                    key={sample.id}
                    className="flex items-center justify-between space-x-4 rounded-md border p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="font-medium text-primary">{sample.identifier.substring(0, 2)}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium leading-none">{sample.identifier}</p>
                        <p className="text-sm text-muted-foreground">{sample.name}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/samples/${sample.id}`}>View Sample</Link>
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Growth Notes</CardTitle>
              <CardDescription>Special notes and observations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/30 rounded-md border whitespace-pre-line">
                <p className="text-sm">{recipe.notes}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

