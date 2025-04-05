"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { Measurement } from "@/types/measurement"

interface SimpleComparisonViewProps {
  measurements: Measurement[]
}

export function SimpleComparisonView({ measurements }: SimpleComparisonViewProps) {
  const [activeTab, setActiveTab] = useState("summary")

  // Early return if no measurements
  if (!measurements || measurements.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No data available</AlertTitle>
        <AlertDescription>Please select measurements to compare.</AlertDescription>
      </Alert>
    )
  }

  // Check if any measurements have data
  const measurementsWithData = measurements.filter((m) => m.data && Array.isArray(m.data) && m.data.length > 0)

  if (measurementsWithData.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No data available</AlertTitle>
        <AlertDescription>The selected measurements don't contain any data points.</AlertDescription>
      </Alert>
    )
  }

  // Extract basic information about each measurement
  const measurementInfo = measurements.map((m) => {
    // Get data point count
    const dataPointCount = m.data && Array.isArray(m.data) ? m.data.length : 0

    // Get first and last data point if available
    const firstPoint = dataPointCount > 0 ? m.data[0] : null
    const lastPoint = dataPointCount > 0 ? m.data[dataPointCount - 1] : null

    // Get min, max, avg values if data exists
    let minValue = Number.POSITIVE_INFINITY
    let maxValue = Number.NEGATIVE_INFINITY
    let sum = 0

    if (dataPointCount > 0) {
      // Get the keys from the first data point
      const keys = Object.keys(firstPoint)
      const yKey = keys.length > 1 ? keys[1] : null // Usually the second key is the y-value

      if (yKey) {
        m.data.forEach((point) => {
          const value = Number(point[yKey])
          if (!isNaN(value)) {
            minValue = Math.min(minValue, value)
            maxValue = Math.max(maxValue, value)
            sum += value
          }
        })
      }
    }

    const avgValue = dataPointCount > 0 ? sum / dataPointCount : 0

    // Extract measurement conditions for better display
    const temperature = m.metadata?.temperature ? `${m.metadata.temperature}K` : "N/A"
    const power = m.metadata?.power ? `${m.metadata.power}mW` : "N/A"
    const measurementType = m.metadata?.measurementType || "standard"

    return {
      id: m.id,
      name: m.name || m.id,
      type: m.type,
      date: new Date(m.date).toLocaleDateString(),
      dataPointCount,
      minValue: minValue !== Number.POSITIVE_INFINITY ? minValue.toFixed(4) : "N/A",
      maxValue: maxValue !== Number.NEGATIVE_INFINITY ? maxValue.toFixed(4) : "N/A",
      avgValue: dataPointCount > 0 ? avgValue.toFixed(4) : "N/A",
      temperature,
      power,
      measurementType,
      firstPoint,
      lastPoint,
    }
  })

  // Prepare data for raw data table
  const allDataPoints = []

  // Get all unique x values from all measurements
  const allXValues = new Set()
  measurements.forEach((m) => {
    if (m.data && Array.isArray(m.data) && m.data.length > 0) {
      const xKey = Object.keys(m.data[0])[0]
      m.data.forEach((point) => {
        if (point[xKey] !== undefined) {
          allXValues.add(Number(point[xKey]))
        }
      })
    }
  })

  // Sort x values
  const sortedXValues = Array.from(allXValues).sort((a, b) => Number(a) - Number(b))

  // Create data points for each x value
  sortedXValues.forEach((x) => {
    const dataPoint = { x }

    measurements.forEach((m) => {
      if (m.data && Array.isArray(m.data) && m.data.length > 0) {
        const xKey = Object.keys(m.data[0])[0]
        const yKey = Object.keys(m.data[0])[1]

        const point = m.data.find((p) => Number(p[xKey]) === Number(x))
        if (point) {
          dataPoint[m.name || m.id] = point[yKey]
        }
      }
    })

    allDataPoints.push(dataPoint)
  })

  // Determine if we have specialized measurements
  const hasPowerSeries = measurementInfo.some((m) => m.measurementType === "power-dependent")
  const hasTemperatureSeries = measurementInfo.some((m) => m.measurementType === "temperature-dependent")

  return (
    <Card>
      <CardHeader>
        <CardTitle>Measurement Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="rawData">Raw Data</TabsTrigger>
            {hasPowerSeries && <TabsTrigger value="powerSeries">Power Series</TabsTrigger>}
            {hasTemperatureSeries && <TabsTrigger value="temperatureSeries">Temperature Series</TabsTrigger>}
          </TabsList>

          <TabsContent value="summary">
            <div className="border rounded-md overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Measurement</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Temperature</TableHead>
                    <TableHead>Power</TableHead>
                    <TableHead>Data Points</TableHead>
                    <TableHead>Min Value</TableHead>
                    <TableHead>Max Value</TableHead>
                    <TableHead>Avg Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {measurementInfo.map((info) => (
                    <TableRow key={info.id}>
                      <TableCell className="font-medium">{info.name}</TableCell>
                      <TableCell>{info.type}</TableCell>
                      <TableCell>{info.date}</TableCell>
                      <TableCell>{info.temperature}</TableCell>
                      <TableCell>{info.power}</TableCell>
                      <TableCell>{info.dataPointCount}</TableCell>
                      <TableCell>{info.minValue}</TableCell>
                      <TableCell>{info.maxValue}</TableCell>
                      <TableCell>{info.avgValue}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="rawData">
            <div className="border rounded-md overflow-auto max-h-[500px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>X Value</TableHead>
                    {measurements.map((m) => (
                      <TableHead key={m.id}>{m.name || m.id}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allDataPoints.map((point, index) => (
                    <TableRow key={index}>
                      <TableCell>{Number(point.x).toFixed(4)}</TableCell>
                      {measurements.map((m) => (
                        <TableCell key={m.id}>
                          {point[m.name || m.id] !== undefined ? Number(point[m.name || m.id]).toFixed(4) : "-"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {hasPowerSeries && (
            <TabsContent value="powerSeries">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Power-Dependent Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  This table shows how the peak intensity and FWHM change with excitation power.
                </p>
                <div className="border rounded-md overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Power (mW)</TableHead>
                        <TableHead>Peak Intensity</TableHead>
                        <TableHead>FWHM (nm)</TableHead>
                        <TableHead>Peak Position (nm)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {measurementInfo
                        .filter((m) => m.measurementType === "power-dependent")
                        .sort((a, b) => Number(a.power.replace("mW", "")) - Number(b.power.replace("mW", "")))
                        .map((info) => {
                          const measurement = measurements.find((meas) => meas.id === info.id)
                          return (
                            <TableRow key={info.id}>
                              <TableCell>{info.power}</TableCell>
                              <TableCell>{info.maxValue}</TableCell>
                              <TableCell>{measurement?.metadata?.fwhm || "N/A"}</TableCell>
                              <TableCell>{measurement?.metadata?.peakWavelength || "N/A"}</TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          )}

          {hasTemperatureSeries && (
            <TabsContent value="temperatureSeries">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Temperature-Dependent Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  This table shows how the peak position, intensity, and FWHM change with temperature.
                </p>
                <div className="border rounded-md overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Temperature (K)</TableHead>
                        <TableHead>Peak Position (nm)</TableHead>
                        <TableHead>Peak Intensity</TableHead>
                        <TableHead>FWHM (nm)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {measurementInfo
                        .filter((m) => m.measurementType === "temperature-dependent")
                        .sort((a, b) => Number(a.temperature.replace("K", "")) - Number(b.temperature.replace("K", "")))
                        .map((info) => {
                          const measurement = measurements.find((meas) => meas.id === info.id)
                          return (
                            <TableRow key={info.id}>
                              <TableCell>{info.temperature}</TableCell>
                              <TableCell>{measurement?.metadata?.peakWavelength || "N/A"}</TableCell>
                              <TableCell>{info.maxValue}</TableCell>
                              <TableCell>{measurement?.metadata?.fwhm || "N/A"}</TableCell>
                            </TableRow>
                          )
                        })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}

