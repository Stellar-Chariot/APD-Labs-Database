"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
} from "recharts"
import { AlertCircle } from "lucide-react"
import { ErrorBoundary } from "@/components/error-boundary"
import type { Measurement } from "@/types/measurement"

interface DataPoint {
  [key: string]: number | string
}

interface DynamicVisualizationProps {
  data?: DataPoint[]
  type?: string
  metadata?: Record<string, any>
  measurement?: Measurement
  height?: number
  showControls?: boolean
}

// Create a wrapped component with error boundary
function DynamicVisualizationContent({
  data,
  type,
  metadata,
  measurement,
  height = 400,
  showControls = true,
}: DynamicVisualizationProps) {
  const [visualizationType, setVisualizationType] = useState<string>("auto")
  const [chartConfig, setChartConfig] = useState<{
    xKey: string
    yKeys: string[]
    chartType: "line" | "scatter" | "bar"
  } | null>(null)

  // Add a loading state to the component
  const [isLoading, setIsLoading] = useState(true)

  // Extract data from measurement if provided
  const visualizationData = data || measurement?.data || []
  const measurementType = type || measurement?.type || ""
  const visualizationMetadata = metadata || measurement?.metadata || {}

  // Add useEffect to simulate loading when the component mounts
  useEffect(() => {
    // Only simulate loading if we have data to display
    if (visualizationData && visualizationData.length > 0) {
      setIsLoading(true)
      // Short timeout to allow the UI to render before processing the data
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setIsLoading(false)
    }
  }, [visualizationData])

  useEffect(() => {
    if (!visualizationData || !Array.isArray(visualizationData) || visualizationData.length === 0) return

    // Determine chart configuration based on measurement type and data structure
    const config = determineChartConfig(visualizationData, measurementType, visualizationMetadata)
    setChartConfig(config)
  }, [visualizationData, measurementType, visualizationMetadata])

  const determineChartConfig = (data: DataPoint[], type: string, metadata?: Record<string, any>) => {
    // Safety check - make sure data is an array and has items
    if (!Array.isArray(data) || data.length === 0) {
      return null
    }

    // Get numeric keys from the first data point
    const firstPoint = data[0]
    if (!firstPoint || typeof firstPoint !== "object") {
      return null
    }

    const keys = Object.keys(firstPoint)
    const numericKeys = keys.filter((key) => {
      const value = firstPoint[key]
      return typeof value === "number" || !isNaN(Number(value))
    })

    if (numericKeys.length < 2) {
      return null // Not enough numeric data for visualization
    }

    // Default configuration
    let config = {
      xKey: numericKeys[0],
      yKeys: [numericKeys[1]],
      chartType: "line" as const,
    }

    // Customize based on measurement type
    switch (type?.toLowerCase() || "") {
      case "xrd":
        // XRD typically has 2-theta vs. intensity
        const thetaKey =
          numericKeys.find(
            (k) =>
              k.toLowerCase().includes("theta") ||
              k.toLowerCase().includes("angle") ||
              k.toLowerCase() === "2θ" ||
              k.toLowerCase() === "x" ||
              k.toLowerCase() === "angle",
          ) || numericKeys[0]

        const intensityKey =
          numericKeys.find(
            (k) =>
              k.toLowerCase().includes("intensity") ||
              k.toLowerCase().includes("counts") ||
              k.toLowerCase() === "y" ||
              k.toLowerCase() === "intensity",
          ) || numericKeys[1]

        config = {
          xKey: thetaKey,
          yKeys: [intensityKey],
          chartType: "line",
        }
        break

      case "pl":
        // PL typically has wavelength vs. intensity
        const wavelengthKey =
          numericKeys.find(
            (k) =>
              k.toLowerCase().includes("wavelength") ||
              k.toLowerCase().includes("energy") ||
              k.toLowerCase().includes("ev") ||
              k.toLowerCase() === "x" ||
              k.toLowerCase() === "wavelength",
          ) || numericKeys[0]

        const plIntensityKey =
          numericKeys.find(
            (k) =>
              k.toLowerCase().includes("intensity") ||
              k.toLowerCase().includes("counts") ||
              k.toLowerCase() === "y" ||
              k.toLowerCase() === "intensity",
          ) || numericKeys[1]

        config = {
          xKey: wavelengthKey,
          yKeys: [plIntensityKey],
          chartType: "line",
        }
        break

      case "hall":
        // Hall effect typically has multiple parameters
        config = {
          xKey: numericKeys[0],
          yKeys: numericKeys.slice(1, Math.min(3, numericKeys.length)),
          chartType: "scatter",
        }
        break

      case "afm":
        // AFM typically has position vs. height data
        config = {
          xKey: numericKeys[0],
          yKeys: [numericKeys[1]],
          chartType: "scatter",
        }
        break

      case "raman":
        // Raman typically has wavenumber vs. intensity
        config = {
          xKey: numericKeys[0],
          yKeys: [numericKeys[1]],
          chartType: "line",
        }
        break

      case "sem":
        // SEM doesn't typically have numeric data to plot
        // We would normally display the image
        return null

      case "tem":
        // TEM doesn't typically have numeric data to plot
        // We would normally display the image
        return null

      default:
        // For unknown types, try to make a reasonable guess
        if (data.length > 100) {
          config.chartType = "scatter"
        } else if (numericKeys.length > 2) {
          config.yKeys = numericKeys.slice(1, Math.min(3, numericKeys.length))
          config.chartType = "line"
        }
        break
    }

    return config
  }

  const renderVisualization = () => {
    // Check if data is valid
    if (!Array.isArray(visualizationData) || visualizationData.length === 0) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Data Available</AlertTitle>
          <AlertDescription>There is no data available for visualization.</AlertDescription>
        </Alert>
      )
    }

    if (!chartConfig) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Visualization Not Available</AlertTitle>
          <AlertDescription>Cannot generate visualization for this data type or structure.</AlertDescription>
        </Alert>
      )
    }

    // In the renderVisualization function, add a loading state check
    if (isLoading) {
      return (
        <div className="flex h-full w-full items-center justify-center p-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      )
    }

    const { xKey, yKeys, chartType } = chartConfig
    const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

    // Prepare data - ensure numeric values
    const preparedData = visualizationData.map((point) => {
      if (!point || typeof point !== "object") {
        return {} as DataPoint
      }

      const newPoint: DataPoint = { ...point }
      ;[xKey, ...yKeys].forEach((key) => {
        if (typeof newPoint[key] === "string") {
          newPoint[key] = Number.parseFloat(newPoint[key] as string) || 0
        }
      })
      return newPoint
    })

    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={preparedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} label={{ value: xKey, position: "insideBottomRight", offset: -10 }} />
              <YAxis label={{ value: yKeys.join(", "), angle: -90, position: "insideLeft" }} />
              <Tooltip />
              {yKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  dot={preparedData.length < 100}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <ScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} name={xKey} label={{ value: xKey, position: "insideBottomRight", offset: -10 }} />
              <YAxis
                dataKey={yKeys[0]}
                name={yKeys[0]}
                label={{ value: yKeys[0], angle: -90, position: "insideLeft" }}
              />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              {yKeys.map((key, index) => (
                <Scatter key={key} name={key} data={preparedData} fill={colors[index % colors.length]} />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        )

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={preparedData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={xKey} label={{ value: xKey, position: "insideBottomRight", offset: -10 }} />
              <YAxis label={{ value: yKeys.join(", "), angle: -90, position: "insideLeft" }} />
              <Tooltip />
              {yKeys.map((key, index) => (
                <Bar key={key} dataKey={key} fill={colors[index % colors.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )

      default:
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unsupported Visualization</AlertTitle>
            <AlertDescription>The selected visualization type is not supported.</AlertDescription>
          </Alert>
        )
    }
  }

  const visualizationTypes = ["auto", "line", "scatter", "bar"]

  if (!showControls) {
    return renderVisualization()
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue={visualizationType} onValueChange={setVisualizationType}>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Visualization</h3>
            <TabsList>
              {visualizationTypes.map((type) => (
                <TabsTrigger key={type} value={type} disabled={type !== "auto" && !chartConfig}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {visualizationTypes.map((type) => (
            <TabsContent key={type} value={type} className="mt-0">
              {renderVisualization()}
            </TabsContent>
          ))}
        </Tabs>

        {visualizationMetadata && Object.keys(visualizationMetadata).length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">Measurement Metadata</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(visualizationMetadata).map(([key, value]) => (
                <div key={key} className="flex">
                  <span className="font-medium mr-2">{key}:</span>
                  <span>{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Export the component wrapped in an error boundary
export function DynamicVisualization(props: DynamicVisualizationProps) {
  return (
    <ErrorBoundary
      fallback={
        <Card>
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Visualization Error</AlertTitle>
              <AlertDescription>
                There was an error rendering this visualization. The data format may be incompatible.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      }
    >
      <DynamicVisualizationContent {...props} />
    </ErrorBoundary>
  )
}

