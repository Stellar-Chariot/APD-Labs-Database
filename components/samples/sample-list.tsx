"use client"

import { useEffect, useState } from "react"
import { getSamples } from "@/lib/actions"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import Link from "next/link"

interface Sample {
  id: number
  name: string
  equipment_code: string
  year: string
  month: string
  day: string
  material: string
  sample_identifier: string
  description: string
  created_at: string
}

export function SampleList() {
  const [samples, setSamples] = useState<Sample[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const data = await getSamples()
        setSamples(data)
      } catch (error) {
        console.error("Failed to fetch samples:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSamples()
  }, [])

  if (loading) {
    return <div className="text-center p-4">Loading samples...</div>
  }

  if (samples.length === 0) {
    return <div className="text-center p-4">No samples found. Create your first sample to get started.</div>
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Equipment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Material</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {samples.map((sample) => (
            <TableRow key={sample.id}>
              <TableCell className="font-medium">{sample.name}</TableCell>
              <TableCell>{sample.equipment_code}</TableCell>
              <TableCell>{`${sample.year}/${sample.month}/${sample.day}`}</TableCell>
              <TableCell>{sample.material}</TableCell>
              <TableCell className="max-w-xs truncate">{sample.description}</TableCell>
              <TableCell className="text-right">
                <Link href={`/samples/${sample.id}`}>
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                    <span className="sr-only">View sample</span>
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
