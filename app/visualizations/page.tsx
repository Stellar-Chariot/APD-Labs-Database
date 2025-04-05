import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllMeasurements } from "@/services/measurement-service"
import { getSamples } from "@/services/sample-service"
import { VisualizationGrid } from "@/components/visualization-grid"

export default async function VisualizationsPage() {
  const measurements = await getAllMeasurements()
  const samples = await getSamples()

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Visualizations</h1>

      <Card>
        <CardHeader>
          <CardTitle>Data Visualizations</CardTitle>
          <CardDescription>Interactive visualizations of all measurement data.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading visualizations...</div>}>
            <VisualizationGrid measurements={measurements} samples={samples} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

