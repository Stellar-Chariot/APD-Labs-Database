"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Filter, Plus, Search, Loader2 } from "lucide-react"
import { measurementService } from "@/services/measurement-service"
import MeasurementModal from "./measurement-modal"

export default function MeasurementList() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Use the measurement service hook to get measurements with loading state
  const { measurements, isLoading, error } = measurementService.useMeasurements()

  // Filter measurements based on search query and active tab
  const filteredMeasurements = measurements.filter((measurement) => {
    const matchesSearch =
      measurement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (measurement.description && measurement.description.toLowerCase().includes(searchQuery.toLowerCase()))

    if (activeTab === "all") return matchesSearch
    return matchesSearch && measurement.measurementType === activeTab
  })

  // Group measurements by type for the sidebar
  const measurementsByType = measurements.reduce(
    (acc, measurement) => {
      const type = measurement.measurementType
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(measurement)
      return acc
    },
    {} as Record<string, typeof measurements>,
  )

  const handleRefresh = () => {
    // Force a refresh of the measurements data
    router.refresh()
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <p className="text-red-500 mb-4">Error loading measurements: {error}</p>
        <Button onClick={handleRefresh}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Measurements</h1>
          <p className="text-muted-foreground">View and manage all measurement data</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Measurement
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Filter</CardTitle>
            <CardDescription>Filter measurements by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search measurements..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div
                  className={`flex justify-between items-center p-2 rounded-md cursor-pointer ${
                    activeTab === "all" ? "bg-muted" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setActiveTab("all")}
                >
                  <span>All Measurements</span>
                  <Badge variant="outline">{measurements.length}</Badge>
                </div>

                {Object.entries(measurementsByType).map(([type, typeMeasurements]) => (
                  <div
                    key={type}
                    className={`flex justify-between items-center p-2 rounded-md cursor-pointer ${
                      activeTab === type ? "bg-muted" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setActiveTab(type)}
                  >
                    <span>{type.replace("_", "-")}</span>
                    <Badge variant="outline">{typeMeasurements.length}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{activeTab === "all" ? "All Measurements" : activeTab.replace("_", "-")}</CardTitle>
                  <CardDescription>
                    {filteredMeasurements.length} measurement{filteredMeasurements.length !== 1 && "s"} found
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Advanced Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                  <p className="text-muted-foreground">Loading measurements...</p>
                </div>
              ) : filteredMeasurements.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Sample</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMeasurements.map((measurement) => (
                      <TableRow key={measurement.id}>
                        <TableCell className="font-medium">{measurement.title}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{measurement.measurementType.replace("_", "-")}</Badge>
                        </TableCell>
                        <TableCell>{measurement.sampleId}</TableCell>
                        <TableCell>
                          {measurement.createdAt ? new Date(measurement.createdAt).toLocaleDateString() : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Link href={`/measurements/${measurement.id}`}>
                            <Button variant="link" size="sm">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No measurements found matching your criteria.</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleRefresh}>
                Refresh
              </Button>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Measurement
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Measurement Modal */}
      <MeasurementModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleRefresh} />
    </div>
  )
}

