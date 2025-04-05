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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertCircle,
  Upload,
  FileText,
  Check,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileCode,
} from "lucide-react"
import Papa from "papaparse"
import * as XLSX from "xlsx"

interface SmartDataImportProps {
  onImportComplete: (data: any[], mappings: Record<string, string>, metadata: Record<string, any>) => void
  requiredFields?: string[]
  suggestedMappings?: Record<string, string[]>
  onCancel?: () => void
}

export function SmartDataImport({
  onImportComplete,
  requiredFields = [],
  suggestedMappings = {},
  onCancel,
}: SmartDataImportProps) {
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
  const [fileType, setFileType] = useState<"csv" | "excel" | "matlab" | "origin">("csv")
  const [sheetName, setSheetName] = useState<string>("")
  const [availableSheets, setAvailableSheets] = useState<string[]>([])
  const [fileMetadata, setFileMetadata] = useState<Record<string, any>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setFile(file)

      // Determine file type from extension
      const extension = file.name.split(".").pop()?.toLowerCase() || ""

      if (["csv", "txt", "dat"].includes(extension)) {
        setFileType("csv")
        parseCSVFile(file)
      } else if (["xlsx", "xls"].includes(extension)) {
        setFileType("excel")
        parseExcelFile(file)
      } else if (["mat"].includes(extension)) {
        setFileType("matlab")
        parseMatlabFile(file)
      } else if (["opj", "org"].includes(extension)) {
        setFileType("origin")
        parseOriginFile(file)
      } else {
        // Default to CSV for unknown types
        setFileType("csv")
        parseCSVFile(file)
      }
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
      "text/plain": [".txt", ".dat"],
      "application/vnd.ms-excel": [".csv", ".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/x-matlab-data": [".mat"],
      "application/octet-stream": [".opj", ".org"],
    },
    multiple: false,
  })

  // Parse CSV file
  const parseCSVFile = (file: File, options: Papa.ParseConfig = {}) => {
    setParseError(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      preview: 100,
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

        // Try to auto-map columns
        autoMapColumns(headers)

        // Set file metadata
        setFileMetadata({
          fileType: "csv",
          fileName: file.name,
          rowCount: results.data.length,
          delimiter: results.meta.delimiter,
        })

        setStep("preview")
      },
      error: (error) => {
        setParseError(`Error parsing file: ${error.message}`)
      },
    })
  }

  // Parse Excel file
  const parseExcelFile = async (file: File) => {
    setParseError(null)

    try {
      // Read the file as array buffer
      const arrayBuffer = await file.arrayBuffer()

      // Parse the workbook
      const workbook = XLSX.read(arrayBuffer, { type: "array" })

      // Get available sheets
      const sheets = workbook.SheetNames
      setAvailableSheets(sheets)

      if (sheets.length === 0) {
        setParseError("No sheets found in Excel file")
        return
      }

      // Default to first sheet
      const sheetName = sheets[0]
      setSheetName(sheetName)

      // Parse the sheet
      parseExcelSheet(workbook, sheetName)
    } catch (error) {
      setParseError(`Error parsing Excel file: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Parse a specific Excel sheet
  const parseExcelSheet = (workbook: XLSX.WorkBook, sheet: string) => {
    try {
      // Get the worksheet
      const worksheet = workbook.Sheets[sheet]

      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 })

      if (jsonData.length <= skipRows) {
        setParseError("No data found in sheet after skipping rows")
        return
      }

      // Extract headers (first row after skipped rows)
      const headers = (jsonData[skipRows] as any[]).map(String)
      setHeaders(headers)

      // Convert data to objects with headers as keys
      const data = []
      for (let i = skipRows + 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[]
        const obj: Record<string, any> = {}

        for (let j = 0; j < headers.length; j++) {
          if (j < row.length) {
            obj[headers[j]] = row[j]
          } else {
            obj[headers[j]] = null
          }
        }

        data.push(obj)
      }

      setPreviewData(data)

      // Auto-select all rows
      const rowSelections: Record<number, boolean> = {}
      data.forEach((_, index) => {
        rowSelections[index] = true
      })
      setSelectedRows(rowSelections)

      // Try to auto-map columns
      autoMapColumns(headers)

      // Set file metadata
      setFileMetadata({
        fileType: "excel",
        fileName: file?.name || "",
        sheetName: sheet,
        totalSheets: workbook.SheetNames.length,
        rowCount: data.length,
      })

      setStep("preview")
    } catch (error) {
      setParseError(`Error parsing Excel sheet: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Parse MATLAB file
  const parseMatlabFile = async (file: File) => {
    setParseError(null)

    try {
      // For MATLAB files, we need to use a server endpoint to parse them
      // as browser-side parsing of .mat files is not straightforward

      // Create a FormData object
      const formData = new FormData()
      formData.append("file", file)

      // Send the file to the server for parsing
      const response = await fetch("/api/parse-matlab", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      // Set the data from the server response
      const { data, variables } = result

      if (!data || data.length === 0) {
        setParseError("No usable data found in MATLAB file")
        return
      }

      // Get headers from the first row
      const headers = Object.keys(data[0])
      setHeaders(headers)

      // Set preview data
      setPreviewData(data)

      // Auto-select all rows
      const rowSelections: Record<number, boolean> = {}
      data.forEach((_, index) => {
        rowSelections[index] = true
      })
      setSelectedRows(rowSelections)

      // Try to auto-map columns
      autoMapColumns(headers)

      // Set file metadata
      setFileMetadata({
        fileType: "matlab",
        fileName: file.name,
        variables: variables,
        rowCount: data.length,
      })

      setStep("preview")
    } catch (error) {
      setParseError(`Error parsing MATLAB file: ${error instanceof Error ? error.message : String(error)}`)

      // Fallback to CSV parsing if MATLAB parsing fails
      // This can help if the .mat file is actually a text file
      try {
        parseCSVFile(file)
      } catch (e) {
        // If both methods fail, keep the original error
      }
    }
  }

  // Parse Origin Labs file
  const parseOriginFile = async (file: File) => {
    setParseError(null)

    try {
      // Similar to MATLAB, Origin files need server-side parsing

      // Create a FormData object
      const formData = new FormData()
      formData.append("file", file)

      // Send the file to the server for parsing
      const response = await fetch("/api/parse-origin", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.error) {
        throw new Error(result.error)
      }

      // Set the data from the server response
      const { data, worksheets } = result

      if (!data || data.length === 0) {
        setParseError("No usable data found in Origin file")
        return
      }

      // Get headers from the first row
      const headers = Object.keys(data[0])
      setHeaders(headers)

      // Set preview data
      setPreviewData(data)

      // Auto-select all rows
      const rowSelections: Record<number, boolean> = {}
      data.forEach((_, index) => {
        rowSelections[index] = true
      })
      setSelectedRows(rowSelections)

      // Try to auto-map columns
      autoMapColumns(headers)

      // Set file metadata
      setFileMetadata({
        fileType: "origin",
        fileName: file.name,
        worksheets: worksheets,
        rowCount: data.length,
      })

      setStep("preview")
    } catch (error) {
      setParseError(`Error parsing Origin file: ${error instanceof Error ? error.message : String(error)}`)

      // Fallback to CSV parsing if Origin parsing fails
      // This can help if the .opj file is actually a text file
      try {
        parseCSVFile(file)
      } catch (e) {
        // If both methods fail, keep the original error
      }
    }
  }

  // Auto-map columns based on suggested mappings
  const autoMapColumns = (headers: string[]) => {
    const autoMappings: Record<string, string> = {}

    // First try exact matches
    headers.forEach((header) => {
      Object.entries(suggestedMappings).forEach(([field, patterns]) => {
        if (patterns.includes(header)) {
          autoMappings[field] = header
        }
      })
    })

    // Then try fuzzy matches for unmapped required fields
    requiredFields.forEach((field) => {
      if (!autoMappings[field] && suggestedMappings[field]) {
        const patterns = suggestedMappings[field]

        // Find the best match
        let bestMatch: string | null = null

        headers.forEach((header) => {
          // Skip if this header is already mapped
          if (Object.values(autoMappings).includes(header)) return

          patterns.forEach((pattern) => {
            if (header.toLowerCase().includes(pattern.toLowerCase())) {
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
  }

  // Reparse with new options
  const reparseFile = () => {
    if (!file) return

    if (fileType === "csv") {
      parseCSVFile(file, {
        delimiter,
        skipFirstNRows: skipRows,
      })
    } else if (fileType === "excel" && availableSheets.includes(sheetName)) {
      // Re-read the Excel file with new options
      file.arrayBuffer().then((buffer) => {
        const workbook = XLSX.read(buffer, { type: "array" })
        parseExcelSheet(workbook, sheetName)
      })
    }
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
      setParseError(`Missing required field mappings: ${missingFields.join(", ")}`)
      return
    }

    // Filter selected rows
    const selectedData = previewData.filter((_, index) => selectedRows[index])

    if (selectedData.length === 0) {
      setParseError("No rows selected for import")
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
    onImportComplete(transformedData, columnMappings, fileMetadata)
  }

  // Render the upload step
  const renderUploadStep = () => (
    <div className="space-y-6">
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            <span>Upload</span>
          </TabsTrigger>
          <TabsTrigger value="csv" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>CSV</span>
          </TabsTrigger>
          <TabsTrigger value="excel" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Excel</span>
          </TabsTrigger>
          <TabsTrigger value="scientific" className="flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            <span>Scientific</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors
              ${isDragActive ? "border-primary bg-primary/5" : "border-gray-300 hover:border-primary/50"}`}
          >
            <input {...getInputProps()} ref={fileInputRef} />
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <h3 className="font-medium">Drag & drop a data file here</h3>
              <p className="text-sm text-muted-foreground">
                or <span className="text-primary">browse</span> to select a file
              </p>
              <div className="text-xs text-muted-foreground mt-2">
                Supported formats: CSV, Excel, MATLAB (.mat), Origin Labs (.opj, .org)
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="csv">
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
        </TabsContent>

        <TabsContent value="excel">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sheetName">Sheet Name</Label>
              <Select value={sheetName} onValueChange={setSheetName} disabled={availableSheets.length === 0}>
                <SelectTrigger id="sheetName">
                  <SelectValue placeholder="Select sheet" />
                </SelectTrigger>
                <SelectContent>
                  {availableSheets.map((sheet) => (
                    <SelectItem key={sheet} value={sheet}>
                      {sheet}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skipRowsExcel">Skip Rows</Label>
              <Input
                id="skipRowsExcel"
                type="number"
                min="0"
                value={skipRows}
                onChange={(e) => setSkipRows(Number.parseInt(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">Skip metadata or header rows</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="scientific">
          <div className="space-y-4">
            <Alert>
              <FileCode className="h-4 w-4" />
              <AlertTitle>Scientific Data Formats</AlertTitle>
              <AlertDescription>
                MATLAB (.mat) and Origin Labs (.opj, .org) files are supported. Upload these files directly using the
                upload tab.
              </AlertDescription>
            </Alert>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">MATLAB</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">Supports .mat files with numeric arrays and tables.</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Origin Labs</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Supports .opj and .org files with worksheets and datasets.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {parseError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{parseError}</AlertDescription>
        </Alert>
      )}

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
        <CardTitle>Smart Data Import</CardTitle>
        <CardDescription>Import data from CSV, Excel, MATLAB, or Origin Labs files</CardDescription>
      </CardHeader>
      <CardContent>
        {step === "upload" && renderUploadStep()}
        {step === "preview" && renderPreviewStep()}
        {step === "mapping" && renderMappingStep()}
      </CardContent>
    </Card>
  )
}

