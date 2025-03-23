"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Filter } from "lucide-react"

export default function SampleList() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [grower, setGrower] = useState("")
  const [substrate, setSubstrate] = useState("")

  // In a real implementation, this would be fetched via GraphQL
  const samples = [
    {
      id: "1",
      identifier: "T250306A",
      name: "GaAs QW Structure",
      growthDate: new Date("2025-03-06"),
      substrate: "GaAs",
      grower: "Scott Sifferman",
      measurements: 5,
    },
    {
      id: "2",
      identifier: "T250307B",
      name: "AlGaAs Barrier Test",
      growthDate: new Date("2025-03-07"),
      substrate: "GaAs",
      grower: "Maria Chen",
      measurements: 3,
    },
    {
      id: "3",
      identifier: "T250310C",
      name: "InGaAs QD Sample",
      growthDate: new Date("2025-03-10"),
      substrate: "InP",
      grower: "Scott Sifferman",
      measurements: 2,
    },
    {
      id: "4",
      identifier: "T250312D",
      name: "GaN HEMT Structure",
      growthDate: new Date("2025-03-12"),
      substrate: "Sapphire",
      grower: "James Wilson",
      measurements: 0,
    },
    {
      id: "5",
      identifier: "T250315E",
      name: "AlN Buffer Layer Test",
      growthDate: new Date("2025-03-15"),
      substrate: "SiC",
      grower: "Maria Chen",
      measurements: 1,
    },
    {
      id: "6",
      identifier: "T250318F",
      name: "InGaAs/GaAs SL",
      growthDate: new Date("2025-03-18"),
      substrate: "GaAs",
      grower: "Scott Sifferman",
      measurements: 4,
    },
    {
      id: "7",
      identifier: "T250320G",
      name: "AlGaN/GaN HEMT",
      growthDate: new Date("2025-03-20"),
      substrate: "Sapphire",
      grower: "James Wilson",
      measurements: 2,
    },
  ]

  // Filter samples based on search and filter criteria
  const filteredSamples = samples.filter((sample) => {
    const matchesSearch =
      search === "" ||
      sample.identifier.toLowerCase().includes(search.toLowerCase()) ||
      sample.name.toLowerCase().includes(search.toLowerCase())

    const matchesGrower = grower === "" || sample.grower === grower
    const matchesSubstrate = substrate === "" || sample.substrate === substrate

    return matchesSearch && matchesGrower && matchesSubstrate
  })

  // Get unique growers and substrates for filter dropdowns
  const growers = Array.from(new Set(samples.map((s) => s.grower)))
  const substrates = Array.from(new Set(samples.map((s) => s.substrate)))

  // Pagination
  const itemsPerPage = 5
  const totalPages = Math.ceil(filteredSamples.length / itemsPerPage)
  const paginatedSamples = filteredSamples.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Sample Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add New Sample
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sample List</CardTitle>
          <CardDescription>Browse and manage all samples in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
              <div className="flex-1">
                <Input
                  placeholder="Search by ID or name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex space-x-2">
                <Select value={grower} onValueChange={setGrower}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by grower" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Growers</SelectItem>
                    {growers.map((g) => (
                      <SelectItem key={g} value={g}>
                        {g}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={substrate} onValueChange={setSubstrate}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by substrate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Substrates</SelectItem>
                    {substrates.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Growth Date</TableHead>
                    <TableHead>Substrate</TableHead>
                    <TableHead>Grower</TableHead>
                    <TableHead>Measurements</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSamples.map((sample) => (
                    <TableRow key={sample.id}>
                      <TableCell className="font-medium">{sample.identifier}</TableCell>
                      <TableCell>{sample.name}</TableCell>
                      <TableCell>{sample.growthDate.toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{sample.substrate}</Badge>
                      </TableCell>
                      <TableCell>{sample.grower}</TableCell>
                      <TableCell>{sample.measurements}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}

                  {paginatedSamples.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No samples found matching your criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page > 1) setPage(page - 1)
                    }}
                    className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        setPage(i + 1)
                      }}
                      isActive={page === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (page < totalPages) setPage(page + 1)
                    }}
                    className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

