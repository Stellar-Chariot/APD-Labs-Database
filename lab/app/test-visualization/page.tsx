"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import MeasurementVisualization from "@/components/measurement-visualization"
import { useState } from "react"

export default function TestVisualizationPage() {
  const [measurementId, setMeasurementId] = useState("m1")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Test Visualization</h1>
        <p className="text-muted-foreground">Testing the measurement visualization with mock data</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visualization Test</CardTitle>
          <CardDescription>This page demonstrates the visualization component with mock data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This visualization uses mock data from our data service to simulate real backend data. You can test
            different measurements to see how the visualization adapts.
          </p>

          <p className="text-sm text-muted-foreground mb-4">
            <strong>Try the comparison feature:</strong> Go to the "Compare" tab and select other measurements to
            compare with the current one. Then click "Generate Comparison" to see multiple datasets visualized together.
          </p>

          <div className="flex gap-2 mb-4">
            <Button variant={measurementId === "m1" ? "default" : "outline"} onClick={() => setMeasurementId("m1")}>
              UV PL (Room Temp)
            </Button>
            <Button variant={measurementId === "m2" ? "default" : "outline"} onClick={() => setMeasurementId("m2")}>
              UV PR (300K)
            </Button>
            <Button variant={measurementId === "m3" ? "default" : "outline"} onClick={() => setMeasurementId("m3")}>
              IR PL (77K)
            </Button>
          </div>

          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
        </CardContent>
      </Card>

      <MeasurementVisualization id={measurementId} />
    </div>
  )
}

