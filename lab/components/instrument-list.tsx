"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Filter, Settings, Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { instrumentService } from "@/services/instrument-service"

export default function InstrumentList() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isConfigureDialogOpen, setIsConfigureDialogOpen] = useState(false)
  const [selectedInstrumentId, setSelectedInstrumentId] = useState<string | null>(null)

  // Filter states
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterLocation, setFilterLocation] = useState<string | null>(null)

  // New instrument form state
  const [newInstrument, setNewInstrument] = useState({
    name: "",
    type: "",
    manufacturer: "",
    model: "",
    location: "",
    status: "operational",
    responsible: "",
  })

  // Get instruments from service
  const { instruments, isLoading, error } = instrumentService.useInstruments()

  // Filter instruments based on search and filters
  const filteredInstruments = instruments.filter((instrument) => {
    // Search filter
    const matchesSearch =
      search === "" ||
      instrument.name.toLowerCase().includes(search.toLowerCase()) ||
      instrument.type.toLowerCase().includes(search.toLowerCase()) ||
      instrument.manufacturer.toLowerCase().includes(search.toLowerCase())

    // Type filter
    const matchesType = !filterType || instrument.type === filterType

    // Status filter
    const matchesStatus = !filterStatus || instrument.status === filterStatus

    // Location filter
    const matchesLocation = !filterLocation || instrument.location === filterLocation

    return matchesSearch && matchesType && matchesStatus && matchesLocation
  })

  // Get unique values for filters
  const instrumentTypes = [...new Set(instruments.map((i) => i.type))]
  const instrumentStatuses = [...new Set(instruments.map((i) => i.status))]
  const instrumentLocations = [...new Set(instruments.map((i) => i.location))]

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }

  const handleAddInstrument = async () => {
    try {
      // Validate form
      if (!newInstrument.name || !newInstrument.type || !newInstrument.manufacturer) {
        toast.error("Please fill in all required fields")
        return
      }

      // Add instrument
      await instrumentService.addInstrument(newInstrument)

      // Reset form
      setNewInstrument({
        name: "",
        type: "",
        manufacturer: "",
        model: "",
        location: "",
        status: "operational",
        responsible: "",
      })

      toast.success("Instrument added successfully")
    } catch (error) {
      console.error("Error adding instrument:", error)
      toast.error("Failed to add instrument")
    }
  }

  const handleViewInstrument = (id: string) => {
    router.push(`/instruments/${id}`)
  }

  const handleConfigureInstrument = (id: string) => {
    setSelectedInstrumentId(id)
    setIsConfigureDialogOpen(true)
  }

  const handleSaveConfiguration = async () => {
    try {
      if (!selectedInstrumentId) return

      const instrument = instruments.find((i) => i.id === selectedInstrumentId)
      if (!instrument) return

      // In a real app, you would update the instrument configuration here
      await instrumentService.updateInstrument(selectedInstrumentId, {
        // Example update
        lastCalibration: new Date(),
      })

      setIsConfigureDialogOpen(false)
      toast.success("Instrument configuration updated")
    } catch (error) {
      console.error("Error updating instrument:", error)
      toast.error("Failed to update instrument configuration")
    }
  }

  const resetFilters = () => {
    setFilterType(null)
    setFilterStatus(null)
    setFilterLocation(null)
  }

  // Helper function to get badge color for instrument status
  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      operational: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      maintenance: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
      offline: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }

    return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Instrument Management</h1>
        <Popover>
          <PopoverTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" /> Add Instrument
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="grid gap-4 p-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Add New Instrument</h4>
                <p className="text-sm text-muted-foreground">Enter the details for the new instrument</p>
              </div>
              <div className="grid gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name*</Label>
                  <Input
                    id="name"
                    value={newInstrument.name}
                    onChange={(e) => setNewInstrument({ ...newInstrument, name: e.target.value })}
                    placeholder="Enter instrument name"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="type">Type*</Label>
                  <Select
                    value={newInstrument.type}
                    onValueChange={(value) => setNewInstrument({ ...newInstrument, type: value })}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MBE">MBE</SelectItem>
                      <SelectItem value="Spectrometer">Spectrometer</SelectItem>
                      <SelectItem value="Microscope">Microscope</SelectItem>
                      <SelectItem value="Diffractometer">Diffractometer</SelectItem>
                      <SelectItem value="Cryogenic">Cryogenic</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="manufacturer">Manufacturer*</Label>
                  <Input
                    id="manufacturer"
                    value={newInstrument.manufacturer}
                    onChange={(e) => setNewInstrument({ ...newInstrument, manufacturer: e.target.value })}
                    placeholder="Enter manufacturer"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={newInstrument.model}
                    onChange={(e) => setNewInstrument({ ...newInstrument, model: e.target.value })}
                    placeholder="Enter model"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newInstrument.location}
                    onChange={(e) => setNewInstrument({ ...newInstrument, location: e.target.value })}
                    placeholder="Enter location"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newInstrument.status}
                    onValueChange={(value) => setNewInstrument({ ...newInstrument, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="offline">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="responsible">Responsible</Label>
                  <Input
                    id="responsible"
                    value={newInstrument.responsible}
                    onChange={(e) => setNewInstrument({ ...newInstrument, responsible: e.target.value })}
                    placeholder="Enter responsible person"
                  />
                </div>
              </div>
              <Button onClick={handleAddInstrument} className="w-full">
                Add Instrument
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Instrument List</CardTitle>
          <CardDescription>Browse and manage all instruments in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <form onSubmit={handleSearch} className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Search instruments..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  startIcon={<Search className="h-4 w-4" />}
                />
              </div>
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Filter className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Filter Instruments</h4>
                      <p className="text-sm text-muted-foreground">
                        Filter the instrument list by type, status, or location
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="type-filter">Type</Label>
                        <Select value={filterType || ""} onValueChange={(value) => setFilterType(value || null)}>
                          <SelectTrigger id="type-filter" className="col-span-2">
                            <SelectValue placeholder="Any type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any type</SelectItem>
                            {instrumentTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="status-filter">Status</Label>
                        <Select value={filterStatus || ""} onValueChange={(value) => setFilterStatus(value || null)}>
                          <SelectTrigger id="status-filter" className="col-span-2">
                            <SelectValue placeholder="Any status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any status</SelectItem>
                            {instrumentStatuses.map((status) => (
                              <SelectItem key={status} value={status}>
                                {status}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="location-filter">Location</Label>
                        <Select
                          value={filterLocation || ""}
                          onValueChange={(value) => setFilterLocation(value || null)}
                        >
                          <SelectTrigger id="location-filter" className="col-span-2">
                            <SelectValue placeholder="Any location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="any">Any location</SelectItem>
                            {instrumentLocations.map((location) => (
                              <SelectItem key={location} value={location}>
                                {location}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={resetFilters}>
                      Reset Filters
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </form>

            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-4 text-red-500">Error loading instruments: {error}</div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Manufacturer</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Calibration</TableHead>
                      <TableHead>Responsible</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInstruments.map((instrument) => (
                      <TableRow key={instrument.id}>
                        <TableCell className="font-medium">{instrument.name}</TableCell>
                        <TableCell>{instrument.type}</TableCell>
                        <TableCell>
                          {instrument.manufacturer} {instrument.model}
                        </TableCell>
                        <TableCell>{instrument.location}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeColor(instrument.status)}>{instrument.status}</Badge>
                        </TableCell>
                        <TableCell>{instrument.lastCalibration.toLocaleDateString()}</TableCell>
                        <TableCell>{instrument.responsible}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleViewInstrument(instrument.id)}>
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleConfigureInstrument(instrument.id)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}

                    {filteredInstruments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="h-24 text-center">
                          No instruments found matching your criteria
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configure Instrument Dialog */}
      <Dialog open={isConfigureDialogOpen} onOpenChange={setIsConfigureDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configure Instrument</DialogTitle>
            <DialogDescription>Update configuration settings for this instrument</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {selectedInstrumentId && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="calibration-date" className="text-right">
                    Calibration Date
                  </Label>
                  <Input
                    id="calibration-date"
                    type="date"
                    className="col-span-3"
                    defaultValue={new Date().toISOString().split("T")[0]}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="maintenance-interval" className="text-right">
                    Maintenance Interval
                  </Label>
                  <Select defaultValue="30">
                    <SelectTrigger id="maintenance-interval" className="col-span-3">
                      <SelectValue placeholder="Select interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Weekly</SelectItem>
                      <SelectItem value="30">Monthly</SelectItem>
                      <SelectItem value="90">Quarterly</SelectItem>
                      <SelectItem value="180">Semi-annually</SelectItem>
                      <SelectItem value="365">Annually</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notifications" className="text-right">
                    Notifications
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-maintenance" defaultChecked />
                      <Label htmlFor="notify-maintenance">Maintenance due</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-calibration" defaultChecked />
                      <Label htmlFor="notify-calibration">Calibration due</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="notify-status" defaultChecked />
                      <Label htmlFor="notify-status">Status changes</Label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigureDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConfiguration}>Save Configuration</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

