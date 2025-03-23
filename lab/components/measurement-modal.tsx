"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileUp, Loader2, Save, Upload } from "lucide-react"
import { toast } from "sonner"
import { measurementService } from "@/services/measurement-service"
import type { MeasurementType, MeasurementParameter, MeasurementFormState } from "@/types/measurement-types"

interface MeasurementModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  sampleId?: string
}

export default function MeasurementModal({ isOpen, onClose, onSuccess, sampleId }: MeasurementModalProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>([])
  const [parameters, setParameters] = useState<MeasurementParameter[]>([])
  const [errors, setErrors] = useState<any>({})
  const [entryMethod, setEntryMethod] = useState<"import" | "manual">("import")
  const [csvText, setCsvText] = useState("")

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

  // Load measurement types when the modal opens
  useEffect(() => {
    async function loadMeasurementTypes() {
      if (!isOpen) return

      setIsLoading(true)
      try {
        const types = await measurementService.getMeasurementTypes()
        console.log("Loaded measurement types:", types)
        setMeasurementTypes(types)
      } catch (err) {
        console.error("Error loading measurement types:", err)
        toast.error("Failed to load measurement types")
      } finally {
        setIsLoading(false)
      }
    }

    loadMeasurementTypes()
  }, [isOpen])

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

      // Initialize parameters with default values
      setFormData((prev) => ({
        ...prev,
        parameters: params.map((p) => ({
          id: p.id,
          name: p.name,
          value: p.defaultValue || "",
          unit: p.unit,
        })),
      }))
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

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors in the form")
      return
    }

    setIsSaving(true)

    try {
      await measurementService.createMeasurement(formData)
      toast.success("Measurement created successfully")
      onSuccess()
      onClose()
      // Reset form
      setFormData({
        title: "",
        description: "",
        measurementType: "",
        sampleId: sampleId || "",
        parameters: [],
        files: [],
        notes: "",
        tags: [],
      })
    } catch (err) {
      console.error("Error saving measurement:", err)
      toast.error("Failed to save measurement")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Measurement</DialogTitle>
          <DialogDescription>Create a new measurement record in the system</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
            <TabsTrigger value="data">Data Entry</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4">
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
              {isLoading ? (
                <div className="flex items-center space-x-2 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Loading measurement types...</span>
                </div>
              ) : (
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
              )}
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
          </TabsContent>

          {/* Parameters Tab */}
          <TabsContent value="parameters" className="space-y-4">
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
          </TabsContent>

          {/* Data Entry Tab */}
          <TabsContent value="data" className="space-y-4">
            <Tabs value={entryMethod} onValueChange={(v) => setEntryMethod(v as "import" | "manual")}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="import">Import Document</TabsTrigger>
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              </TabsList>

              {/* Import Document Tab */}
              <TabsContent value="import" className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileUp className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Import Measurement Data</h3>
                  <p className="text-sm text-muted-foreground mb-4">Upload data files for this measurement</p>

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
                    <Upload className="mr-2 h-4 w-4" />
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
              </TabsContent>

              {/* Manual Entry Tab */}
              <TabsContent value="manual" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csv-input">Paste CSV Data</Label>
                  <Textarea
                    id="csv-input"
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder="Paste your CSV data here (comma-separated values)..."
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
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
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between mt-6">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <div className="flex gap-2">
            {activeTab !== "basic" && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  const tabs = ["basic", "parameters", "data", "notes"]
                  const currentIndex = tabs.indexOf(activeTab)
                  setActiveTab(tabs[currentIndex - 1])
                }}
              >
                Previous
              </Button>
            )}

            {activeTab !== "notes" ? (
              <Button
                type="button"
                onClick={() => {
                  const tabs = ["basic", "parameters", "data", "notes"]
                  const currentIndex = tabs.indexOf(activeTab)
                  setActiveTab(tabs[currentIndex + 1])
                }}
              >
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Measurement
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

