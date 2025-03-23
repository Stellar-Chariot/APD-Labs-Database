// Ensure the HTML chart component is properly implemented

import type { DataPoint, ChartConfig } from "./chart-types"

interface HtmlChartProps {
  data: DataPoint[] | DataPoint[][]
  config: ChartConfig
  datasetLabels?: string[]
}

export function HtmlChart({ data, config, datasetLabels = [] }: HtmlChartProps) {
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

  // Chart dimensions
  const width = 100
  const height = 50

  // Colors for datasets
  const colors = [
    "#2563eb", // blue
    "#dc2626", // red
    "#16a34a", // green
    "#9333ea", // purple
    "#ea580c", // orange
    "#0891b2", // cyan
  ]

  return (
    <div className="space-y-2">
      <div className="text-center font-medium text-sm">{config.title}</div>
      <div className="relative h-[50px]">
        {datasets.map((dataset, datasetIndex) => (
          <div
            key={datasetIndex}
            className="absolute inset-0"
            style={{
              clipPath: `polygon(${dataset
                .map((point) => {
                  const x = ((point[config.xAxis] - xMin) / (xMax - xMin)) * width
                  const y = height - ((point[config.yAxis] - yMin) / (yMax - yMin)) * height
                  return `${x}% ${y}%`
                })
                .join(", ")})`,
              borderTop: `2px solid ${colors[datasetIndex % colors.length]}`,
            }}
          />
        ))}
      </div>
      {config.showLegend && isMultipleDatasets && (
        <div className="flex flex-wrap justify-center gap-4 text-xs">
          {datasets.map((_, index) => (
            <div key={index} className="flex items-center">
              <div className="w-3 h-3 mr-1" style={{ backgroundColor: colors[index % colors.length] }} />
              <span>{datasetLabels[index] || `Dataset ${index + 1}`}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

