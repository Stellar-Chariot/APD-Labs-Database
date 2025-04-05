import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileUploadForm } from "@/components/file-upload-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Table2 } from "lucide-react"

export default function UploadPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold tracking-tight">Upload Data</h1>

      <div className="flex justify-end mb-4">
        <Link href="/import">
          <Button className="flex items-center gap-2">
            <Table2 className="h-4 w-4" />
            Smart Data Import
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload Measurement Data</CardTitle>
          <CardDescription>Upload measurement data files to add them to the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <FileUploadForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File Naming Convention</CardTitle>
          <CardDescription>Follow these guidelines for automatic data processing.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Format</h3>
              <p className="text-sm text-muted-foreground">[SampleID][MeasurementNumber][MeasurementType].csv</p>
            </div>

            <div>
              <h3 className="font-medium">Example</h3>
              <p className="text-sm text-muted-foreground">
                T250306GaNA1xrd.csv - XRD measurement #1 for sample T250306GaNA
              </p>
            </div>

            <div>
              <h3 className="font-medium">Supported Measurement Types</h3>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                <li>xrd - X-Ray Diffraction</li>
                <li>pl - Photoluminescence</li>
                <li>hall - Hall Effect</li>
                <li>afm - Atomic Force Microscopy</li>
                <li>sem - Scanning Electron Microscopy</li>
                <li>raman - Raman Spectroscopy</li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium">Advanced Import</h3>
              <p className="text-sm text-muted-foreground">
                For more complex data formats or custom column mapping, use the Smart Data Import tool.
              </p>
              <div className="mt-2">
                <Link href="/import">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Table2 className="h-4 w-4" />
                    Smart Data Import
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

