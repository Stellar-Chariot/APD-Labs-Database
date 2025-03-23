"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, Upload, FileText, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { measurementService } from "@/services/measurement-service"

export default function MeasurementExportImport() {
  const [activeTab, setActiveTab] = useState("export")
  const [exportFormat, setExportFormat] = useState("json")
  const [selectedMeasurements, setSelectedMeasurements] = useState<string[]>([])
  const [includeData, setIncludeData] = useState(true)
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [importPreview, setImportPreview] = useState<any>(null)

  // Get measurements from the service
  const { measurements, isLoading } = measurementService.useMeasurements()

  const handleExport = async () => {
    if (selectedMeasurements.length === 0) {
      toast.error("Please select at least one measurement to export")
      return
    }

    setIsExporting(true)

    try {
      // Get full measurement data for selected measurements
      const measurementsToExport = await Promise.all(
        selectedMeasurements.map((id) => measurementService.getMeasurement(id)),
      )

      // Prepare export data
      const exportData = measurementsToExport.map((measurement) => {
        const exportItem: any = {
          id: measurement.id,
          title: measurement.title,
          measurementType: measurement.measurementType,
          sampleId: measurement.sampleId,
          createdAt: measurement.createdAt,
          createdBy: measurement.createdBy,
        }

        if (includeMetadata) {
          exportItem.description = measurement.description
          exportItem.notes = measurement.notes
          exportItem.tags = measurement.tags
        }

        if (includeData) {
          exportItem.parameters = measurement.parameters
          // In a real app, this would also include the actual measurement data
        }

        return exportItem
      })

      // Generate export file
      let dataStr, filename, mimeType

      if (exportFormat === "json") {
        dataStr = JSON.stringify(exportData, null, 2)
        filename = `measurements-export-${new Date().toISOString().slice(0, 10)}.json`
        mimeType = "application/json"
      } else if (exportFormat === "csv") {
        // Simple CSV generation - in a real app, use a proper CSV library
        const headers = ["id", "title", "measurementType", "sampleId", "createdAt", "createdBy"]
        if (includeMetadata) {
          headers.push("description", "notes", "tags")
        }

        const rows = exportData.map((item) => {
          const row = [
            item.id,
            item.title,
            item.measurementType,
            item.sampleId,
            new Date(item.createdAt).toISOString(),
            item.createdBy,
          ]

          if (includeMetadata) {
            row.push(item.description || "", item.notes || "", (item.tags || []).join(";"))
          }

          return row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
        })

        dataStr = [headers.join(","), ...rows].join("\n")
        filename = `measurements-export-${new Date().toISOString().slice(0, 10)}.csv`
        mimeType = "text/csv"
      } else {
        throw new Error("Unsupported export format")
      }

      // Create download link
      const blob = new Blob([dataStr], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", filename)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success(`Successfully exported ${exportData.length} measurements`)
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export measurements")
    } finally {
      setIsExporting(false)
    }
  }

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImportFile(file)

      // Preview the file
      const reader = new FileReader()

      reader.onload = (event) => {
        try {
          if (event.target?.result) {
            const content = event.target.result as string

            if (file.name.endsWith(".json")) {
              const data = JSON.parse(content)
              setImportPreview({
                format: "json",
                count: Array.isArray(data) ? data.length : 1,
                sample: Array.isArray(data) ? data.slice(0, 1) : data,
              })
            } else if (file.name.endsWith(".csv")) {
              const lines = content.split("\n")
              const headers = lines[0].split(",")
              setImportPreview({
                format: "csv",
                count: lines.length - 1,
                headers,
                sample: lines.slice(1, 2),
              })
            } else {
              setImportPreview(null)
              toast.error("Unsupported file format")
            }
          }
        } catch (error) {
          console.error("Error parsing import file:", error)
          setImportPreview(null)
          toast.error("Error parsing file")
        }
      }

      reader.readAsText(file)
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Please select a file to import")
      return
    }

    setIsImporting(true)

    try {
      // In a real app, this would send the file to the server for processing
      // For now, we'll just simulate a successful import

      await new Promise((resolve) => setTimeout(resolve, 1500))

      const importCount = importPreview?.count || 0

      toast.success(`Successfully imported ${importCount} measurements`)
      setImportFile(null)
      setImportPreview(null)
    } catch (error) {
      console.error("Import error:", error)
      toast.error("Failed to import measurements")
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export & Import Measurements</CardTitle>
        <CardDescription>Transfer measurement data between systems</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Select Measurements</Label>
              <div className="border rounded-md p-4 max-h-[200px] overflow-y-auto space-y-2">
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <p className="text-muted-foreground">Loading measurements...</p>
                  </div>
                ) : measurements.length > 0 ? (
                  <>
                    <div className="flex items-center space-x-2 pb-2 border-b">
                      <Checkbox
                        id="select-all"
                        checked={selectedMeasurements.length === measurements.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedMeasurements(measurements.map((m) => m.id))
                          } else {
                            setSelectedMeasurements([])
                          }
                        }}
                      />
                      <Label htmlFor="select-all">Select All</Label>
                    </div>

                    {measurements.map((measurement) => (
                      <div key={measurement.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`measurement-${measurement.id}`}
                          checked={selectedMeasurements.includes(measurement.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedMeasurements((prev) => [...prev, measurement.id])
                            } else {
                              setSelectedMeasurements((prev) => prev.filter((id) => id !== measurement.id))
                            }
                          }}
                        />
                        <Label htmlFor={`measurement-${measurement.id}`}>
                          {measurement.title} ({measurement.measurementType})
                        </Label>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="flex justify-center py-4">
                    <p className="text-muted-foreground">No measurements available</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Export Options</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-data"
                    checked={includeData}
                    onCheckedChange={(checked) => setIncludeData(!!checked)}
                  />
                  <Label htmlFor="include-data">Include measurement data</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-metadata"
                    checked={includeMetadata}
                    onCheckedChange={(checked) => setIncludeMetadata(!!checked)}
                  />
                  <Label htmlFor="include-metadata">Include metadata (description, notes, tags)</Label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Import File</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">Drag and drop a file here or click to browse</p>
                <Input
                  id="file-import"
                  type="file"
                  accept=".json,.csv"
                  className="hidden"
                  onChange={handleImportFileChange}
                />
                <Button type="button" variant="outline" onClick={() => document.getElementById("file-import")?.click()}>
                  Browse Files
                </Button>
              </div>
            </div>

            {importFile && (
              <div className="space-y-2">
                <Label>Selected File</Label>
                <div className="flex items-center p-2 bg-muted rounded-md">
                  <FileText className="h-4 w-4 mr-2" />
                  <span>{importFile.name}</span>
                  <span className="ml-2 text-xs text-muted-foreground">({Math.round(importFile.size / 1024)} KB)</span>
                </div>
              </div>
            )}

            {importPreview && (
              <div className="space-y-2">
                <Label>Import Preview</Label>
                <div className="border rounded-md p-4">
                  <p className="text-sm mb-2">
                    Format: <span className="font-medium">{importPreview.format.toUpperCase()}</span>
                  </p>
                  <p className="text-sm mb-2">
                    Items: <span className="font-medium">{importPreview.count}</span>
                  </p>

                  {importPreview.format === "json" && (
                    <div className="bg-muted p-2 rounded-md overflow-x-auto text-xs">
                      <pre>{JSON.stringify(importPreview.sample, null, 2)}</pre>
                    </div>
                  )}

                  {importPreview.format === "csv" && (
                    <div className="bg-muted p-2 rounded-md overflow-x-auto text-xs">
                      <p>Headers: {importPreview.headers.join(", ")}</p>
                      <p>Sample: {importPreview.sample}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center p-2 bg-amber-50 text-amber-800 rounded-md">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">
                    Importing will add these measurements to your system. This action cannot be undone.
                  </span>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        {activeTab === "export" ? (
          <Button onClick={handleExport} disabled={isExporting || selectedMeasurements.length === 0}>
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export Measurements"}
          </Button>
        ) : (
          <Button onClick={handleImport} disabled={isImporting || !importFile}>
            <Upload className="mr-2 h-4 w-4" />
            {isImporting ? "Importing..." : "Import Measurements"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

