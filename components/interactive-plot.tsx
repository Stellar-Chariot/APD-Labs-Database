"use client"

import type React from "react"

import { useState, useRef, useEffect, useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceArea,
  ReferenceLine,
} from "recharts"
import { Button } from "@/components/ui/button"
import { ZoomIn, RefreshCw, Crosshair, Move } from "lucide-react"
import type { Measurement } from "@/types/measurement"

interface InteractivePlotProps {
  measurements: Measurement[]
  chartType: "line" | "scatter" | "bar" | "area"
  colorScheme: string
  showLegend: boolean
  showGrid: boolean
  normalizeData: boolean
  smoothingFactor: number
}

export function InteractivePlot({
  measurements,
  chartType = "line",
  colorScheme = "default",
  showLegend = true,
  showGrid = true,
  normalizeData = false,
  smoothingFactor = 0,
}: InteractivePlotProps) {
  // State for zoom and pan
  const [left, setLeft] = useState<number | null>(null)
  const [right, setRight] = useState<number | null>(null)
  const [refAreaLeft, setRefAreaLeft] = useState<string | number | null>(null)
  const [refAreaRight, setRefAreaRight] = useState<string | number | null>(null)
  const [top, setTop] = useState<number | null>(null)
  const [bottom, setBottom] = useState<number | null>(null)
  const [animation, setAnimation] = useState(true)
  const [zoomMode, setZoomMode] = useState(true)
  const [panMode, setPanMode] = useState(false)
  const [crosshairMode, setCrosshairMode] = useState(false)
  const [crosshairValues, setCrosshairValues] = useState<{ x: number; y: number } | null>(null)

  // Refs for chart container and dimensions
  const chartRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const lastMousePosition = useRef({ x: 0, y: 0 })

  // Log measurements for debugging
  useEffect(() => {
    console.log("InteractivePlot received measurements:", measurements)

    // Check if measurements have data
    const measurementsWithData = measurements.filter((m) => m.data && Array.isArray(m.data) && m.data.length > 0)

    console.log(`${measurementsWithData.length} of ${measurements.length} measurements have data`)

    if (measurementsWithData.length > 0) {
      // Log the first data point of each measurement
      measurementsWithData.forEach((m) => {
        console.log(`Measurement ${m.id} first data point:`, m.data?.[0])
      })
    }
  }, [measurements])

  // Determine chart configuration based on data
  const { processedData, xKey, yKeys, xDomain, yDomain, colors } = useMemo(() => {
    // Default return value if no measurements or empty data
    const defaultReturn = {
      processedData: [],
      xKey: "wavelength",
      yKeys: [],
      xDomain: [0, 100],
      yDomain: [0, 1],
      colors: [],
    }

    if (!measurements || measurements.length === 0) {
      console.log("No measurements provided")
      return defaultReturn
    }

    // Get color scheme
    const colorSchemes: Record<string, string[]> = {
      default: ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"],
      categorical: ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f"],
      sequential: ["#08519c", "#3182bd", "#6baed6", "#9ecae1", "#c6dbef", "#deebf7", "#f7fbff"],
      diverging: ["#d73027", "#f46d43", "#fdae61", "#fee090", "#e0f3f8", "#abd9e9", "#74add1", "#4575b4"],
    }

    const selectedColors = colorSchemes[colorScheme] || colorSchemes.default

    // Check if any measurements have data
    const measurementsWithData = measurements.filter((m) => m.data && Array.isArray(m.data) && m.data.length > 0)

    if (measurementsWithData.length === 0) {
      console.log("No measurements have data")
      return defaultReturn
    }

    // SIMPLIFIED APPROACH: Use the raw data directly
    // We'll create a simple structure where each measurement is a separate line

    // Get the measurement names for y keys
    const yKeys = measurementsWithData.map((m) => m.name || m.id)

    // Find all x and y values to calculate domains
    const allXValues: number[] = []
    const allYValues: number[] = []

    // Process each measurement to extract x and y values
    measurementsWithData.forEach((measurement) => {
      if (!measurement.data || !Array.isArray(measurement.data)) return

      // Get the first data point to determine keys
      const firstPoint = measurement.data[0]
      if (!firstPoint) return

      const keys = Object.keys(firstPoint)
      if (keys.length < 2) return

      // Use the first key as x and second as y
      const xKeyFromData = keys[0] // Usually 'wavelength', 'angle', etc.
      const yKeyFromData = keys[1] // Usually 'intensity', etc.

      // Extract values for domain calculation
      measurement.data.forEach((point) => {
        const x = Number(point[xKeyFromData])
        const y = Number(point[yKeyFromData])

        if (!isNaN(x) && !isNaN(y)) {
          allXValues.push(x)
          allYValues.push(y)
        }
      })
    })

    // If no values were extracted, return default
    if (allXValues.length === 0 || allYValues.length === 0) {
      console.log("No valid data points found")
      return defaultReturn
    }

    // Calculate domains with some padding
    const xMin = Math.min(...allXValues)
    const xMax = Math.max(...allXValues)
    const yMin = Math.min(...allYValues)
    const yMax = Math.max(...allYValues)

    const xPadding = (xMax - xMin) * 0.05
    const yPadding = (yMax - yMin) * 0.05

    // Use the first measurement's data structure
    const firstMeasurement = measurementsWithData[0]
    const firstDataPoint = firstMeasurement.data[0]
    const xKeyFromData = Object.keys(firstDataPoint)[0]

    return {
      // Just use the raw data from each measurement
      processedData: measurementsWithData.map((m) => ({
        measurement: m,
        data: m.data,
      })),
      xKey: xKeyFromData,
      yKeys,
      xDomain: [xMin - xPadding, xMax + xPadding],
      yDomain: [yMin - yPadding, yMax + yPadding],
      colors: selectedColors,
    }
  }, [measurements, colorScheme, normalizeData, smoothingFactor])

  // Function to apply smoothing to data
  function applySmoothing(
    data: Record<string, any>[],
    xKey: string,
    factor: number,
    yKeys: string[],
  ): Record<string, any>[] {
    if (factor <= 0 || data.length <= 2) return data

    const windowSize = Math.min(Math.max(3, Math.floor(factor * 2) + 1), 21)
    const halfWindow = Math.floor(windowSize / 2)

    const smoothedData = [...data]

    // For each y key (measurement)
    yKeys.forEach((yKey) => {
      // Skip if this measurement doesn't have data
      if (!data.some((point) => point[yKey] !== undefined)) return

      // Apply moving average
      for (let i = 0; i < data.length; i++) {
        let sum = 0
        let count = 0

        for (let j = Math.max(0, i - halfWindow); j <= Math.min(data.length - 1, i + halfWindow); j++) {
          if (data[j][yKey] !== undefined) {
            sum += data[j][yKey]
            count++
          }
        }

        if (count > 0 && smoothedData[i][yKey] !== undefined) {
          smoothedData[i][yKey] = sum / count
        }
      }
    })

    return smoothedData
  }

  // Function to normalize data to 0-1 range
  function normalizeDataPoints(data: Record<string, any>[], xKey: string, yKeys: string[]): Record<string, any>[] {
    const normalizedData = [...data]

    // For each y key (measurement)
    yKeys.forEach((yKey) => {
      // Find min and max for this measurement
      const values = data.filter((point) => point[yKey] !== undefined).map((point) => point[yKey])

      if (values.length === 0) return

      const min = Math.min(...values)
      const max = Math.max(...values)
      const range = max - min

      // Normalize values
      if (range > 0) {
        for (let i = 0; i < data.length; i++) {
          if (normalizedData[i][yKey] !== undefined) {
            normalizedData[i][yKey] = (normalizedData[i][yKey] - min) / range
          }
        }
      }
    })

    return normalizedData
  }

  // Reset zoom
  const resetZoom = () => {
    setLeft(null)
    setRight(null)
    setTop(null)
    setBottom(null)
    setRefAreaLeft(null)
    setRefAreaRight(null)
    setAnimation(true)
  }

  // Handle zoom in
  const zoom = () => {
    if (refAreaLeft === refAreaRight || refAreaRight === null || refAreaLeft === null) {
      setRefAreaLeft(null)
      setRefAreaRight(null)
      return
    }

    // Ensure left is always less than right
    const [newLeft, newRight] = refAreaLeft > refAreaRight ? [refAreaRight, refAreaLeft] : [refAreaLeft, refAreaRight]

    setLeft(Number(newLeft))
    setRight(Number(newRight))
    setRefAreaLeft(null)
    setRefAreaRight(null)
    setAnimation(false)
  }

  // Handle mouse down for zoom selection
  const handleMouseDown = (e: React.MouseEvent<SVGGElement>) => {
    if (!zoomMode) return

    const { activeCoordinate } = e as any
    if (activeCoordinate) {
      setRefAreaLeft(activeCoordinate.x)
      setRefAreaRight(null)
    }
  }

  // Handle mouse move for zoom selection
  const handleMouseMove = (e: React.MouseEvent<SVGGElement>) => {
    if (!zoomMode || refAreaLeft === null) return

    const { activeCoordinate } = e as any
    if (activeCoordinate) {
      setRefAreaRight(activeCoordinate.x)
    }
  }

  // Handle mouse up for zoom selection
  const handleMouseUp = () => {
    if (!zoomMode || refAreaLeft === null || refAreaRight === null) {
      setRefAreaLeft(null)
      setRefAreaRight(null)
      return
    }

    zoom()
  }

  // Handle mouse leave for zoom selection
  const handleMouseLeave = () => {
    if (refAreaLeft !== null) {
      setRefAreaLeft(null)
      setRefAreaRight(null)
    }
  }

  // Handle pan mode
  useEffect(() => {
    if (!containerRef.current || !panMode) return

    const container = containerRef.current

    const handlePanMouseDown = (e: MouseEvent) => {
      if (!chartRef.current) return

      isDragging.current = true
      lastMousePosition.current = { x: e.clientX, y: e.clientY }
    }

    const handlePanMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !chartRef.current) return

      const deltaX = e.clientX - lastMousePosition.current.x
      const deltaY = e.clientY - lastMousePosition.current.y

      // Calculate pan amount based on current domain
      const xRange = right! - left!
      const yRange = bottom! - top!

      // Scale delta by chart dimensions
      const chartWidth = container.clientWidth
      const chartHeight = container.clientHeight

      const xDelta = (deltaX / chartWidth) * xRange
      const yDelta = (deltaY / chartHeight) * yRange

      setLeft((prev) => prev! - xDelta)
      setRight((prev) => prev! - xDelta)
      setTop((prev) => prev! + yDelta)
      setBottom((prev) => prev! + yDelta)

      lastMousePosition.current = { x: e.clientX, y: e.clientY }
    }

    const handlePanMouseUp = () => {
      isDragging.current = false
    }

    if (panMode) {
      container.addEventListener("mousedown", handlePanMouseDown)
      window.addEventListener("mousemove", handlePanMouseMove)
      window.addEventListener("mouseup", handlePanMouseUp)
    }

    return () => {
      container.removeEventListener("mousedown", handlePanMouseDown)
      window.removeEventListener("mousemove", handlePanMouseMove)
      window.removeEventListener("mouseup", handlePanMouseUp)
    }
  }, [panMode, left, right, top, bottom])

  // Handle crosshair mode
  const handleCrosshairMouseMove = (e: any) => {
    if (!crosshairMode) return

    const { activeCoordinate, activePayload } = e
    if (activeCoordinate && activePayload) {
      setCrosshairValues({
        x: activeCoordinate.x,
        y: activeCoordinate.y,
      })
    }
  }

  // Toggle modes
  const toggleZoomMode = () => {
    setZoomMode((prev) => !prev)
    setPanMode(false)
    setCrosshairMode(false)
  }

  const togglePanMode = () => {
    setPanMode((prev) => !prev)
    setZoomMode(false)
    setCrosshairMode(false)
  }

  const toggleCrosshairMode = () => {
    setCrosshairMode((prev) => !prev)
    setZoomMode(false)
    setPanMode(false)
  }

  // Render the appropriate chart type
  const renderChart = () => {
    // Safety check - if no data, show a message
    if (!processedData || processedData.length === 0) {
      console.error("No processed data available")
      return (
        <div className="flex h-64 w-full items-center justify-center text-muted-foreground">
          No data to display. Please select measurements with data to compare.
        </div>
      )
    }

    // Log the data that will be used for rendering
    console.log("Rendering chart with processed data:", processedData)

    // Set domains based on zoom state
    const xDomainProp = left !== null && right !== null ? [left, right] : xDomain
    const yDomainProp = top !== null && bottom !== null ? [bottom, top] : yDomain

    // For simplicity, we'll just use a LineChart for all data types
    switch (chartType) {
      case "line":
      default:
        return (
          <LineChart
            width={800}
            height={400}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            ref={chartRef}
          >
            {showGrid && <CartesianGrid strokeDasharray="3 3" />}
            <XAxis
              type="number"
              dataKey={xKey}
              domain={xDomainProp as [number, number]}
              allowDataOverflow
              label={{ value: xKey, position: "insideBottomRight", offset: -10 }}
            />
            <YAxis
              type="number"
              domain={yDomainProp as [number, number]}
              allowDataOverflow
              label={{ value: "Intensity", angle: -90, position: "insideLeft" }}
            />
            <Tooltip />
            {showLegend && <Legend />}

            {/* Render each measurement as a separate line */}
            {processedData.map((item, index) => {
              const measurement = item.measurement
              const measurementName = measurement.name || measurement.id
              const dataPoints = measurement.data

              // Get the keys from the first data point
              const firstPoint = dataPoints[0]
              const keys = Object.keys(firstPoint)
              const xKeyName = keys[0] // Usually 'wavelength'
              const yKeyName = keys[1] // Usually 'intensity'

              return (
                <Line
                  key={measurementName}
                  name={measurementName}
                  data={dataPoints}
                  dataKey={yKeyName}
                  xAxisId={0}
                  yAxisId={0}
                  type="monotone"
                  stroke={colors[index % colors.length]}
                  dot={dataPoints.length < 100}
                  isAnimationActive={animation}
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              )
            })}

            {refAreaLeft && refAreaRight && (
              <ReferenceArea x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} fill="#8884d8" fillOpacity={0.3} />
            )}
            {crosshairMode && crosshairValues && (
              <>
                <ReferenceLine x={crosshairValues.x} stroke="#666" strokeDasharray="3 3" />
                <ReferenceLine y={crosshairValues.y} stroke="#666" strokeDasharray="3 3" />
              </>
            )}
          </LineChart>
        )
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="absolute top-2 right-2 z-10 flex gap-1">
        <Button variant={zoomMode ? "default" : "outline"} size="sm" onClick={toggleZoomMode} title="Zoom Mode">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant={panMode ? "default" : "outline"} size="sm" onClick={togglePanMode} title="Pan Mode">
          <Move className="h-4 w-4" />
        </Button>
        <Button
          variant={crosshairMode ? "default" : "outline"}
          size="sm"
          onClick={toggleCrosshairMode}
          title="Crosshair Mode"
        >
          <Crosshair className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={resetZoom} title="Reset Zoom">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        {renderChart()}
      </ResponsiveContainer>
    </div>
  )
}

