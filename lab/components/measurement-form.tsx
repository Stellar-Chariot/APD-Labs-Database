"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Loader2, Save, Upload } from "lucide-react"
import { toast } from "sonner"
import { measurementService } from "@/services/measurement-service"
import type { MeasurementType, MeasurementParameter, MeasurementFormState } from "@/types/measurement-types"

interface MeasurementFormProps {
  sampleId?: string
  measurementId?: string
  isEdit?: boolean
}

export default function MeasurementForm({ sampleId, measurementId, isEdit = false }: MeasurementFormProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("basic")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>([])
  const [parameters, setParameters] = useState<MeasurementParameter[]>([])
  const [errors, setErrors] = useState<any>({})

  // Initialize formData with default values
  const [formData, setFormData] = useState<MeasurementFormState>({
    title: "",
    description: "",
    measurementType: "",
    sampleId: sampleId || "",
    parameters: [],
    files: [],
    notes: "",
    tags: [],
  })

  // Load measurement types
  useEffect(() => {
    async function loadMeasurementTypes() {
      try {
        const types = await measurementService.getMeasurementTypes()
        setMeasurementTypes(types)
      } catch (err) {
        console.error("Error loading measurement types:", err)
        toast.error("Failed to load measurement types")
      }
    }

    loadMeasurementTypes()
  }, [])

  // Load measurement data if editing
  useEffect(() => {
    async function loadMeasurement() {
      if (!measurementId || !isEdit) return

      setIsLoading(true)

      try {
        const measurement = await measurementService.getMeasurement(measurementId)
        setFormData({
          title: measurement.title || "",
          description: measurement.description || "",
          measurementType: measurement.measurementType || "",
          sampleId: measurement.sampleId || sampleId || "",
          parameters: measurement.parameters || [],
          files: measurement.files || [],
          notes: measurement.notes || "",
          tags: measurement.tags || [],
        })

        // Load parameters for this measurement type
        if (measurement.measurementType) {
          handleMeasurementTypeChange(measurement.measurementType)
        }
      } catch (err) {
        console.error("Error loading measurement:", err)
        toast.error("Failed to load measurement data")
      } finally {
        setIsLoading(false)
      }
    }

    loadMeasurement()
  }, [measurementId, isEdit, sampleId])

  // Update parameter value
  const updateParameter = (paramId: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      parameters: prev.parameters.map((p) => (p.id === paramId ? { ...p, value } : p)),
    }))
  }

  // Add file
  const addFile = (file: File) => {
    setFormData((prev) => ({
      ...prev,
      files: [
        ...prev.files,
        {
          name: file.name,
          size: file.size,
          type: file.type,
          localFile: file,
          status: "pending",
        },
      ],
    }))
  }

  // Remove file
  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }))
  }

  // Load parameters when measurement type changes
  const handleMeasurementTypeChange = async (typeId: string) => {
    setFormData((prev) => ({ ...prev, measurementType: typeId }))

    try {
      const params = await measurementService.getMeasurementParameters(typeId)
      setParameters(params)

      // Initialize parameters with default values if not editing
      if (!isEdit) {
        setFormData((prev) => ({
          ...prev,
          parameters: params.map((p) => ({
            id: p.id,
            name: p.name,
            value: p.defaultValue || "",
            unit: p.unit,
          })),
        }))
      }
    } catch (err) {
      console.error("Error loading parameters:", err)
      toast.error("Failed to load measurement parameters")
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors: any = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.measurementType) {
      newErrors.measurementType = "Measurement type is required"
    }

    if (!formData.sampleId) {
      newErrors.sampleId = "Sample ID is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    setIsSaving(true)

    try {
      if (isEdit && measurementId) {
        await measurementService.updateMeasurement(measurementId, formData)
        toast.success("Measurement updated successfully")
        router.push(`/measurements/${measurementId}`)
      } else {
        const newMeasurement = await measurementService.createMeasurement(formData)
        toast.success("Measurement created successfully")
        router.push(`/measurements/${newMeasurement.id}`)
      }
    } catch (err) {
      console.error("Error saving measurement:", err)
      toast.error("Failed to save measurement")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (isEdit && measurementId) {
      router.push(`/measurements/${measurementId}`)
    } else if (sampleId) {
      router.push(`/samples/${sampleId}`)
    } else {
      router.push("/measurements")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading measurement data...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center mb-6">
        <Button type="button" variant="outline" size="icon" onClick={handleCancel} className="mr-4">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? "Edit Measurement" : "New Measurement"}</h1>
          <p className="text-muted-foreground">
            {isEdit ? "Update measurement details and parameters" : "Record a new measurement for analysis"}
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="parameters">Parameters</TabsTrigger>
          <TabsTrigger value="files">Files & Data</TabsTrigger>
          <TabsTrigger value="notes">Notes & Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details about this measurement</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Measurement Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter a descriptive title"
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide a brief description of this measurement"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="measurementType">
                  Measurement Type <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.measurementType} onValueChange={handleMeasurementTypeChange}>
                  <SelectTrigger id="measurementType" className={errors.measurementType ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select measurement type" />
                  </SelectTrigger>
                  <SelectContent>
                    {measurementTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.measurementType && <p className="text-red-500 text-sm">{errors.measurementType}</p>}
              </div>

              {!sampleId && (
                <div className="space-y-2">
                  <Label htmlFor="sampleId">
                    Sample ID <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="sampleId"
                    value={formData.sampleId}
                    onChange={(e) => setFormData({ ...formData, sampleId: e.target.value })}
                    placeholder="Enter the sample ID"
                    className={errors.sampleId ? "border-red-500" : ""}
                  />
                  {errors.sampleId && <p className="text-red-500 text-sm">{errors.sampleId}</p>}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="button" onClick={() => setActiveTab("parameters")}>
                Next: Parameters
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="parameters">
          <Card>
            <CardHeader>
              <CardTitle>Measurement Parameters</CardTitle>
              <CardDescription>Configure the parameters for this measurement</CardDescription>
            </CardHeader>
            <CardContent>
              {formData.measurementType ? (
                parameters.length > 0 ? (
                  <div className="space-y-4">
                    {parameters.map((param) => (
                      <div key={param.id} className="space-y-2">
                        <Label htmlFor={param.id}>
                          {param.label} {param.required && <span className="text-red-500">*</span>}
                          {param.unit && <span className="text-sm text-muted-foreground ml-1">({param.unit})</span>}
                        </Label>
                        <Input
                          id={param.id}
                          type={param.type === "number" ? "number" : "text"}
                          value={formData.parameters.find((p) => p.id === param.id)?.value || ""}
                          onChange={(e) => updateParameter(param.id, e.target.value)}
                          placeholder={`Enter ${param.label.toLowerCase()}`}
                        />
                        {param.description && <p className="text-sm text-muted-foreground">{param.description}</p>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No parameters available for this measurement type</p>
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Please select a measurement type first</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                Back
              </Button>
              <Button type="button" onClick={() => setActiveTab("files")}>
                Next: Files & Data
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>Files & Data</CardTitle>
              <CardDescription>Upload files associated with this measurement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground mb-2">Drag and drop files here or click to browse</p>
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        addFile(e.target.files[0])
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    Browse Files
                  </Button>
                </div>

                {formData.files.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium">Uploaded Files</h3>
                    <ul className="space-y-2">
                      {formData.files.map((file, index) => (
                        <li key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center mr-2">
                              <span className="text-xs">{file.name.split(".").pop()}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                            </div>
                          </div>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(index)}>
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab("parameters")}>
                Back
              </Button>
              <Button type="button" onClick={() => setActiveTab("notes")}>
                Next: Notes & Tags
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardHeader>
              <CardTitle>Notes & Tags</CardTitle>
              <CardDescription>Add notes and tags to help organize your measurements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any observations or notes about this measurement"
                  rows={5}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags.join(", ")}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag !== ""),
                    })
                  }
                  placeholder="e.g. important, review, follow-up"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button type="button" variant="outline" onClick={() => setActiveTab("files")}>
                Back
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEdit ? "Update Measurement" : "Create Measurement"}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}

