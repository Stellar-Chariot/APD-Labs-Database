"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Upload, Trash, FileText, Image, FileArchive, Database } from "lucide-react"
import type { MeasurementFile } from "@/types/measurement-types"

interface FileUploadAreaProps {
  files: MeasurementFile[]
  onUpload: (files: FileList) => void
  onRemove: (index: number) => void
  supportedFileTypes?: string[]
}

export function FileUploadArea({ files, onUpload, onRemove, supportedFileTypes }: FileUploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    if (e.dataTransfer.files.length > 0) {
      onUpload(e.dataTransfer.files)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Get icon for file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <Image className="h-4 w-4" />
    if (fileType.includes("spreadsheet") || fileType.includes("csv")) return <FileText className="h-4 w-4" />
    if (fileType.includes("zip") || fileType.includes("compressed")) return <FileArchive className="h-4 w-4" />
    if (fileType.includes("database")) return <Database className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileInputChange}
          accept={supportedFileTypes?.join(",")}
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <h3 className="text-lg font-medium">Drag and drop files here</h3>
          <p className="text-sm text-muted-foreground">or</p>
          <Button type="button" variant="outline" onClick={handleButtonClick}>
            Browse Files
          </Button>

          {supportedFileTypes && supportedFileTypes.length > 0 && (
            <div className="text-xs text-muted-foreground mt-2">
              <span>Supported file types: </span>
              <div className="flex flex-wrap gap-1 mt-1 justify-center">
                {supportedFileTypes.map((type) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {files.length > 0 && (
        <div className="border rounded-md p-4">
          <Label className="text-sm font-medium mb-2">Selected Files:</Label>
          <ul className="space-y-2 mt-2">
            {files.map((file, index) => (
              <li key={index} className="flex items-center justify-between text-sm border-b pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-muted flex items-center justify-center rounded-md">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>

                    {file.status === "uploading" && (
                      <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                        <div
                          className="bg-primary h-1.5 rounded-full"
                          style={{ width: `${file.uploadProgress}%` }}
                        ></div>
                      </div>
                    )}

                    {file.status === "error" && <p className="text-xs text-red-500">{file.error}</p>}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(index)}
                  disabled={file.status === "uploading"}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

