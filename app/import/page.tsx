"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, FileText, Table2, FileSpreadsheet } from "lucide-react"
import { SmartDataImport } from "@/components/smart-data-import"
import { useUI } from "@/hooks/use-ui"
import { useSamplesQuery } from "@/hooks/use-query-samples"
import { useCreateMeasurement } from "@/hooks/use-query-measurements"

export default function ImportPage() {
  const router = useRouter()
  const { addNotification } = useUI()
  const [importedData, setImportedData] = useState<any[] | null>(null)
  const [mappings, setMappings] = useState<Record<string, string>>({})
  const [metadata, setMetadata] = useState<Record<string, any>>({})
  const { data: samples } = useSamplesQuery()
  const createMeasurement = useCreateMeasurement()

  // Required fields for measurement data
  const requiredFields = ["x", "y"]

  // Suggested mappings for common column names
  const suggestedMappings = {
    x: ["wavelength", "angle", "2theta", "energy", "wavenumber", "time", "position", "x", "X", "Angle", "Wavelength"],
    y: ["intensity", "counts", "signal", "value", "y", "Y", "Intensity", "Counts"],
    sampleId: ["sample", "sample_id", "sampleid", "sample id", "Sample"],
    type: ["measurement_type", "type", "technique", "Type"],
    temperature: ["temp", "temperature", "t", "Temperature", "Temp"],
    power: ["power", "laser_power", "excitation_power", "Power"],
    scanRange: ["range", "scan_range", "Range"],
    scanStep: ["step", "scan_step", "Step"],
  }

  // Handle import completion
  const handleImportComplete = (
    data: any[],
    columnMappings: Record<string, string>,
    fileMetadata: Record<string, any>,
  ) => {
    setImportedData(data)
    setMappings(columnMappings)
    setMetadata(fileMetadata)

    addNotification({
      type: "success",
      message: `Successfully imported ${data.length} rows of data from ${fileMetadata.fileName || "file"}`,
    })

    // Process the data to create measurements
    processImportedData(data, columnMappings, fileMetadata)
  }

  // Process the imported data to create measurements
  const processImportedData = async (
    data: any[],
    columnMappings: Record<string, string>,
    fileMetadata: Record<string, any>,
  ) => {
    try {
      // Extract x and y data
      const xKey = columnMappings["x"]
      const yKey = columnMappings["y"]

      if (!xKey || !yKey) {
        throw new Error("Missing required x or y mapping")
      }

      // Determine measurement type
      let measurementType = "unknown"

      // Try to get from mappings
      if (columnMappings["type"] && data[0][columnMappings["type"]]) {
        measurementType = data[0][columnMappings["type"]]
      }
      // Try to infer from file name
      else if (fileMetadata.fileName) {
        const fileName = fileMetadata.fileName.toLowerCase()
        if (fileName.includes("xrd")) measurementType = "xrd"
        else if (fileName.includes("pl")) measurementType = "pl"
        else if (fileName.includes("raman")) measurementType = "raman"
        else if (fileName.includes("hall")) measurementType = "hall"
        else if (fileName.includes("afm")) measurementType = "afm"
        else if (fileName.includes("sem")) measurementType = "sem"
      }
      // Try to infer from x axis
      else {
        if (xKey.toLowerCase().includes("angle") || xKey.toLowerCase().includes("theta")) {
          measurementType = "xrd"
        } else if (xKey.toLowerCase().includes("wavelength")) {
          measurementType = "pl"
        } else if (xKey.toLowerCase().includes("wavenumber")) {
          measurementType = "raman"
        }
      }

      // Determine sample ID
      let sampleId = ""
      if (columnMappings["sampleId"] && data[0][columnMappings["sampleId"]]) {
        sampleId = data[0][columnMappings["sampleId"]]

        // Verify sample exists
        if (samples && !samples.some((s) => s.id === sampleId)) {
          // Try to find by name
          const matchingSample = samples?.find((s) => s.name === sampleId)
          if (matchingSample) {
            sampleId = matchingSample.id
          } else if (samples && samples.length > 0) {
            // Default to first sample if none matches
            sampleId = samples[0].id
          }
        }
      } else if (samples && samples.length > 0) {
        // Default to first sample
        sampleId = samples[0].id
      }

      // Extract metadata
      const measurementMetadata: Record<string, any> = {
        ...fileMetadata,
        importDate: new Date().toISOString(),
      }

      // Map known metadata fields
      const metadataFields = ["temperature", "power", "scanRange", "scanStep"]
      metadataFields.forEach((field) => {
        if (columnMappings[field] && data[0][columnMappings[field]]) {
          measurementMetadata[field] = data[0][columnMappings[field]]
        }
      })

      // Create the measurement
      const measurementData = {
        name: `Imported ${measurementType.toUpperCase()} from ${fileMetadata.fileName || "data"}`,
        type: measurementType,
        sampleId: sampleId,
        date: new Date().toISOString(),
        data: data.map((row) => ({
          [xKey]: Number.parseFloat(row[xKey]) || 0,
          [yKey]: Number.parseFloat(row[yKey]) || 0,
        })),
        metadata: measurementMetadata,
      }

      await createMeasurement.mutateAsync(measurementData)

      addNotification({
        type: "success",
        message: "Measurement created successfully",
      })

      // Navigate to measurements page
      router.push("/measurements")
    } catch (error) {
      console.error("Error processing imported data:", error)
      addNotification({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to process imported data",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Import Scientific Data</h1>
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <Tabs defaultValue="import" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="import" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Smart Import</span>
          </TabsTrigger>
          <TabsTrigger value="formats" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Supported Formats</span>
          </TabsTrigger>
          <TabsTrigger value="guide" className="flex items-center gap-2">
            <Table2 className="h-4 w-4" />
            <span>Import Guide</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="mt-4">
          <SmartDataImport
            onImportComplete={handleImportComplete}
            requiredFields={requiredFields}
            suggestedMappings={suggestedMappings}
            onCancel={() => router.back()}
          />

          {importedData && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Import Summary</CardTitle>
                <CardDescription>
                  Successfully imported {importedData.length} rows of data from {metadata.fileName || "file"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">File Information</h3>
                    <ul className="mt-2 space-y-1">
                      <li className="text-sm">
                        <span className="font-medium">File Type:</span> {metadata.fileType || "Unknown"}
                      </li>
                      {metadata.sheetName && (
                        <li className="text-sm">
                          <span className="font-medium">Sheet:</span> {metadata.sheetName}
                        </li>
                      )}
                      <li className="text-sm">
                        <span className="font-medium">Rows:</span> {importedData.length}
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium">Column Mappings</h3>
                    <ul className="mt-2 space-y-1">
                      {Object.entries(mappings).map(([field, header]) => (
                        <li key={field} className="text-sm">
                          <span className="font-medium">{field}:</span> {header}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => router.push("/measurements")}>
                      <FileText className="mr-2 h-4 w-4" />
                      View Measurements
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="formats" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Supported File Formats</CardTitle>
              <CardDescription>The smart import tool supports various scientific data formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="font-medium">CSV & Text Files</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>CSV files (.csv)</li>
                    <li>Tab-delimited files (.txt)</li>
                    <li>Data files (.dat)</li>
                    <li>Custom delimiters (comma, tab, semicolon, pipe)</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Excel Files</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>Excel workbooks (.xlsx)</li>
                    <li>Legacy Excel files (.xls)</li>
                    <li>Multiple sheet support</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">MATLAB Files</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>MATLAB data files (.mat)</li>
                    <li>Supports arrays and tables</li>
                    <li>Automatic variable detection</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Origin Labs Files</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>Origin project files (.opj)</li>
                    <li>Origin worksheet files (.org)</li>
                    <li>Origin data files (.dat)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guide" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Import Guide</CardTitle>
              <CardDescription>Follow these steps to import your scientific data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Step 1: Prepare Your Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Ensure your data file has at least two columns for x and y values. Headers are recommended but not
                    required.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Step 2: Upload Your File</h3>
                  <p className="text-sm text-muted-foreground">
                    Drag and drop your file or use the browse button. The system will automatically detect the file type
                    and attempt to parse it.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Step 3: Preview and Select Data</h3>
                  <p className="text-sm text-muted-foreground">
                    Review the parsed data and select which rows to import. You can select or deselect all rows, or
                    choose individual rows.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Step 4: Map Columns</h3>
                  <p className="text-sm text-muted-foreground">
                    Map the columns in your file to the required fields in the system. At minimum, you need to map the x
                    and y values.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Step 5: Complete Import</h3>
                  <p className="text-sm text-muted-foreground">
                    Click "Complete Import" to process your data. The system will create a new measurement with the
                    imported data.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Tips for Better Results</h3>
                  <ul className="list-disc list-inside text-sm text-muted-foreground">
                    <li>Use descriptive column headers in your data files</li>
                    <li>Include metadata like sample ID and measurement type if possible</li>
                    <li>For Excel files, put your data in the first sheet for easier import</li>
                    <li>For MATLAB files, use simple variable names for your data arrays</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

