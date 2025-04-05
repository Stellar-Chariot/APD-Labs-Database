"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface DataTableProps {
  data: Record<string, any>[]
}

export function DataTable({ data }: DataTableProps) {
  // Initialize with empty string instead of undefined
  const [searchTerm, setSearchTerm] = useState("")

  if (!data || data.length === 0) {
    return <div className="text-center py-4">No data available</div>
  }

  // Get all unique keys from the data
  const allKeys = Array.from(new Set(data.flatMap((item) => Object.keys(item))))

  // Filter data based on search term
  const filteredData = searchTerm
    ? data.filter((item) =>
        Object.values(item).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
      )
    : data

  // Limit to first 100 rows for performance
  const displayData = filteredData.slice(0, 100)

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search data..."
        value={searchTerm} // This is now guaranteed to be a string, never undefined
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm"
      />

      {filteredData.length > 100 && (
        <div className="text-sm text-muted-foreground">Showing first 100 of {filteredData.length} matching rows</div>
      )}

      <div className="border rounded-md overflow-auto max-h-[500px]">
        <Table>
          <TableHeader>
            <TableRow>
              {allKeys.map((key) => (
                <TableHead key={key}>{key}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {allKeys.map((key) => (
                  <TableCell key={`${rowIndex}-${key}`}>{row[key] !== undefined ? String(row[key]) : ""}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

