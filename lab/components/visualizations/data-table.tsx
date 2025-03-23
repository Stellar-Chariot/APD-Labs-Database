"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import type { DataPoint, ChartConfig } from "./chart-types"

interface DataTableProps {
  data: DataPoint[]
  config: ChartConfig
  maxRows?: number
  onExport?: () => void
}

export function DataTable({ data, config, maxRows = 10, onExport }: DataTableProps) {
  // Limit the number of rows to display
  const displayData = maxRows ? data.slice(0, maxRows) : data

  return (
    <div className="space-y-4">
      <div className="border rounded-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Object.keys(displayData[0] || {}).map((key) => (
                <th
                  key={key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.map((point, index) => (
              <tr key={index}>
                {Object.entries(point).map(([key, value]) => (
                  <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {typeof value === "number" ? value.toFixed(2) : String(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {displayData.length} of {data.length} rows
        </div>
        {onExport && (
          <Button variant="outline" size="sm" onClick={onExport}>
            <Download className="mr-2 h-4 w-4" /> Export Full Data
          </Button>
        )}
      </div>
    </div>
  )
}

