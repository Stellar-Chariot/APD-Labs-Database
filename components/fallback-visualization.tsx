"use client"

import { useRef, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { Measurement } from "@/types/measurement"

interface FallbackVisualizationProps {
  measurements: Measurement[]
  colorScheme?: string
  showLegend?: boolean
}

export function FallbackVisualization({
  measurements,
  colorScheme = "default",
  showLegend = true,
}: FallbackVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeTab, setActiveTab] = useState<string>("canvas")
  const [error, setError] = useState<string | null>(null)

  // Color schemes
  const colorSchemes: Record<string, string[]> = {
    default: ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"],
    categorical: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f"],
    sequential: ["#08519c", "#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#deebf7", "#f7fbff"],
    diverging: ["#d73027", "#f46d43", "#fdae61", "#fee090", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4"],
  }

  const colors = colorSchemes[colorScheme] || colorSchemes.default

  // Extract data for visualization
  const processedData = measurements.map((measurement, index) => {
    // Check if measurement has data
    if (!measurement.data || !Array.isArray(measurement.data) || measurement.data.length === 0) {
      return {
        id: measurement.id,
        name: measurement.name || measurement.id,
        color: colors[index % colors.length],
        data: [],
      }
    }

    // Get the first data point to determine keys
    const firstPoint = measurement.data[0]
    const keys = Object.keys(firstPoint)

    // Use the first key as x and second as y
    const xKey = keys[0] // Usually 'wavelength', 'angle', etc.
    const yKey = keys[1] // Usually 'intensity', etc.

    // Extract x and y values
    const data = measurement.data
      .map((point) => ({
        x: Number(point[xKey]),
        y: Number(point[yKey]),
        original: point,
      }))
      .filter((point) => !isNaN(point.x) && !isNaN(point.y))

    return {
      id: measurement.id,
      name: measurement.name || measurement.id,
      color: colors[index % colors.length],
      data,
      xKey,
      yKey,
    }
  })

  // Draw the chart on canvas
  useEffect(() => {
    if (!canvasRef.current || activeTab !== "canvas") return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    try {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Check if we have data to display
      const hasData = processedData.some((series) => series.data.length > 0)
      if (!hasData) {
        setError("No data available for visualization")
        return
      }

      // Find min and max values for scaling
      let xMin = Number.POSITIVE_INFINITY
      let xMax = Number.NEGATIVE_INFINITY
      let yMin = Number.POSITIVE_INFINITY
      let yMax = Number.NEGATIVE_INFINITY

      processedData.forEach((series) => {
        series.data.forEach((point) => {
          xMin = Math.min(xMin, point.x)
          xMax = Math.max(xMax, point.x)
          yMin = Math.min(yMin, point.y)
          yMax = Math.max(yMax, point.y)
        })
      })

      // Add padding
      const xPadding = (xMax - xMin) * 0.05
      const yPadding = (yMax - yMin) * 0.05

      xMin -= xPadding
      xMax += xPadding
      yMin -= yPadding
      yMax += yPadding

      // Set margins
      const margin = { top: 20, right: 20, bottom: 30, left: 40 }
      const width = canvas.width - margin.left - margin.right
      const height = canvas.height - margin.top - margin.bottom

      // Draw axes
      ctx.beginPath()
      ctx.strokeStyle = "#ccc"
      ctx.lineWidth = 1

      // X-axis
      ctx.moveTo(margin.left, canvas.height - margin.bottom)
      ctx.lineTo(canvas.width - margin.right, canvas.height - margin.bottom)

      // Y-axis
      ctx.moveTo(margin.left, margin.top)
      ctx.lineTo(margin.left, canvas.height - margin.bottom)

      ctx.stroke()

      // Draw grid lines
      ctx.beginPath()
      ctx.strokeStyle = "#eee"
      ctx.lineWidth = 0.5

      // X grid lines (5 lines)
      for (let i = 1; i <= 5; i++) {
        const x = margin.left + (width * i) / 5
        ctx.moveTo(x, margin.top)
        ctx.lineTo(x, canvas.height - margin.bottom)
      }

      // Y grid lines (5 lines)
      for (let i = 1; i <= 5; i++) {
        const y = margin.top + (height * (5 - i)) / 5
        ctx.moveTo(margin.left, y)
        ctx.lineTo(canvas.width - margin.right, y)
      }

      ctx.stroke()

      // Draw axis labels
      ctx.fillStyle = "#666"
      ctx.font = "10px Arial"
      ctx.textAlign = "center"

      // X-axis labels (5 labels)
      for (let i = 0; i <= 5; i++) {
        const value = xMin + ((xMax - xMin) * i) / 5
        const x = margin.left + (width * i) / 5
        ctx.fillText(value.toFixed(1), x, canvas.height - margin.bottom + 15)
      }

      // Y-axis labels (5 labels)
      ctx.textAlign = "right"
      for (let i = 0; i <= 5; i++) {
        const value = yMin + ((yMax - yMin) * i) / 5
        const y = canvas.height - margin.bottom - (height * i) / 5
        ctx.fillText(value.toFixed(1), margin.left - 5, y + 3)
      }

      // Draw data series
      processedData.forEach((series) => {
        if (series.data.length === 0) return

        ctx.beginPath()
        ctx.strokeStyle = series.color
        ctx.lineWidth = 2

        // Scale the first point
        const firstPoint = series.data[0]
        const x1 = margin.left + ((firstPoint.x - xMin) / (xMax - xMin)) * width
        const y1 = canvas.height - margin.bottom - ((firstPoint.y - yMin) / (yMax - yMin)) * height

        ctx.moveTo(x1, y1)

        // Draw lines between points
        for (let i = 1; i < series.data.length; i++) {
          const point = series.data[i]
          const x = margin.left + ((point.x - xMin) / (xMax - xMin)) * width
          const y = canvas.height - margin.bottom - ((point.y - yMin) / (yMax - yMin)) * height

          ctx.lineTo(x, y)
        }

        ctx.stroke()
      })

      // Draw legend if enabled
      if (showLegend) {
        const legendX = canvas.width - margin.right - 100
        const legendY = margin.top + 20

        processedData.forEach((series, index) => {
          const y = legendY + index * 20

          // Draw color box
          ctx.fillStyle = series.color
          ctx.fillRect(legendX, y - 8, 12, 12)

          // Draw series name
          ctx.fillStyle = "#333"
          ctx.textAlign = "left"
          ctx.fillText(series.name, legendX + 20, y)
        })
      }

      setError(null)
    } catch (err) {
      console.error("Error rendering canvas visualization:", err)
      setError(err instanceof Error ? err.message : "Failed to render visualization")
    }
  }, [processedData, activeTab, showLegend, colorScheme])

  // Prepare data for table view
  const tableData = processedData.flatMap((series) => {
    if (!series.data.length) return []

    return series.data.map((point) => ({
      series: series.name,
      x: point.x,
      y: point.y,
      ...point.original,
    }))
  })

  // Sort table data by x value
  tableData.sort((a, b) => a.x - b.x)

  // Get column headers for table
  const tableColumns = tableData.length > 0 ? Object.keys(tableData[0]).filter((key) => key !== "original") : []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Measurement Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="canvas" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="canvas">Chart View</TabsTrigger>
            <TabsTrigger value="table">Table View</TabsTrigger>
          </TabsList>

          <TabsContent value="canvas">
            {error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Visualization Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <div className="relative w-full h-[400px] border rounded-md">
                <canvas ref={canvasRef} width={800} height={400} className="w-full h-full" />
              </div>
            )}
          </TabsContent>

          <TabsContent value="table">
            {tableData.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Data</AlertTitle>
                <AlertDescription>No data available for display.</AlertDescription>
              </Alert>
            ) : (
              <div className="border rounded-md overflow-auto max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {tableColumns.map((column) => (
                        <TableHead key={column}>{column}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((row, index) => (
                      <TableRow key={index}>
                        {tableColumns.map((column) => (
                          <TableCell key={column}>
                            {typeof row[column] === "number" ? Number(row[column]).toFixed(4) : String(row[column])}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

