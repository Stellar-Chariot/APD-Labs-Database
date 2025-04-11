"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createMeasurement, getSamples } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RowDataPacket } from "mysql2"

interface Sample extends RowDataPacket {
  id: number
  name: string
}

export function CreateMeasurementButton() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [samples, setSamples] = useState<Sample[]>([])
  const [fileContent, setFileContent] = useState<string>("")
  const [csvData, setCsvData] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const result = await getSamples();
        // MySQL result is an array of objects with proper properties
        if (Array.isArray(result)) {
          setSamples(result as Sample[]);
        } else {
          setSamples([]);
        }
      } catch (error) {
        console.error("Failed to fetch samples:", error)
      }
    }

    if (open) {
      fetchSamples()
    }
  }, [open])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setFileContent(content)
    }
    reader.readAsText(file)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)

      // Add the data from file or CSV paste
      const dataContent = fileContent || csvData
      if (dataContent) {
        // Parse the data - this is a simplified example
        const lines = dataContent.trim().split("\n")
        const data = lines.map((line) => {
          const [x, y] = line.split(",").map((val) => Number.parseFloat(val.trim()))
          return { x, y }
        })

        formData.append("has_data", "true")
        formData.append("data", JSON.stringify(data))

        // Add file metadata if from file
        if (fileContent) {
          const filename = (document.getElementById("file") as HTMLInputElement)?.files?.[0]?.name || "data.csv"
          const file_type = filename.split(".").pop() || "csv"
          const file_size = fileContent.length

          formData.append("filename", filename)
          formData.append("file_type", file_type)
          formData.append("file_size", file_size.toString())
        } else {
          formData.append("filename", "pasted-data.csv")
          formData.append("file_type", "csv")
          formData.append("file_size", csvData.length.toString())
        }
      } else {
        formData.append("has_data", "false")
      }

      const result = await createMeasurement(formData)

      toast({
        title: "Measurement created",
        description: `Measurement ${result.name} has been created successfully.`,
      })

      setOpen(false)
      setFileContent("")
      setCsvData("")
    } catch (error) {
      console.error("Failed to create measurement:", error)
      toast({
        title: "Error",
        description: "Failed to create measurement. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFileContent("")
    setCsvData("")
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen)
        if (!newOpen) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button>Create Measurement</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Measurement</DialogTitle>
            <DialogDescription>Enter the details for your new APD measurement.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sample_id">Sample</Label>
              <Select name="sample_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sample" />
                </SelectTrigger>
                <SelectContent>
                  {samples.map((sample) => (
                    <SelectItem key={sample.id} value={sample.id.toString()}>
                      {sample.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="device_number">Device Number</Label>
                <Input id="device_number" name="device_number" placeholder="1" required />
              </div>
              <div>
                <Label htmlFor="experimental_parameter">Parameter</Label>
                <Input id="experimental_parameter" name="experimental_parameter" placeholder="pd" />
              </div>
              <div>
                <Label htmlFor="measurement_type">Type</Label>
                <Input id="measurement_type" name="measurement_type" placeholder="pl" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="measurement_date">Date</Label>
                <Input id="measurement_date" name="measurement_date" type="date" required />
              </div>
              <div>
                <Label htmlFor="equipment">Equipment</Label>
                <Input id="equipment" name="equipment" placeholder="Spectrometer" />
              </div>
            </div>
            <div>
              <Label htmlFor="operator">Operator</Label>
              <Input id="operator" name="operator" placeholder="John Doe" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter measurement description..."
                className="resize-none"
              />
            </div>

            {/* Data Input Section */}
            <div className="border rounded-md p-4">
              <Label className="mb-2 block">Measurement Data (Optional)</Label>
              <Tabs defaultValue="paste">
                <TabsList className="mb-4">
                  <TabsTrigger value="paste">Paste CSV</TabsTrigger>
                  <TabsTrigger value="upload">Upload File</TabsTrigger>
                </TabsList>
                <TabsContent value="paste">
                  <div className="grid gap-2">
                    <Label htmlFor="csv-data">Paste CSV Data (x,y format)</Label>
                    <Textarea
                      id="csv-data"
                      placeholder="0.1,2.5
0.2,3.1
0.3,3.8"
                      className="font-mono h-32"
                      value={csvData}
                      onChange={(e) => setCsvData(e.target.value)}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="upload">
                  <div className="grid gap-2">
                    <Label htmlFor="file">Upload CSV File</Label>
                    <Input id="file" type="file" accept=".csv,.txt,.dat" onChange={handleFileChange} />
                    {fileContent && (
                      <div className="mt-2">
                        <Label htmlFor="preview">Data Preview</Label>
                        <Textarea
                          id="preview"
                          value={fileContent.slice(0, 200) + (fileContent.length > 200 ? "..." : "")}
                          readOnly
                          className="h-24 resize-none font-mono text-xs mt-1"
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              <p className="text-xs text-muted-foreground mt-2">
                Data should be in CSV format with x,y values on each line
              </p>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Measurement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
