"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { MeasurementFile } from "@/types/measurement-types"
import { Download, Eye, Trash, FileText, Image, FileArchive, Database, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface MeasurementFileListProps {
  files: MeasurementFile[]
  measurementId: string
  onDelete?: (fileId: string) => Promise<void>
}

export function MeasurementFileList({ files, measurementId, onDelete }: MeasurementFileListProps) {
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [previewFile, setPreviewFile] = useState<MeasurementFile | null>(null)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)

  // Get icon for file type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <Image className="h-4 w-4" />
    if (fileType.includes("spreadsheet") || fileType.includes("csv")) return <FileText className="h-4 w-4" />
    if (fileType.includes("zip") || fileType.includes("compressed")) return <FileArchive className="h-4 w-4" />
    if (fileType.includes("database")) return <Database className="h-4 w-4" />
    return <FileText className="h-4 w-4" />
  }

  const handleDeleteFile = async (fileId: string) => {
    setDeletingFileId(fileId)

    try {
      if (onDelete) {
        await onDelete(fileId)
      } else {
        // Simulate deletion
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }

      toast.success("File deleted successfully")
    } catch (err) {
      console.error("Error deleting file:", err)
      toast.error("Failed to delete file")
    } finally {
      setDeletingFileId(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleDownloadFile = (file: MeasurementFile) => {
    // In a real implementation, this would download the file from the server
    toast.success(`Downloading file: ${file.name}`)

    // Simulate download delay
    setTimeout(() => {
      if (file.url) {
        const a = document.createElement("a")
        a.href = file.url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      } else {
        toast.error("File URL not available")
      }
    }, 1000)
  }

  const handlePreviewFile = (file: MeasurementFile) => {
    setPreviewFile(file)
    setPreviewDialogOpen(true)
  }

  // Render file preview based on type
  const renderFilePreview = () => {
    if (!previewFile) return null

    if (previewFile.type.startsWith("image/")) {
      return (
        <div className="flex justify-center">
          <img
            src={previewFile.url || "/placeholder.svg"}
            alt={previewFile.name}
            className="max-h-[500px] max-w-full object-contain"
          />
        </div>
      )
    }

    if (previewFile.type.includes("text") || previewFile.type.includes("csv")) {
      return (
        <div className="bg-muted p-4 rounded-md overflow-auto max-h-[500px]">
          <pre className="text-sm whitespace-pre-wrap">
            {/* In a real implementation, this would fetch and display the file content */}
            File content would be displayed here. This is a placeholder for the content of {previewFile.name}.
          </pre>
        </div>
      )
    }

    return (
      <div className="text-center py-8">
        <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <p>Preview not available for this file type.</p>
        <p className="text-sm text-muted-foreground mt-2">Please download the file to view its contents.</p>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No files attached to this measurement</p>
      </div>
    )
  }

  return (
    <div>
      <ul className="space-y-2">
        {files.map((file) => (
          <li key={file.id || file.name} className="flex items-center justify-between text-sm border-b pb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-muted flex items-center justify-center rounded-md">
                {getFileIcon(file.type)}
              </div>
              <div>
                <p className="font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => handlePreviewFile(file)} disabled={!file.url}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDownloadFile(file)} disabled={!file.url}>
                <Download className="h-4 w-4" />
              </Button>
              {onDelete && (
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Delete File</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to delete this file? This action cannot be undone.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => file.id && handleDeleteFile(file.id)}
                        disabled={deletingFileId === file.id}
                      >
                        {deletingFileId === file.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete File"
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </li>
        ))}
      </ul>

      {/* File Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewFile?.name}</DialogTitle>
            <DialogDescription>
              {previewFile?.type} • {previewFile ? (previewFile.size / 1024).toFixed(1) : 0} KB
            </DialogDescription>
          </DialogHeader>

          {renderFilePreview()}

          <DialogFooter>
            <Button variant="outline" onClick={() => previewFile && handleDownloadFile(previewFile)}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

