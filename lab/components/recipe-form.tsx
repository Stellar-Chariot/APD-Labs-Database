"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ChevronLeft, Plus, Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Layer {
  material: string
  thickness: string
  purpose: string
  composition: string
}

interface GrowthParameter {
  name: string
  value: string
  unit: string
}

export default function RecipeForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    identifier: "",
    name: "",
    growthDate: "",
    substrate: "",
    grower: "",
    description: "",
  })

  const [layers, setLayers] = useState<Layer[]>([{ material: "", thickness: "", purpose: "", composition: "" }])

  const [growthParameters, setGrowthParameters] = useState<GrowthParameter[]>([
    { name: "temperature", value: "", unit: "°C" },
    { name: "pressure", value: "", unit: "Torr" },
    { name: "growthRate", value: "", unit: "μm/hr" },
  ])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLayerChange = (index: number, field: keyof Layer, value: string) => {
    const updatedLayers = [...layers]
    updatedLayers[index][field] = value
    setLayers(updatedLayers)
  }

  const addLayer = () => {
    setLayers([...layers, { material: "", thickness: "", purpose: "", composition: "" }])
  }

  const removeLayer = (index: number) => {
    if (layers.length > 1) {
      const updatedLayers = [...layers]
      updatedLayers.splice(index, 1)
      setLayers(updatedLayers)
    }
  }

  const handleParameterChange = (index: number, field: keyof GrowthParameter, value: string) => {
    const updatedParams = [...growthParameters]
    updatedParams[index][field] = value
    setGrowthParameters(updatedParams)
  }

  const addParameter = () => {
    setGrowthParameters([...growthParameters, { name: "", value: "", unit: "" }])
  }

  const removeParameter = (index: number) => {
    if (growthParameters.length > 1) {
      const updatedParams = [...growthParameters]
      updatedParams.splice(index, 1)
      setGrowthParameters(updatedParams)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    if (!formData.identifier || !formData.name || !formData.substrate || !formData.grower) {
      toast.error("Please fill in all required fields")
      return
    }

    // Validate layers
    const invalidLayers = layers.some((layer) => !layer.material || !layer.thickness)
    if (invalidLayers) {
      toast.error("Please fill in material and thickness for all layers")
      return
    }

    // In a real implementation, this would call a GraphQL mutation
    console.log("Form submitted:", { ...formData, layers, growthParameters })

    toast.success("Recipe created successfully!")
    router.push("/recipes")
  }

  const handleCancel = () => {
    router.push("/recipes")
  }

  // Mock data for dropdowns
  const substrates = ["GaAs", "InP", "Sapphire", "SiC", "Si", "GaN"]
  const growers = ["Scott Sifferman", "Maria Chen", "James Wilson"]
  const materials = ["GaAs", "AlAs", "AlGaAs", "InGaAs", "GaN", "AlGaN", "InGaN"]

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={handleCancel}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add New Recipe</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Recipe Information</CardTitle>
            <CardDescription>Enter the basic details for this MBE recipe</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="identifier">Recipe ID</Label>
                <Input
                  id="identifier"
                  name="identifier"
                  placeholder="B200319A"
                  value={formData.identifier}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-muted-foreground">Format: B[YY][MM][DD][Letter]</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Recipe Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="GaAs/AlGaAs QW"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="growthDate">Growth Date</Label>
                <Input
                  id="growthDate"
                  name="growthDate"
                  type="date"
                  value={formData.growthDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="substrate">Substrate</Label>
                <Select value={formData.substrate} onValueChange={(value) => handleSelectChange("substrate", value)}>
                  <SelectTrigger id="substrate">
                    <SelectValue placeholder="Select substrate" />
                  </SelectTrigger>
                  <SelectContent>
                    {substrates.map((substrate) => (
                      <SelectItem key={substrate} value={substrate}>
                        {substrate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="grower">Grower</Label>
                <Select value={formData.grower} onValueChange={(value) => handleSelectChange("grower", value)}>
                  <SelectTrigger id="grower">
                    <SelectValue placeholder="Select grower" />
                  </SelectTrigger>
                  <SelectContent>
                    {growers.map((grower) => (
                      <SelectItem key={grower} value={grower}>
                        {grower}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter a description of this recipe..."
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </CardContent>

          <CardHeader>
            <CardTitle>Layer Structure</CardTitle>
            <CardDescription>Define the layers in this recipe (from top to bottom)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {layers.map((layer, index) => (
              <div key={index} className="grid grid-cols-1 gap-4 sm:grid-cols-5 p-3 border rounded-md bg-muted/10">
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor={`layer-${index}-material`}>Material</Label>
                  <Select value={layer.material} onValueChange={(value) => handleLayerChange(index, "material", value)}>
                    <SelectTrigger id={`layer-${index}-material`}>
                      <SelectValue placeholder="Material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materials.map((material) => (
                        <SelectItem key={material} value={material}>
                          {material}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor={`layer-${index}-thickness`}>Thickness (Å)</Label>
                  <Input
                    id={`layer-${index}-thickness`}
                    type="number"
                    placeholder="100"
                    value={layer.thickness}
                    onChange={(e) => handleLayerChange(index, "thickness", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor={`layer-${index}-purpose`}>Purpose</Label>
                  <Input
                    id={`layer-${index}-purpose`}
                    placeholder="cap"
                    value={layer.purpose}
                    onChange={(e) => handleLayerChange(index, "purpose", e.target.value)}
                  />
                </div>

                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor={`layer-${index}-composition`}>Composition</Label>
                  <Input
                    id={`layer-${index}-composition`}
                    placeholder="Al0.3Ga0.7As"
                    value={layer.composition}
                    onChange={(e) => handleLayerChange(index, "composition", e.target.value)}
                  />
                </div>

                <div className="flex items-end justify-end sm:col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeLayer(index)}
                    disabled={layers.length <= 1}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addLayer} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Layer
            </Button>
          </CardContent>

          <CardHeader>
            <CardTitle>Growth Parameters</CardTitle>
            <CardDescription>Define the growth conditions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {growthParameters.map((param, index) => (
              <div key={index} className="grid grid-cols-1 gap-4 sm:grid-cols-4 p-3 border rounded-md bg-muted/10">
                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor={`param-${index}-name`}>Parameter</Label>
                  <Input
                    id={`param-${index}-name`}
                    placeholder="temperature"
                    value={param.name}
                    onChange={(e) => handleParameterChange(index, "name", e.target.value)}
                  />
                </div>

                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor={`param-${index}-value`}>Value</Label>
                  <Input
                    id={`param-${index}-value`}
                    placeholder="600"
                    value={param.value}
                    onChange={(e) => handleParameterChange(index, "value", e.target.value)}
                  />
                </div>

                <div className="space-y-2 sm:col-span-1">
                  <Label htmlFor={`param-${index}-unit`}>Unit</Label>
                  <Input
                    id={`param-${index}-unit`}
                    placeholder="°C"
                    value={param.unit}
                    onChange={(e) => handleParameterChange(index, "unit", e.target.value)}
                  />
                </div>

                <div className="flex items-end justify-end sm:col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeParameter(index)}
                    disabled={growthParameters.length <= 1}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" onClick={addParameter} className="w-full">
              <Plus className="mr-2 h-4 w-4" /> Add Parameter
            </Button>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              Save Recipe
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

