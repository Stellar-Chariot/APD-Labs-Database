"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload } from "lucide-react"
import { uploadFile } from "@/services/file-upload-service"
import { useApi } from "@/hooks/use-api"
import { ErrorDisplay } from "@/components/ui/error-display"
import { ErrorBoundary } from "@/components/error-boundary"

export function FileUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")

  const {
    loading: uploading,
    error: uploadError,
    execute: executeUpload,
    clearError,
  } = useApi(uploadFile, {
    showSuccessNotification: true,
    successMessage: "File uploaded successfully",
    context: "File Upload",
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
      setFileName(selectedFile.name)
      clearError() // Clear any previous errors when a new file is selected
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      return
    }

    const result = await executeUpload(file)

    if (result) {
      // Reset form on success
      setFile(null)
      setFileName("")

      // Reset the file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement
      if (fileInput) {
        fileInput.value = ""
      }
    }
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <label htmlFor="file-upload" className="text-sm font-medium">
              Select File
            </label>
            <Input
              id="file-upload"
              type="file"
              accept=".csv,.txt,.xlsx,.xls"
              onChange={handleFileChange}
              disabled={uploading}
              aria-invalid={uploadError ? "true" : "false"}
              aria-describedby={uploadError ? "file-upload-error" : undefined}
            />
            <p className="text-xs text-muted-foreground">Accepted formats: CSV, TXT, XLSX, XLS</p>
          </div>

          <Button type="submit" disabled={!file || uploading}>
            {uploading ? (
              <>
                <Upload className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </>
            )}
          </Button>
        </form>

        {uploadError && (
          <div id="file-upload-error">
            <ErrorDisplay
              title="Upload Failed"
              message={uploadError.message}
              onRetry={file ? () => executeUpload(file) : undefined}
            />
          </div>
        )}

        <div className="border rounded-md p-4">
          <h3 className="font-medium mb-2">File Upload Guidelines</h3>
          <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
            <li>Files must follow the naming convention: [SampleID][MeasurementNumber][MeasurementType].csv</li>
            <li>Data should be in a structured format with headers</li>
            <li>Maximum file size: 10MB</li>
            <li>For large datasets, consider splitting into multiple files</li>
          </ul>
        </div>
      </div>
    </ErrorBoundary>
  )
}

