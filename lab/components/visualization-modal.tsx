"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Save, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { visualizationService } from "@/services/visualization-service"
import { measurementService } from "@/services/measurement-service"

// Visualization presets
const VISUALIZATION_PRESETS = [
  {
    id: "pl-temp",
    name: "Temperature Dependent PL",
    description: "Compare PL spectra at different temperatures",
    config: {
      xAxis: "wavelength",
      yAxis: "intensity",
      normalize: true,
      chartType: "line",
      colorScheme: "spectral",
      showLegend: true,
      showGrid: true,
      xLabel: "Wavelength (nm)",
      yLabel: "Intensity (a.u.)",
    },
  },
  {
    id: "el-voltage",
    name: "Voltage Dependent EL",
    description: "Compare electroluminescence at different voltages",
    config: {
      xAxis: "wavelength",
      yAxis: "intensity",
      normalize: true,
      chartType: "line",
      colorScheme: "viridis",
      showLegend: true,
      showGrid: true,
      xLabel: "Wavelength (nm)",
      yLabel: "Intensity (a.u.)",
    },
  },
  {
    id: "pr-power",
    name: "Power Dependent PR",
    description: "Compare photoreflectance at different excitation powers",
    config: {
      xAxis: "energy",
      yAxis: "delta_r_r",
      normalize: false,
      chartType: "line",
      colorScheme: "plasma",
      showLegend: true,
      showGrid: true,
      xLabel: "Energy (eV)",
      yLabel: "ΔR/R",
    },
  },
  {
    id: "xrd-comparison",
    name: "XRD Comparison",
    description: "Compare XRD patterns from different samples",
    config: {
      xAxis: "angle",
      yAxis: "intensity",
      normalize: false,
      chartType: "line",
      colorScheme: "gray",
      showLegend: true,
      showGrid: true,
      xLabel: "2θ (degrees)",
      yLabel: "Intensity (counts)",
    },
  },
  {
    id: "custom",
    name: "Custom Visualization",
    description: "Start with a blank configuration",
    config: {
      xAxis: "wavelength",
      yAxis: "intensity",
      normalize: false,
      chartType: "line",
      colorScheme: "default",
      showLegend: true,
      showGrid: true,
      xLabel: "X Axis",
      yLabel: "Y Axis",
    },
  },
]

// Mock function to get user's saved presets
const getUserPresets = () => {
  // In a real app, this would fetch from an API or local storage
  const savedPresets = localStorage.getItem("userVisualizationPresets")
  return savedPresets ? JSON.parse(savedPresets) : []
}

// Mock function to save a user preset
const saveUserPreset = (preset) => {
  // In a real app, this would save to an API or local storage
  const currentPresets = getUserPresets()
  const updatedPresets = [...currentPresets, preset]
  localStorage.setItem("userVisualizationPresets", JSON.stringify(updatedPresets))
  return preset
}

// Mock function to delete a user preset
const deleteUserPreset = (presetId) => {
  // In a real app, this would delete from an API or local storage
  const currentPresets = getUserPresets()
  const updatedPresets = currentPresets.filter((p) => p.id !== presetId)
  localStorage.setItem("userVisualizationPresets", JSON.stringify(updatedPresets))
}

interface VisualizationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function VisualizationModal({ isOpen, onClose, onSuccess }: VisualizationModalProps) {
  const [activeTab, setActiveTab] = useState("files")
  const [selectedPreset, setSelectedPreset] = useState("custom")
  const [userPresets, setUserPresets] = useState([])
  const [isSavingPreset, setIsSavingPreset] = useState(false)
  const [newPresetName, setNewPresetName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [measurements, setMeasurements] = useState([])
  const [isLoadingMeasurements, setIsLoadingMeasurements] = useState(false)

  // Create visualization form state
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    files: [],
    config: {
      xAxis: "wavelength",
      yAxis: "intensity",
      normalize: false,
      chartType: "line",
      colorScheme: "default",
      showLegend: true,
      showGrid: true,
      xLabel: "X Axis",
      yLabel: "Y Axis",
    },
  })

  // Load user presets on component mount
  useEffect(() => {
    if (isOpen) {
      setUserPresets(getUserPresets())
      loadMeasurements()
    }
  }, [isOpen])

  // Load measurements for selection
  const loadMeasurements = async () => {
    try {
      setIsLoadingMeasurements(true)
      const data = await measurementService.getMeasurements()
      setMeasurements(data)
    } catch (error) {
      console.error("Error loading measurements:", error)
      toast.error("Failed to load measurements")
    } finally {
      setIsLoadingMeasurements(false)
    }
  }

  // Reset form when dialog closes
  const handleClose = () => {
    setCreateForm({
      title: "",
      description: "",
      files: [],
      config: {
        xAxis: "wavelength",
        yAxis: "intensity",
        normalize: false,
        chartType: "line",
        colorScheme: "default",
        showLegend: true,
        showGrid: true,
        xLabel: "X Axis",
        yLabel: "Y Axis",
      },
    })
    setActiveTab("files")
    setSelectedPreset("custom")
    onClose()
  }

  // Apply preset to form
  const handleApplyPreset = (presetId) => {
    setSelectedPreset(presetId)

    // Find the selected preset
    const preset = [...VISUALIZATION_PRESETS, ...userPresets].find((p) => p.id === presetId)

    if (preset) {
      setCreateForm((prev) => ({
        ...prev,
        config: preset.config,
      }))

      // If it's a named preset (not custom), suggest a title
      if (presetId !== "custom") {
        setCreateForm((prev) => ({
          ...prev,
          title: preset.name,
          description: preset.description,
        }))
      }
    }
  }

  // Handle file selection
  const handleFileSelection = (fileId) => {
    setCreateForm((prev) => {
      const files = prev.files.includes(fileId) ? prev.files.filter((id) => id !== fileId) : [...prev.files, fileId]

      return { ...prev, files }
    })
  }

  // Save current configuration as a user preset
  const handleSavePreset = () => {
    if (!newPresetName.trim()) {
      toast.error("Please enter a name for your preset")
      return
    }

    setIsSavingPreset(true)

    try {
      const newPreset = {
        id: `user-${Date.now()}`,
        name: newPresetName,
        description: "User created preset",
        config: createForm.config,
      }

      saveUserPreset(newPreset)
      setUserPresets(getUserPresets())
      setNewPresetName("")
      setIsSavingPreset(false)
      toast.success("Preset saved successfully")
    } catch (error) {
      console.error("Error saving preset:", error)
      toast.error("Failed to save preset")
      setIsSavingPreset(false)
    }
  }

  // Delete a user preset
  const handleDeletePreset = (presetId) => {
    try {
      deleteUserPreset(presetId)
      setUserPresets(getUserPresets())
      toast.success("Preset deleted successfully")
    } catch (error) {
      console.error("Error deleting preset:", error)
      toast.error("Failed to delete preset")
    }
  }

  // Update config settings
  const handleConfigChange = (key, value) => {
    setCreateForm((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value,
      },
    }))
  }

  const handleCreateVisualization = async () => {
    try {
      // Validate form
      if (!createForm.title || createForm.files.length === 0) {
        toast.error("Please fill in all required fields and select at least one file")
        return
      }

      setIsSubmitting(true)

      // Create visualization
      await visualizationService.createVisualization({
        title: createForm.title,
        description: createForm.description,
        type: "custom", // All visualizations are now custom
        measurements: createForm.files, // Using files instead of measurements
        config: createForm.config,
      })

      // Reset form and close dialog
      handleClose()
      onSuccess()
      toast.success("Visualization created successfully")
    } catch (error) {
      console.error("Error creating visualization:", error)
      toast.error("Failed to create visualization")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Visualization</DialogTitle>
          <DialogDescription>Create a custom visualization or use a preset</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="files">Select Files</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
          </TabsList>

          {/* Files Tab */}
          <TabsContent value="files" className="space-y-4 py-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title*
                </Label>
                <Input
                  id="title"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="col-span-3"
                  rows={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Select Files*</Label>
              <div className="col-span-3 border rounded-md p-3 max-h-60 overflow-y-auto">
                {isLoadingMeasurements ? (
                  <div className="flex justify-center items-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : measurements.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No files available</p>
                ) : (
                  <div className="space-y-2">
                    {measurements.map((measurement) => (
                      <div
                        key={measurement.id}
                        className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md"
                      >
                        <Checkbox
                          id={`file-${measurement.id}`}
                          checked={createForm.files.includes(measurement.id)}
                          onCheckedChange={() => handleFileSelection(measurement.id)}
                        />
                        <div className="flex-1">
                          <Label htmlFor={`file-${measurement.id}`} className="cursor-pointer font-medium">
                            {measurement.title}
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            {measurement.measurementType} • {new Date(measurement.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Configuration Tab */}
          <TabsContent value="config" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="xAxis">X-Axis Data</Label>
                <Select value={createForm.config.xAxis} onValueChange={(value) => handleConfigChange("xAxis", value)}>
                  <SelectTrigger id="xAxis">
                    <SelectValue placeholder="Select X-Axis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wavelength">Wavelength (nm)</SelectItem>
                    <SelectItem value="energy">Energy (eV)</SelectItem>
                    <SelectItem value="angle">Angle (degrees)</SelectItem>
                    <SelectItem value="time">Time (s)</SelectItem>
                    <SelectItem value="temperature">Temperature (K)</SelectItem>
                    <SelectItem value="voltage">Voltage (V)</SelectItem>
                    <SelectItem value="current">Current (mA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="yAxis">Y-Axis Data</Label>
                <Select value={createForm.config.yAxis} onValueChange={(value) => handleConfigChange("yAxis", value)}>
                  <SelectTrigger id="yAxis">
                    <SelectValue placeholder="Select Y-Axis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="intensity">Intensity (a.u.)</SelectItem>
                    <SelectItem value="normalized">Normalized Intensity</SelectItem>
                    <SelectItem value="delta_r_r">ΔR/R</SelectItem>
                    <SelectItem value="transmittance">Transmittance (%)</SelectItem>
                    <SelectItem value="absorbance">Absorbance</SelectItem>
                    <SelectItem value="counts">Counts</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="xLabel">X-Axis Label</Label>
                <Input
                  id="xLabel"
                  value={createForm.config.xLabel}
                  onChange={(e) => handleConfigChange("xLabel", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yLabel">Y-Axis Label</Label>
                <Input
                  id="yLabel"
                  value={createForm.config.yLabel}
                  onChange={(e) => handleConfigChange("yLabel", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="chartType">Chart Type</Label>
                <Select
                  value={createForm.config.chartType}
                  onValueChange={(value) => handleConfigChange("chartType", value)}
                >
                  <SelectTrigger id="chartType">
                    <SelectValue placeholder="Select Chart Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="scatter">Scatter Plot</SelectItem>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="area">Area Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="colorScheme">Color Scheme</Label>
                <Select
                  value={createForm.config.colorScheme}
                  onValueChange={(value) => handleConfigChange("colorScheme", value)}
                >
                  <SelectTrigger id="colorScheme">
                    <SelectValue placeholder="Select Color Scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="spectral">Spectral</SelectItem>
                    <SelectItem value="viridis">Viridis</SelectItem>
                    <SelectItem value="plasma">Plasma</SelectItem>
                    <SelectItem value="gray">Grayscale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="normalize"
                  checked={createForm.config.normalize}
                  onCheckedChange={(checked) => handleConfigChange("normalize", checked)}
                />
                <Label htmlFor="normalize">Normalize Data</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showLegend"
                  checked={createForm.config.showLegend}
                  onCheckedChange={(checked) => handleConfigChange("showLegend", checked)}
                />
                <Label htmlFor="showLegend">Show Legend</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="showGrid"
                  checked={createForm.config.showGrid}
                  onCheckedChange={(checked) => handleConfigChange("showGrid", checked)}
                />
                <Label htmlFor="showGrid">Show Grid</Label>
              </div>
            </div>
          </TabsContent>

          {/* Presets Tab */}
          <TabsContent value="presets" className="space-y-4 py-4">
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Built-in Presets</Label>
                <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
                  {VISUALIZATION_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      className={`p-2 rounded-md cursor-pointer flex items-center justify-between ${
                        selectedPreset === preset.id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"
                      }`}
                      onClick={() => handleApplyPreset(preset.id)}
                    >
                      <div>
                        <p className="font-medium">{preset.name}</p>
                        <p className="text-xs text-muted-foreground">{preset.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleApplyPreset(preset.id)
                        }}
                      >
                        Apply
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {userPresets.length > 0 && (
                <div>
                  <Label className="mb-2 block">Your Saved Presets</Label>
                  <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto border rounded-md p-2">
                    {userPresets.map((preset) => (
                      <div
                        key={preset.id}
                        className={`p-2 rounded-md cursor-pointer flex items-center justify-between ${
                          selectedPreset === preset.id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted"
                        }`}
                        onClick={() => handleApplyPreset(preset.id)}
                      >
                        <div>
                          <p className="font-medium">{preset.name}</p>
                          <p className="text-xs text-muted-foreground">{preset.description}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleApplyPreset(preset.id)
                            }}
                          >
                            Apply
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeletePreset(preset.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t">
                <Label className="mb-2 block">Save Current Configuration as Preset</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Preset name"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                  />
                  <Button onClick={handleSavePreset} disabled={isSavingPreset || !newPresetName.trim()}>
                    {isSavingPreset ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleCreateVisualization} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              "Create Visualization"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

