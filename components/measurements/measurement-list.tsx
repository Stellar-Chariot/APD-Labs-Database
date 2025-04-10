"use client"

import { useState } from "react"
import { getMeasurements } from "@/lib/actions"
import { useQuery } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"

export function MeasurementList() {
  const [searchTerm, setSearchTerm] = useState("")

  const { data: measurements = [], isLoading } = useQuery({
    queryKey: ["measurements"],
    queryFn: getMeasurements,
  })

  const filteredMeasurements = measurements.filter((measurement) => {
    return (
      measurement.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      measurement.measurement_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      measurement.sample_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  return (
    <div className="space-y-4">
      <div>
        <Input
          placeholder="Search measurements..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Sample</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Operator</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredMeasurements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center">
                  No measurements found.
                </TableCell>
              </TableRow>
            ) : (
              filteredMeasurements.map((measurement) => (
                <TableRow key={measurement.id}>
                  <TableCell className="font-medium">{measurement.name}</TableCell>
                  <TableCell>{measurement.sample_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{measurement.measurement_type}</Badge>
                  </TableCell>
                  <TableCell>
                    {typeof measurement.measurement_date === "object"
                      ? new Date(measurement.measurement_date).toLocaleDateString()
                      : measurement.measurement_date}
                  </TableCell>
                  <TableCell>{measurement.operator}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/measurements/${measurement.id}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View measurement</span>
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
