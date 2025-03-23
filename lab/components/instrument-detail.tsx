"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, AlertCircle, FileText, Settings, Calendar, History, BarChart } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { instrumentService, type Instrument } from "@/services/instrument-service"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InstrumentDetailProps {
  id: string
}

export default function InstrumentDetail({ id }: InstrumentDetailProps) {
  const router = useRouter()
  const [instrument, setInstrument] = useState<Instrument | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [calibrationHistory, setCalibrationHistory] = useState<any[]>([])
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCalibrationDialogOpen, setIsCalibrationDialogOpen] = useState(false)

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<Instrument>>({})

  // Calibration form state
  const [calibrationForm, setCalibrationForm] = useState({
    date: new Date().toISOString().split("T")[0],
    technician: "",
    notes: "",
  })

  useEffect(() => {
    async function loadInstrument() {
      try {
        setIsLoading(true)
        const data = await instrumentService.getInstrument(id)
        setInstrument(data)

        // Load calibration history
        const history = await instrumentService.getCalibrationHistory(id)
        setCalibrationHistory(history)

        // Initialize edit form
        setEditForm({
          name: data.name,
          type: data.type,
          manufacturer: data.manufacturer,
          model: data.model,
          location: data.location,
          status: data.status,
          responsible: data.responsible,
          notes: data.notes,
        })

        setError(null)
      } catch (err) {
        console.error("Error loading instrument:", err)
        setError("Failed to load instrument data")
      } finally {
        setIsLoading(false)
      }
    }

    loadInstrument()
  }, [id])

  const handleEditInstrument = async () => {
    try {
      if (!instrument) return

      await instrumentService.updateInstrument(id, editForm)

      // Update local state
      setInstrument((prev) => (prev ? { ...prev, ...editForm } : null))

      setIsEditDialogOpen(false)
      toast.success("Instrument updated successfully")
    } catch (err) {
      console.error("Error updating instrument:", err)
      toast.error("Failed to update instrument")
    }
  }

  const handleDeleteInstrument = async () => {
    try {
      await instrumentService.deleteInstrument(id)

      setIsDeleteDialogOpen(false)
      toast.success("Instrument deleted successfully")
      router.push("/instruments")
    } catch (err) {
      console.error("Error deleting instrument:", err)
      toast.error("Failed to delete instrument")
    }
  }

  const handleAddCalibration = async () => {
    try {
      // In a real app, this would add a calibration record
      // For now, we'll just update the last calibration date
      await instrumentService.updateInstrument(id, {
        lastCalibration: new Date(calibrationForm.date),
      })

      // Update local state
      if (instrument) {
        setInstrument({
          ...instrument,
          lastCalibration: new Date(calibrationForm.date),
        })

        // Add to calibration history
        setCalibrationHistory([
          {
            date: new Date(calibrationForm.date),
            technician: calibrationForm.technician,
            notes: calibrationForm.notes,
          },
          ...calibrationHistory,
        ])
      }

      setIsCalibrationDialogOpen(false)
      toast.success("Calibration record added")
    } catch (err) {
      console.error("Error adding calibration:", err)
      toast.error("Failed to add calibration record")
    }
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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading instrument data...</p>
      </div>
    )
  }

  if (error || !instrument) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || "Instrument not found"}</AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{instrument.name}</CardTitle>
                <CardDescription>
                  {instrument.manufacturer} {instrument.model}
                </CardDescription>
              </div>
              <Badge className={getStatusBadgeColor(instrument.status)}>{instrument.status}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium">Type</h4>
                <p className="text-sm text-muted-foreground">{instrument.type}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Location</h4>
                <p className="text-sm text-muted-foreground">{instrument.location}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Last Calibration</h4>
                <p className="text-sm text-muted-foreground">{instrument.lastCalibration.toLocaleDateString()}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium">Responsible</h4>
                <p className="text-sm text-muted-foreground">{instrument.responsible}</p>
              </div>
            </div>

            {instrument.notes && (
              <div>
                <h4 className="text-sm font-medium">Notes</h4>
                <p className="text-sm text-muted-foreground">{instrument.notes}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              Delete
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for this instrument</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => setIsCalibrationDialogOpen(true)}
            >
              <Calendar className="h-6 w-6" />
              <span>Add Calibration</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => toast.info("Maintenance scheduling would be implemented here")}
            >
              <Settings className="h-6 w-6" />
              <span>Schedule Maintenance</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => router.push(`/instruments/${id}/documents`)}
            >
              <FileText className="h-6 w-6" />
              <span>View Documents</span>
            </Button>
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2"
              onClick={() => router.push(`/instruments/${id}/usage`)}
            >
              <BarChart className="h-6 w-6" />
              <span>Usage Statistics</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="calibration" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calibration">Calibration History</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance Records</TabsTrigger>
          <TabsTrigger value="measurements">Associated Measurements</TabsTrigger>
        </TabsList>

        <TabsContent value="calibration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calibration History</CardTitle>
              <CardDescription>Record of all calibrations performed on this instrument</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Technician</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calibrationHistory.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.technician}</TableCell>
                      <TableCell>{record.notes}</TableCell>
                    </TableRow>
                  ))}

                  {calibrationHistory.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="h-24 text-center">
                        No calibration records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Records</CardTitle>
              <CardDescription>Record of all maintenance performed on this instrument</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-40">
                <History className="h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Maintenance records would be displayed here</p>
                <Button
                  className="mt-4"
                  onClick={() => toast.info("Add maintenance record functionality would be implemented here")}
                >
                  Add Maintenance Record
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measurements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Associated Measurements</CardTitle>
              <CardDescription>Measurements performed using this instrument</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center h-40">
                <BarChart className="h-8 w-8 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Associated measurements would be displayed here</p>
                <Button className="mt-4" onClick={() => router.push("/measurements/new")}>
                  Create New Measurement
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Instrument Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Instrument</DialogTitle>
            <DialogDescription>Update the details for this instrument</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Name
              </Label>
              <Input
                id="edit-name"
                value={editForm.name || ""}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">
                Type
              </Label>
              <Select value={editForm.type || ""} onValueChange={(value) => setEditForm({ ...editForm, type: value })}>
                <SelectTrigger id="edit-type" className="col-span-3">
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-manufacturer" className="text-right">
                Manufacturer
              </Label>
              <Input
                id="edit-manufacturer"
                value={editForm.manufacturer || ""}
                onChange={(e) => setEditForm({ ...editForm, manufacturer: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-model" className="text-right">
                Model
              </Label>
              <Input
                id="edit-model"
                value={editForm.model || ""}
                onChange={(e) => setEditForm({ ...editForm, model: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-location" className="text-right">
                Location
              </Label>
              <Input
                id="edit-location"
                value={editForm.location || ""}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-status" className="text-right">
                Status
              </Label>
              <Select
                value={editForm.status || ""}
                onValueChange={(value: any) => setEditForm({ ...editForm, status: value })}
              >
                <SelectTrigger id="edit-status" className="col-span-3">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operational">Operational</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-responsible" className="text-right">
                Responsible
              </Label>
              <Input
                id="edit-responsible"
                value={editForm.responsible || ""}
                onChange={(e) => setEditForm({ ...editForm, responsible: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="edit-notes"
                value={editForm.notes || ""}
                onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditInstrument}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this instrument? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteInstrument}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Calibration Dialog */}
      <Dialog open={isCalibrationDialogOpen} onOpenChange={setIsCalibrationDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Calibration Record</DialogTitle>
            <DialogDescription>Record a new calibration for this instrument</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="calibration-date" className="text-right">
                Date
              </Label>
              <Input
                id="calibration-date"
                type="date"
                value={calibrationForm.date}
                onChange={(e) => setCalibrationForm({ ...calibrationForm, date: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="calibration-technician" className="text-right">
                Technician
              </Label>
              <Input
                id="calibration-technician"
                value={calibrationForm.technician}
                onChange={(e) => setCalibrationForm({ ...calibrationForm, technician: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="calibration-notes" className="text-right">
                Notes
              </Label>
              <Textarea
                id="calibration-notes"
                value={calibrationForm.notes}
                onChange={(e) => setCalibrationForm({ ...calibrationForm, notes: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCalibrationDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCalibration}>Add Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

