"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function SampleDetail() {
  // In a real implementation, this would be fetched via GraphQL using a sample ID from the URL
  const sample = {
    id: "1",
    identifier: "T250306A",
    name: "GaAs QW Structure",
    growthDate: new Date("2025-03-06"),
    substrate: "GaAs",
    grower: "Scott Sifferman",
    description: "Standard GaAs/AlGaAs quantum well structure grown at 600°C",
    createdAt: new Date("2025-03-07T10:15:00Z"),
    metadata: {
      substrateSize: '1/4 3"',
      backingWafer: "sapphire",
      rotationRpm: 5,
    },
    recipe: {
      id: "r1",
      recipeName: "B200319A",
      layers: [
        { material: "GaAs", thickness: 100, purpose: "cap" },
        { material: "AlAs", thickness: 100, purpose: "blocking layer" },
        { material: "AlGaAs", thickness: 3000, purpose: "barrier", composition: "Al0.3Ga0.7As" },
        { material: "GaAs", thickness: 100, purpose: "QW" },
        { material: "GaAs", thickness: 0, purpose: "substrate", isSubstrate: true },
      ],
    },
    measurements: [
      {
        id: "m1",
        measurementType: "UV_PL",
        title: "Room Temperature PL Measurement",
        createdAt: new Date("2025-03-07T14:30:00Z"),
      },
      {
        id: "m2",
        measurementType: "UV_PR",
        title: "PR Measurement at 300K",
        createdAt: new Date("2025-03-08T11:15:00Z"),
      },
      {
        id: "m3",
        measurementType: "IR_PL",
        title: "IR PL at 77K",
        createdAt: new Date("2025-03-09T09:45:00Z"),
      },
    ],
  }

  // Helper function to get color for layer visualization
  const getLayerColor = (material: string) => {
    const colors: Record<string, string> = {
      GaAs: "bg-emerald-200 dark:bg-emerald-800",
      AlAs: "bg-amber-200 dark:bg-amber-800",
      AlGaAs: "bg-sky-200 dark:bg-sky-800",
      InGaAs: "bg-rose-200 dark:bg-rose-800",
    }

    return colors[material] || "bg-gray-200 dark:bg-gray-700"
  }

  // Helper function to get badge color for measurement type
  const getMeasurementBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      UV_PL: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      UV_PR: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      IR_PL: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
      IR_EL: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      MBE_GROWTH: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    }

    return colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/samples">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          {sample.identifier} - {sample.name}
        </h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sample Information</CardTitle>
            <CardDescription>Basic details about this sample</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Growth Date</dt>
                <dd>{sample.growthDate.toLocaleDateString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Substrate</dt>
                <dd>
                  <Badge variant="outline">{sample.substrate}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Grower</dt>
                <dd>{sample.grower}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                <dd>{sample.createdAt.toLocaleDateString()}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                <dd className="mt-1">{sample.description}</dd>
              </div>
            </dl>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm">
                <Edit className="mr-2 h-4 w-4" /> Edit Sample
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Recipe</CardTitle>
            <CardDescription>MBE recipe: {sample.recipe.recipeName}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {sample.recipe.layers
                .filter((layer) => !layer.isSubstrate)
                .map((layer, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between rounded p-2 ${getLayerColor(layer.material)}`}
                    style={{
                      height: `${Math.max(36, layer.thickness / 100)}px`,
                    }}
                  >
                    <div className="font-medium">{layer.material}</div>
                    <div className="text-sm">
                      {layer.thickness}Å - {layer.purpose}
                      {layer.composition && ` (${layer.composition})`}
                    </div>
                  </div>
                ))}
              <div className="flex items-center justify-between rounded bg-gray-100 p-2 dark:bg-gray-800">
                <div className="font-medium">{sample.substrate}</div>
                <div className="text-sm">Substrate</div>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/recipes/${sample.recipe.id}`}>View Full Recipe</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="measurements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="measurements">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Measurements</CardTitle>
                <CardDescription>Data collected for this sample</CardDescription>
              </div>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Measurement
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sample.measurements.map((measurement) => (
                    <TableRow key={measurement.id}>
                      <TableCell>
                        <Badge className={getMeasurementBadgeColor(measurement.measurementType)}>
                          {measurement.measurementType.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>{measurement.title}</TableCell>
                      <TableCell>{measurement.createdAt.toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/measurements/${measurement.id}`}>View</Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/visualization/${measurement.id}`}>Visualize</Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata">
          <Card>
            <CardHeader>
              <CardTitle>Sample Metadata</CardTitle>
              <CardDescription>Additional properties and attributes</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4">
                {Object.entries(sample.metadata).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm font-medium text-muted-foreground">{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Sample History</CardTitle>
              <CardDescription>Activity log for this sample</CardDescription>
            </CardHeader>
            <CardContent>
              <p>History log would be displayed here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

