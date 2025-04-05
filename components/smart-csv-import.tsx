"use client"

import { useState, useCallback, useRef } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Upload, Check, ChevronLeft, ChevronRight } from "lucide-react"
import { useUI } from "@/hooks/use-ui"
import Papa from "papaparse"

interface SmartCsvImportProps {
  onImportComplete: (data: any[], mappings: Record<string, string>) => void
  requiredFields?: string[]
  suggestedMappings?: Record<string, string>
  onCancel?: () => void
}

export function SmartCsvImport({
  onImportComplete,
  requiredFields = [],
  suggestedMappings = {},
  onCancel,
}: SmartCsvImportProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({})
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({})
  const [step, setStep] = useState<"upload" | "preview" | "mapping">("upload")
  const [skipRows, setSkipRows] = useState(0)
  const [delimiter, setDelimiter] = useState(",")
  const [previewLimit, setPreviewLimit] = useState(10)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addNotification } = useUI()

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setFile(file)
      parseFile(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "text/plain": [".txt"],
      "application/vnd.ms-excel": [".csv", ".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    multiple: false,
  })

  // Parse the CSV file
  const parseFile = (file: File, options: Papa.ParseConfig = {}) => {
    setParseError(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      preview: 100, // Parse more rows than we show for better detection
      delimitersToGuess: [",", "\t", ";", "|"],
      ...options,
      complete: (results) => {
        if (results.errors.length > 0) {
          setParseError(results.errors[0].message)
          return
        }

        if (results.data.length === 0) {
          setParseError("No data found in file")
          return
        }

        // Get headers from the first row
        const headers = results.meta.fields || []
        setHeaders(headers)

        // Set preview data
        setPreviewData(results.data)

        // Auto-select all rows
        const rowSelections: Record<number, boolean> = {}
        results.data.forEach((_, index) => {
          rowSelections[index] = true
        })
        setSelectedRows(rowSelections)

        // Try to auto-map columns based on suggested mappings
        const autoMappings: Record<string, string> = {}

        // First try exact matches
        headers.forEach((header) => {
          Object.entries(suggestedMappings).forEach(([field, patterns]) => {
            const patternArray = Array.isArray(patterns) ? patterns : [patterns]

            if (patternArray.includes(header)) {
              autoMappings[field] = header
            }
          })
        })

        // Then try fuzzy matches for unmapped required fields
        requiredFields.forEach((field) => {
          if (!autoMappings[field] && suggestedMappings[field]) {
            const patterns = Array.isArray(suggestedMappings[field])
              ? suggestedMappings[field]
              : [suggestedMappings[field]]

            // Find the best match
            let bestMatch: string | null = null

            headers.forEach((header) => {
              // Skip if this header is already mapped
              if (Object.values(autoMappings).includes(header)) return

              patterns.forEach((pattern) => {
                if (typeof pattern === "string" && header.toLowerCase().includes(pattern.toLowerCase())) {
                  bestMatch = header
                }
              })
            })

            if (bestMatch) {
              autoMappings[field] = bestMatch
            }
          }
        })

        setColumnMappings(autoMappings)
        setStep("preview")
      },
      error: (error) => {
        setParseError(`Error parsing file: ${error.message}`)
      },
    })
  }

  // Reparse with new options
  const reparseFile = () => {
    if (!file) return

    parseFile(file, {
      delimiter,
      skipFirstNRows: skipRows,
    })
  }

  // Handle column mapping change
  const handleMappingChange = (field: string, header: string) => {
    setColumnMappings((prev) => ({
      ...prev,
      [field]: header,
    }))
  }

  // Toggle row selection
  const toggleRowSelection = (index: number) => {
    setSelectedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  // Select/deselect all rows
  const toggleAllRows = (select: boolean) => {
    const newSelections: Record<number, boolean> = {}
    previewData.forEach((_, index) => {
      newSelections[index] = select
    })
    setSelectedRows(newSelections)
  }

  // Process and complete the import
  const completeImport = () => {
    // Check if all required fields are mapped
    const missingFields = requiredFields.filter((field) => !columnMappings[field])

    if (missingFields.length > 0) {
      addNotification({
        type: "error",
        message: `Missing required field mappings: ${missingFields.join(", ")}`,
      })
      return
    }

    // Filter selected rows
    const selectedData = previewData.filter((_, index) => selectedRows[index])

    if (selectedData.length === 0) {
      addNotification({
        type: "error",
        message: "No rows selected for import",
      })
      return
    }

    // Transform data based on mappings if needed
    const transformedData = selectedData.map((row) => {
      const newRow: Record<string, any> = {}

      // Map the columns according to the user's selections
      Object.entries(columnMappings).forEach(([field, header]) => {
        newRow[field] = row[header]
      })

      return newRow
    })

    // Call the completion handler
    onImportComplete(transformedData, columnMappings)
  }

  // Render the upload step
  const renderUploadStep = () => (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50"}`}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <h3 className="font-medium">Drag & drop a CSV file here</h3>
          <p className="text-sm text-muted-foreground">
            or <span className="text-primary">browse</span> to select a file
          </p>
        </div>
      </div>

      {parseError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error parsing file</AlertTitle>
          <AlertDescription>{parseError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="delimiter">Delimiter</Label>
          <Select value={delimiter} onValueChange={setDelimiter}>
            <SelectTrigger id="delimiter">
              <SelectValue placeholder="Select delimiter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=",">Comma (,)</SelectItem>
              <SelectItem value="\t">Tab</SelectItem>
              <SelectItem value=";">Semicolon (;)</SelectItem>
              <SelectItem value="|">Pipe (|)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="skipRows">Skip Rows</Label>
          <Input
            id="skipRows"
            type="number"
            min="0"
            value={skipRows}
            onChange={(e) => setSkipRows(Number.parseInt(e.target.value) || 0)}
          />
          <p className="text-xs text-muted-foreground">Skip metadata or header rows</p>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button onClick={reparseFile} disabled={!file}>
          Parse File
        </Button>
      </div>
    </div>
  )

  // Render the preview step
  const renderPreviewStep = () => {
    const displayData = previewData.slice(0, previewLimit)

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Data Preview</h3>
            <p className="text-sm text-muted-foreground">
              Showing {displayData.length} of {previewData.length} rows
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => toggleAllRows(true)}>
              Select All
            </Button>
            <Button variant="outline" size="sm" onClick={() => toggleAllRows(false)}>
              Deselect All
            </Button>
          </div>
        </div>

        <div className="border rounded-md overflow-auto max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Import</TableHead>
                {headers.map((header) => (
                  <TableHead key={header}>{header}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows[rowIndex] || false}
                      onCheckedChange={() => toggleRowSelection(rowIndex)}
                    />
                  </TableCell>
                  {headers.map((header) => (
                    <TableCell key={`${rowIndex}-${header}`}>{String(row[header] || "")}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep("upload")}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={() => setStep("mapping")}>
            Map Columns
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // Render the mapping step
  const renderMappingStep = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Map Columns</h3>
        <p className="text-sm text-muted-foreground">Match the columns in your file to the required fields</p>
      </div>

      <div className="space-y-4">
        {requiredFields.map((field) => (
          <div key={field} className="grid grid-cols-2 gap-4 items-center">
            <div>
              <Label htmlFor={`field-${field}`} className="flex items-center">
                {field}
                <span className="text-red-500 ml-1">*</span>
              </Label>
            </div>
            <div>
              <Select value={columnMappings[field] || ""} onValueChange={(value) => handleMappingChange(field, value)}>
                <SelectTrigger id={`field-${field}`}>
                  <SelectValue placeholder="Select a column" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-mapped">-- Not mapped --</SelectItem>
                  {headers.map((header) => (
                    <SelectItem key={header} value={header}>
                      {header}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}

        {/* Optional fields section */}
        <div className="border-t pt-4 mt-6">
          <h4 className="text-sm font-medium mb-4">Optional Fields</h4>

          {Object.keys(suggestedMappings)
            .filter((field) => !requiredFields.includes(field))
            .map((field) => (
              <div key={field} className="grid grid-cols-2 gap-4 items-center mb-4">
                <div>
                  <Label htmlFor={`field-${field}`}>{field}</Label>
                </div>
                <div>
                  <Select
                    value={columnMappings[field] || ""}
                    onValueChange={(value) => handleMappingChange(field, value)}
                  >
                    <SelectTrigger id={`field-${field}`}>
                      <SelectValue placeholder="Select a column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-mapped">-- Not mapped --</SelectItem>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep("preview")}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button onClick={completeImport}>
          <Check className="mr-2 h-4 w-4" />
          Complete Import
        </Button>
      </div>
    </div>
  )

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Smart CSV Import</CardTitle>
        <CardDescription>Preview, select, and map data from your CSV file</CardDescription>
      </CardHeader>
      <CardContent>
        {step === "upload" && renderUploadStep()}
        {step === "preview" && renderPreviewStep()}
        {step === "mapping" && renderMappingStep()}
      </CardContent>
    </Card>
  )
}

