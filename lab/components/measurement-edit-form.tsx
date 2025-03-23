"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Loader2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { measurementService } from "@/services/measurement-service"
import type { Measurement, MeasurementParameter, MeasurementType } from "@/types/measurement-types"
import { ParameterField } from "./parameter-field"
import { FileUploadArea } from "./file-upload-area"

interface MeasurementEditFormProps {
  id: string
}

export default function MeasurementEditForm({ id }: MeasurementEditFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [measurement, setMeasurement] = useState<Measurement | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [notes, setNotes] = useState("")
  const [parameters, setParameters] = useState<Record<string, any>>({})
  const [files, setFiles] = useState<any[]>([])

  // Metadata
  const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>([])
  const [parameterDefinitions, setParameterDefinitions] = useState<MeasurementParameter[]>([])
  const [samples, setSamples] = useState<{ id: string; identifier: string; name: string }[]>([])

  // Load measurement data
  useEffect(() => {
    async function loadMeasurement() {
      setIsLoading(true)
      setError(null)

      try {
        // Fetch measurement
        const measurementData = await measurementService.getMeasurement(id)
        setMeasurement(measurementData)

        // Set form fields
        setTitle(measurementData.title)
        setDescription(measurementData.description || "")
        setNotes(measurementData.notes || "")
        setParameters(measurementData.parameters || {})
        setFiles(measurementData.files || [])

        // Fetch measurement types and samples
        const [types, samplesData] = await Promise.all([
          measurementService.getMeasurementTypes(),
          measurementService.getSamples(),
        ])

        setMeasurementTypes(types)
        setSamples(samplesData)

        // Fetch parameter definitions for this measurement type
        const params = await measurementService.getMeasurementParameters(measurementData.measurementType)
        setParameterDefinitions(params)
      } catch (err) {
        console.error("Error loading measurement:", err)
        setError("Failed to load measurement data")
      } finally {
        setIsLoading(false)
      }
    }

    loadMeasurement()
  }, [id])

  // Group parameters by category
  const basicParameters = parameterDefinitions.filter((p) => !p.category || p.category === "basic")
  const advancedParameters = parameterDefinitions.filter((p) => p.category === "advanced")
  const experimentalParameters = parameterDefinitions.filter((p) => p.category === "experimental")

  // Check if a parameter should be shown based on dependencies
  const shouldShowParameter = (param: MeasurementParameter): boolean => {
    if (!param.dependsOn) return true

    const { parameter, value, condition } = param.dependsOn
    const paramValue = parameters[parameter]

    switch (condition) {
      case "equals":
        return paramValue === value
      case "notEquals":
        return paramValue !== value
      case "greaterThan":
        return paramValue > value
      case "lessThan":
        return paramValue < value
      default:
        return true
    }
  }

  // Handle parameter change
  const handleParameterChange = (name: string, value: any) => {
    setParameters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle file upload
  const handleFileUpload = (files: FileList) => {
    const newFiles = Array.from(files).map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      localFile: file,
      status: "pending" as const,
      uploadProgress: 0,
    }))

    setFiles((prev) => [...prev, ...newFiles])
  }

  // Handle file removal
  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      if (!measurement) throw new Error("Measurement not found")

      // Update measurement
      const updatedMeasurement: Partial<Measurement> = {
        title,
        description,
        notes,
        parameters,
      }

      await measurementService.updateMeasurement(id, updatedMeasurement)

      // Upload new files if any
      const newFiles = files.filter((file) => file.localFile)

      if (newFiles.length > 0) {
        for (const file of newFiles) {
          if (file.localFile) {
            await measurementService.uploadFile(file.localFile, id)
          }
        }
      }

      toast.success("Measurement updated successfully")
      router.push(`/measurements/${id}`)
    } catch (err) {
      console.error("Error updating measurement:", err)
      toast.error("Failed to update measurement")
      setIsSubmitting(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    router.push(`/measurements/${id}`)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading measurement data...</p>
      </div>
    )
  }

  if (error || !measurement) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error || "Measurement not found"}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={handleCancel}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Measurement</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Measurement Information</CardTitle>
            <CardDescription>Update the basic details for this measurement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Measurement Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="measurementType">Measurement Type</Label>
                <Input
                  id="measurementType"
                  value={
                    measurementTypes.find((t) => t.id === measurement.measurementType)?.name ||
                    measurement.measurementType
                  }
                  disabled
                />
                <p className="text-xs text-muted-foreground">Measurement type cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sampleId">Sample</Label>
                <Input
                  id="sampleId"
                  value={samples.find((s) => s.id === measurement.sampleId)?.identifier || measurement.sampleId}
                  disabled
                />
                <p className="text-xs text-muted-foreground">Sample cannot be changed</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </CardContent>

          <CardHeader>
            <CardTitle>Measurement Parameters</CardTitle>
            <CardDescription>
              Update the parameters for {measurementTypes.find((t) => t.id === measurement.measurementType)?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Parameters</TabsTrigger>
                <TabsTrigger value="advanced">Advanced Parameters</TabsTrigger>
                <TabsTrigger value="experimental">Experimental</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {basicParameters.map(
                    (param) =>
                      shouldShowParameter(param) && (
                        <div key={param.id}>
                          <ParameterField
                            parameter={param}
                            value={parameters[param.name]}
                            onChange={handleParameterChange}
                          />
                        </div>
                      ),
                  )}

                  {basicParameters.length === 0 && (
                    <div className="col-span-2 text-center py-4 text-muted-foreground">
                      No basic parameters for this measurement type
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {advancedParameters.map(
                    (param) =>
                      shouldShowParameter(param) && (
                        <div key={param.id}>
                          <ParameterField
                            parameter={param}
                            value={parameters[param.name]}
                            onChange={handleParameterChange}
                          />
                        </div>
                      ),
                  )}

                  {advancedParameters.length === 0 && (
                    <div className="col-span-2 text-center py-4 text-muted-foreground">
                      No advanced parameters for this measurement type
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="experimental" className="space-y-4 mt-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Experimental parameters are for testing purposes and may not be fully supported.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {experimentalParameters.map(
                    (param) =>
                      shouldShowParameter(param) && (
                        <div key={param.id}>
                          <ParameterField
                            parameter={param}
                            value={parameters[param.name]}
                            onChange={handleParameterChange}
                          />
                        </div>
                      ),
                  )}

                  {experimentalParameters.length === 0 && (
                    <div className="col-span-2 text-center py-4 text-muted-foreground">
                      No experimental parameters for this measurement type
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardHeader>
            <CardTitle>Files</CardTitle>
            <CardDescription>Manage files associated with this measurement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileUploadArea
              files={files}
              onUpload={handleFileUpload}
              onRemove={handleRemoveFile}
              supportedFileTypes={
                measurementTypes.find((t) => t.id === measurement.measurementType)?.supportedFileTypes
              }
            />
          </CardContent>

          <CardHeader>
            <CardTitle>Notes</CardTitle>
            <CardDescription>Additional information about this measurement</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

