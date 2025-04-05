"use client"

import { useMemo } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Measurement } from "@/types/measurement"

interface StatisticalAnalysisProps {
  measurements: Measurement[]
}

export function StatisticalAnalysis({ measurements }: StatisticalAnalysisProps) {
  // Calculate statistics for each measurement
  const statistics = useMemo(() => {
    return measurements.map((measurement) => {
      if (!measurement.data || !Array.isArray(measurement.data) || measurement.data.length === 0) {
        return {
          id: measurement.id,
          name: measurement.name || measurement.id,
          type: measurement.type,
          stats: null,
        }
      }

      // Get the y values
      const dataPoint = measurement.data[0]
      const keys = Object.keys(dataPoint)
      const yKey = keys[1] || "y" // Assume second key is y value

      const yValues = measurement.data.map((point) => Number(point[yKey])).filter((y) => !isNaN(y))

      if (yValues.length === 0) {
        return {
          id: measurement.id,
          name: measurement.name || measurement.id,
          type: measurement.type,
          stats: null,
        }
      }

      // Calculate basic statistics
      const min = Math.min(...yValues)
      const max = Math.max(...yValues)
      const sum = yValues.reduce((acc, val) => acc + val, 0)
      const mean = sum / yValues.length

      // Calculate median
      const sortedValues = [...yValues].sort((a, b) => a - b)
      const middle = Math.floor(sortedValues.length / 2)
      const median =
        sortedValues.length % 2 === 0 ? (sortedValues[middle - 1] + sortedValues[middle]) / 2 : sortedValues[middle]

      // Calculate standard deviation
      const squaredDiffs = yValues.map((value) => Math.pow(value - mean, 2))
      const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / yValues.length
      const stdDev = Math.sqrt(variance)

      // Calculate quartiles
      const q1Index = Math.floor(sortedValues.length * 0.25)
      const q3Index = Math.floor(sortedValues.length * 0.75)
      const q1 = sortedValues[q1Index]
      const q3 = sortedValues[q3Index]
      const iqr = q3 - q1

      // Calculate skewness
      const cubedDiffs = yValues.map((value) => Math.pow(value - mean, 3))
      const sumCubedDiffs = cubedDiffs.reduce((acc, val) => acc + val, 0)
      const skewness = sumCubedDiffs / (yValues.length * Math.pow(stdDev, 3))

      // Calculate kurtosis
      const fourthPowerDiffs = yValues.map((value) => Math.pow(value - mean, 4))
      const sumFourthPowerDiffs = fourthPowerDiffs.reduce((acc, val) => acc + val, 0)
      const kurtosis = sumFourthPowerDiffs / (yValues.length * Math.pow(stdDev, 4)) - 3

      // Calculate peak properties if this is spectral data
      let peakProperties = null
      if (measurement.type === "xrd" || measurement.type === "pl" || measurement.type === "raman") {
        // Find the highest peak
        const peakIndex = yValues.indexOf(max)

        // Get the x value at the peak
        const xKey = keys[0] || "x"
        const peakPosition = Number(measurement.data[peakIndex][xKey])

        // Calculate FWHM (Full Width at Half Maximum)
        const halfMax = (max - min) / 2 + min

        // Find points closest to half max on both sides of peak
        let leftIndex = peakIndex
        while (leftIndex > 0 && yValues[leftIndex] > halfMax) {
          leftIndex--
        }

        let rightIndex = peakIndex
        while (rightIndex < yValues.length - 1 && yValues[rightIndex] > halfMax) {
          rightIndex++
        }

        // Get x values at half max
        const leftX = Number(measurement.data[leftIndex][xKey])
        const rightX = Number(measurement.data[rightIndex][xKey])

        // Calculate FWHM
        const fwhm = Math.abs(rightX - leftX)

        peakProperties = {
          peakPosition,
          peakIntensity: max,
          fwhm,
          leftHalfMaxX: leftX,
          rightHalfMaxX: rightX,
        }
      }

      return {
        id: measurement.id,
        name: measurement.name || measurement.id,
        type: measurement.type,
        stats: {
          count: yValues.length,
          min,
          max,
          range: max - min,
          sum,
          mean,
          median,
          stdDev,
          variance,
          q1,
          q3,
          iqr,
          skewness,
          kurtosis,
          peakProperties,
        },
      }
    })
  }, [measurements])

  // Calculate correlations between measurements
  const correlations = useMemo(() => {
    if (measurements.length < 2) return []

    const correlationResults = []

    // For each pair of measurements
    for (let i = 0; i < measurements.length; i++) {
      for (let j = i + 1; j < measurements.length; j++) {
        const measurement1 = measurements[i]
        const measurement2 = measurements[j]

        if (
          !measurement1.data ||
          !measurement2.data ||
          !Array.isArray(measurement1.data) ||
          !Array.isArray(measurement2.data) ||
          measurement1.data.length === 0 ||
          measurement2.data.length === 0
        ) {
          continue
        }

        // Get the keys
        const keys1 = Object.keys(measurement1.data[0])
        const keys2 = Object.keys(measurement2.data[0])

        const xKey1 = keys1[0] || "x"
        const yKey1 = keys1[1] || "y"
        const xKey2 = keys2[0] || "x"
        const yKey2 = keys2[1] || "y"

        // Get common x values
        const xValues1 = measurement1.data.map((point) => Number(point[xKey1]))
        const xValues2 = measurement2.data.map((point) => Number(point[xKey2]))

        // Find overlapping x range
        const minX1 = Math.min(...xValues1)
        const maxX1 = Math.max(...xValues1)
        const minX2 = Math.min(...xValues2)
        const maxX2 = Math.max(...xValues2)

        const overlapStart = Math.max(minX1, minX2)
        const overlapEnd = Math.min(maxX1, maxX2)

        if (overlapStart >= overlapEnd) {
          // No overlap
          continue
        }

        // Filter data to overlapping range and interpolate to common x values
        const commonXValues = []
        for (let x = overlapStart; x <= overlapEnd; x += (overlapEnd - overlapStart) / 100) {
          commonXValues.push(x)
        }

        // Interpolate y values for both measurements
        const interpolatedY1 = commonXValues.map((x) => {
          // Find closest points
          const index = xValues1.findIndex((val) => val >= x)
          if (index <= 0) return Number(measurement1.data[0][yKey1])
          if (index >= xValues1.length) return Number(measurement1.data[xValues1.length - 1][yKey1])

          // Linear interpolation
          const x0 = xValues1[index - 1]
          const x1 = xValues1[index]
          const y0 = Number(measurement1.data[index - 1][yKey1])
          const y1 = Number(measurement1.data[index][yKey1])

          return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
        })

        const interpolatedY2 = commonXValues.map((x) => {
          // Find closest points
          const index = xValues2.findIndex((val) => val >= x)
          if (index <= 0) return Number(measurement2.data[0][yKey2])
          if (index >= xValues2.length) return Number(measurement2.data[xValues2.length - 1][yKey2])

          // Linear interpolation
          const x0 = xValues2[index - 1]
          const x1 = xValues2[index]
          const y0 = Number(measurement2.data[index - 1][yKey2])
          const y1 = Number(measurement2.data[index][yKey2])

          return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
        })

        // Calculate Pearson correlation coefficient
        const mean1 = interpolatedY1.reduce((sum, val) => sum + val, 0) / interpolatedY1.length
        const mean2 = interpolatedY2.reduce((sum, val) => sum + val, 0) / interpolatedY2.length

        let numerator = 0
        let denominator1 = 0
        let denominator2 = 0

        for (let k = 0; k < interpolatedY1.length; k++) {
          const diff1 = interpolatedY1[k] - mean1
          const diff2 = interpolatedY2[k] - mean2

          numerator += diff1 * diff2
          denominator1 += diff1 * diff1
          denominator2 += diff2 * diff2
        }

        const correlation = numerator / (Math.sqrt(denominator1) * Math.sqrt(denominator2))

        correlationResults.push({
          measurement1: measurement1.name || measurement1.id,
          measurement2: measurement2.name || measurement2.id,
          correlation,
          overlapStart,
          overlapEnd,
          pointsCount: interpolatedY1.length,
        })
      }
    }

    return correlationResults
  }, [measurements])

  return (
    <Tabs defaultValue="basic">
      <TabsList>
        <TabsTrigger value="basic">Basic Statistics</TabsTrigger>
        <TabsTrigger value="advanced">Advanced Statistics</TabsTrigger>
        <TabsTrigger value="correlations">Correlations</TabsTrigger>
        {measurements.some((m) => m.type === "xrd" || m.type === "pl" || m.type === "raman") && (
          <TabsTrigger value="peaks">Peak Analysis</TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="basic" className="pt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Measurement</TableHead>
              <TableHead>Min</TableHead>
              <TableHead>Max</TableHead>
              <TableHead>Mean</TableHead>
              <TableHead>Median</TableHead>
              <TableHead>Std Dev</TableHead>
              <TableHead>Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statistics.map((stat) => (
              <TableRow key={stat.id}>
                <TableCell>{stat.name}</TableCell>
                <TableCell>{stat.stats?.min.toFixed(4) || "N/A"}</TableCell>
                <TableCell>{stat.stats?.max.toFixed(4) || "N/A"}</TableCell>
                <TableCell>{stat.stats?.mean.toFixed(4) || "N/A"}</TableCell>
                <TableCell>{stat.stats?.median.toFixed(4) || "N/A"}</TableCell>
                <TableCell>{stat.stats?.stdDev.toFixed(4) || "N/A"}</TableCell>
                <TableCell>{stat.stats?.count || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="advanced" className="pt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Measurement</TableHead>
              <TableHead>Q1</TableHead>
              <TableHead>Q3</TableHead>
              <TableHead>IQR</TableHead>
              <TableHead>Skewness</TableHead>
              <TableHead>Kurtosis</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {statistics.map((stat) => (
              <TableRow key={stat.id}>
                <TableCell>{stat.name}</TableCell>
                <TableCell>{stat.stats?.q1.toFixed(4) || "N/A"}</TableCell>
                <TableCell>{stat.stats?.q3.toFixed(4) || "N/A"}</TableCell>
                <TableCell>{stat.stats?.iqr.toFixed(4) || "N/A"}</TableCell>
                <TableCell>{stat.stats?.skewness.toFixed(4) || "N/A"}</TableCell>
                <TableCell>{stat.stats?.kurtosis.toFixed(4) || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="correlations" className="pt-4">
        {correlations.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No correlation data available. Select at least two measurements with overlapping x ranges.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Measurement 1</TableHead>
                <TableHead>Measurement 2</TableHead>
                <TableHead>Correlation</TableHead>
                <TableHead>Overlap Range</TableHead>
                <TableHead>Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {correlations.map((corr, index) => (
                <TableRow key={index}>
                  <TableCell>{corr.measurement1}</TableCell>
                  <TableCell>{corr.measurement2}</TableCell>
                  <TableCell>{corr.correlation.toFixed(4)}</TableCell>
                  <TableCell>{`${corr.overlapStart.toFixed(2)} - ${corr.overlapEnd.toFixed(2)}`}</TableCell>
                  <TableCell>{corr.pointsCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TabsContent>

      {measurements.some((m) => m.type === "xrd" || m.type === "pl" || m.type === "raman") && (
        <TabsContent value="peaks" className="pt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Measurement</TableHead>
                <TableHead>Peak Position</TableHead>
                <TableHead>Peak Intensity</TableHead>
                <TableHead>FWHM</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statistics
                .filter((stat) => stat.stats?.peakProperties)
                .map((stat) => (
                  <TableRow key={stat.id}>
                    <TableCell>{stat.name}</TableCell>
                    <TableCell>{stat.stats?.peakProperties?.peakPosition.toFixed(4) || "N/A"}</TableCell>
                    <TableCell>{stat.stats?.peakProperties?.peakIntensity.toFixed(4) || "N/A"}</TableCell>
                    <TableCell>{stat.stats?.peakProperties?.fwhm.toFixed(4) || "N/A"}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TabsContent>
      )}
    </Tabs>
  )
}

