"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { getMeasurements, importData } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface Measurement {
  id: number
  name: string
}

export function DataImportForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [measurements, setMeasurements] = useState<Measurement[]>([])
  const [fileContent, setFileContent] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")
  const { toast } = useToast()

  useEffect(() => {
    const fetchMeasurements = async () => {
      try {
        const data = await getMeasurements()
        setMeasurements(data as Measurement[])
      } catch (error) {
        console.error("Failed to fetch measurements:", error)
      }
    }

    fetchMeasurements()
  }, [])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)

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
      const measurement_id = formData.get("measurement_id") as string
      const file_type = fileName.split(".").pop() || ""
      const file_size = fileContent.length

      // Parse the data - this is a simplified example
      // In a real app, you'd have more sophisticated parsing based on file type
      const lines = fileContent.trim().split("\n")
      const data = lines.map((line, index) => {
        const [x, y] = line.split(",").map((val) => Number.parseFloat(val.trim()))
        return { x, y }
      })

      formData.append("file_type", file_type)
      formData.append("file_size", file_size.toString())
      formData.append("data", JSON.stringify(data))

      const result = await importData(formData)

      toast({
        title: "Data imported",
        description: "Measurement data has been imported successfully.",
      })

      // Reset form
      e.currentTarget.reset()
      setFileContent("")
      setFileName("")
    } catch (error) {
      console.error("Failed to import data:", error)
      toast({
        title: "Error",
        description: "Failed to import data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Import Data</CardTitle>
          <CardDescription>Upload a CSV or other data file to import measurement data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="measurement_id">Measurement</Label>
            <Select name="measurement_id" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a measurement" />
              </SelectTrigger>
              <SelectContent>
                {measurements.map((measurement) => (
                  <SelectItem key={measurement.id} value={measurement.id.toString()}>
                    {measurement.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="file">Data File (CSV)</Label>
            <Input id="file" type="file" accept=".csv,.txt,.dat" onChange={handleFileChange} required />
            <Input
              id="filename"
              name="filename"
              type="hidden"
              value={fileName}
            />
          </div>
          {fileContent && (
            <div className="grid gap-2">
              <Label htmlFor="preview">Data Preview</Label>
              <Textarea
                id="preview"
                value={fileContent.slice(0, 500) + (fileContent.length > 500 ? "..." : "")}
                readOnly
                className="h-32 resize-none font-mono text-xs"
              />
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={isSubmitting || !fileContent}>
            {isSubmitting ? "Importing..." : "Import Data"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
