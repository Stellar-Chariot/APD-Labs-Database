"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"

interface DataPoint {
  wavelength: number
  intensity: number
  normalized: number
  [key: string]: number
}

interface MeasurementDataTableProps {
  measurementId: string
  maxRows?: number
  onExport?: () => void
}

export function MeasurementDataTable({ measurementId, maxRows = 10, onExport }: MeasurementDataTableProps) {
  const [data, setData] = useState<DataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setError(null)

      try {
        // In a real implementation, this would fetch data from the backend
        // For now, we'll generate some mock data
        const mockData: DataPoint[] = []

        // Generate mock data points
        for (let i = 0; i < 100; i++) {
          const wavelength = 600 + i * 2.5

          // Simulate a Gaussian peak
          const peak1 = 100 * Math.exp(-Math.pow((wavelength - 720) / 15, 2))
          const peak2 = 30 * Math.exp(-Math.pow((wavelength - 680) / 10, 2))
          const noise = Math.random() * 5
          const intensity = peak1 + peak2 + noise

          mockData.push({
            wavelength,
            intensity,
            normalized: intensity / 100,
          })
        }

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500))

        setData(mockData)
      } catch (err) {
        console.error("Error loading measurement data:", err)
        setError("Failed to load measurement data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [measurementId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary mr-2" />
        <p className="text-muted-foreground">Loading data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        <p>{error}</p>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p>No data available for this measurement</p>
      </div>
    )
  }

  const displayData = data.slice(0, maxRows)

  return (
    <div>
      <div className="rounded-md border">
        <table className="min-w-full divide-y divide-border">
          <thead>
            <tr className="divide-x divide-border">
              <th className="px-4 py-3.5 text-left text-sm font-semibold">Wavelength (nm)</th>
              <th className="px-4 py-3.5 text-left text-sm font-semibold">Intensity (a.u.)</th>
              <th className="px-4 py-3.5 text-left text-sm font-semibold">Normalized</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {displayData.map((row, i) => (
              <tr key={i} className="divide-x divide-border">
                <td className="whitespace-nowrap px-4 py-2 text-sm">{row.wavelength.toFixed(1)}</td>
                <td className="whitespace-nowrap px-4 py-2 text-sm">{row.intensity.toFixed(2)}</td>
                <td className="whitespace-nowrap px-4 py-2 text-sm">{row.normalized.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.length > maxRows && (
        <p className="text-xs text-muted-foreground mt-2">
          Showing {maxRows} of {data.length} rows
        </p>
      )}

      {onExport && (
        <div className="mt-4 flex justify-end">
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" /> Download Full Dataset
          </Button>
        </div>
      )}
    </div>
  )
}

