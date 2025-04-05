"use client"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatDate } from "@/lib/utils"
import { Eye, Trash2 } from "lucide-react"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"

interface MeasurementsTableProps {
  measurements: any[]
  isLoading?: boolean
  onDelete?: (id: string) => void
}

export function MeasurementsTable({ measurements, isLoading = false, onDelete }: MeasurementsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Sample</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-24" />
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Skeleton className="h-9 w-9" />
                    <Skeleton className="h-9 w-9" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Sample</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {measurements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No measurements found.
              </TableCell>
            </TableRow>
          ) : (
            measurements.map((measurement) => (
              <TableRow key={measurement.id}>
                <TableCell className="font-medium">{measurement.name}</TableCell>
                <TableCell>{measurement.type}</TableCell>
                <TableCell>{measurement.sampleName || measurement.sampleId || "N/A"}</TableCell>
                <TableCell>{formatDate(measurement.date)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Link href={`/measurements/${measurement.id}`}>
                      <Button size="icon" variant="outline">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View</span>
                      </Button>
                    </Link>
                    {onDelete && (
                      <Button size="icon" variant="outline" onClick={() => onDelete(measurement.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

