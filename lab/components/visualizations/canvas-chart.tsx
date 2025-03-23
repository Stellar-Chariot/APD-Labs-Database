"use client"

// Ensure the canvas chart component is properly implemented

import { useEffect, useRef } from "react"
import type { DataPoint, ChartConfig } from "./chart-types"

interface CanvasChartProps {
  data: DataPoint[] | DataPoint[][]
  config: ChartConfig
  datasetLabels?: string[]
}

export function CanvasChart({ data, config, datasetLabels = [] }: CanvasChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw chart
    drawChart(ctx, canvas.width, canvas.height, data, config, datasetLabels)
  }, [data, config, datasetLabels])

  return <canvas ref={canvasRef} className="w-full h-full" />
}

function drawChart(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  data: DataPoint[] | DataPoint[][],
  config: ChartConfig,
  datasetLabels: string[],
) {
  // Chart dimensions
  const padding = 40
  const chartWidth = width - 2 * padding
  const chartHeight = height - 2 * padding

  // Check if data is a single dataset or multiple datasets
  const isMultipleDatasets = Array.isArray(data[0])
  const datasets = isMultipleDatasets ? (data as DataPoint[][]) : [data as DataPoint[]]

  // Find min/max values across all datasets
  let xMin = Number.POSITIVE_INFINITY,
    xMax = Number.NEGATIVE_INFINITY,
    yMin = Number.POSITIVE_INFINITY,
    yMax = Number.NEGATIVE_INFINITY

  datasets.forEach((dataset) => {
    dataset.forEach((point) => {
      const x = point[config.xAxis]
      const y = point[config.yAxis]
      if (x < xMin) xMin = x
      if (x > xMax) xMax = x
      if (y < yMin) yMin = y
      if (y > yMax) yMax = y
    })
  })

  // Add some padding to the ranges
  const xRange = xMax - xMin
  const yRange = yMax - yMin
  xMin -= xRange * 0.05
  xMax += xRange * 0.05
  yMin -= yRange * 0.05
  yMax += yRange * 0.05

  // Draw axes
  ctx.strokeStyle = "#888"
  ctx.lineWidth = 1

  // X-axis
  ctx.beginPath()
  ctx.moveTo(padding, height - padding)
  ctx.lineTo(width - padding, height - padding)
  ctx.stroke()

  // Y-axis
  ctx.beginPath()
  ctx.moveTo(padding, padding)
  ctx.lineTo(padding, height - padding)
  ctx.stroke()

  // Draw grid
  ctx.strokeStyle = "#ddd"
  ctx.lineWidth = 0.5

  // Horizontal grid lines
  for (let i = 0; i <= 5; i++) {
    const y = padding + (chartHeight * i) / 5
    ctx.beginPath()
    ctx.moveTo(padding, y)
    ctx.lineTo(width - padding, y)
    ctx.stroke()
  }

  // Vertical grid lines
  for (let i = 0; i <= 5; i++) {
    const x = padding + (chartWidth * i) / 5
    ctx.beginPath()
    ctx.moveTo(x, padding)
    ctx.lineTo(x, height - padding)
    ctx.stroke()
  }

  // Draw axis labels
  ctx.fillStyle = "#666"
  ctx.font = "12px Arial"
  ctx.textAlign = "center"

  // X-axis labels
  for (let i = 0; i <= 5; i++) {
    const x = padding + (chartWidth * i) / 5
    const value = xMin + ((xMax - xMin) * i) / 5
    ctx.fillText(value.toFixed(1), x, height - padding + 20)
  }

  // Y-axis labels
  ctx.textAlign = "right"
  for (let i = 0; i <= 5; i++) {
    const y = height - padding - (chartHeight * i) / 5
    const value = yMin + ((yMax - yMin) * i) / 5
    ctx.fillText(value.toFixed(1), padding - 10, y + 4)
  }

  // Draw title
  ctx.fillStyle = "#333"
  ctx.font = "16px Arial"
  ctx.textAlign = "center"
  ctx.fillText(config.title, width / 2, padding / 2)

  // Draw data lines
  const colors = [
    "#2563eb", // blue
    "#dc2626", // red
    "#16a34a", // green
    "#9333ea", // purple
    "#ea580c", // orange
    "#0891b2", // cyan
  ]

  datasets.forEach((dataset, datasetIndex) => {
    const color = colors[datasetIndex % colors.length]

    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()

    dataset.forEach((point, pointIndex) => {
      const x = padding + ((point[config.xAxis] - xMin) / (xMax - xMin)) * chartWidth
      const y = height - padding - ((point[config.yAxis] - yMin) / (yMax - yMin)) * chartHeight

      if (pointIndex === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })

    ctx.stroke()
  })

  // Draw legend if enabled
  if (config.showLegend && isMultipleDatasets) {
    const legendX = width - padding - 150
    const legendY = padding + 20

    datasets.forEach((_, index) => {
      const y = legendY + index * 20
      const color = colors[index % colors.length]

      // Line
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(legendX, y)
      ctx.lineTo(legendX + 20, y)
      ctx.stroke()

      // Text
      ctx.fillStyle = "#333"
      ctx.textAlign = "left"
      ctx.fillText(datasetLabels[index] || `Dataset ${index + 1}`, legendX + 30, y + 4)
    })
  }
}

