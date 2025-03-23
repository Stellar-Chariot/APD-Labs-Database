"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"

export default function SampleForm() {
  const [formData, setFormData] = useState({
    identifier: "",
    name: "",
    growthDate: "",
    substrate: "",
    grower: "",
    description: "",
    recipeId: "",
    metadata: {
      substrateSize: "",
      backingWafer: "",
      rotationRpm: "",
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [name]: value,
      },
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // In a real implementation, this would call a GraphQL mutation
  }

  // Mock data for dropdowns
  const substrates = ["GaAs", "InP", "Sapphire", "SiC", "Si", "GaN"]
  const growers = ["Scott Sifferman", "Maria Chen", "James Wilson"]
  const recipes = [
    { id: "r1", name: "B200319A - GaAs QW" },
    { id: "r2", name: "B200320B - AlGaAs Barrier" },
    { id: "r3", name: "B200321C - InGaAs QD" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/samples">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Add New Sample</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Sample Information</CardTitle>
            <CardDescription>Enter the basic details for this sample</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="identifier">Sample ID</Label>
                <Input
                  id="identifier"
                  name="identifier"
                  placeholder="T250306A"
                  value={formData.identifier}
                  onChange={handleChange}
                  required
                />
                <p className="text-xs text-muted-foreground">Format: T[YY][MM][DD][Letter]</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Sample Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="GaAs QW Structure"
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

              <div className="space-y-2">
                <Label htmlFor="recipeId">MBE Recipe</Label>
                <Select value={formData.recipeId} onValueChange={(value) => handleSelectChange("recipeId", value)}>
                  <SelectTrigger id="recipeId">
                    <SelectValue placeholder="Select recipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {recipes.map((recipe) => (
                      <SelectItem key={recipe.id} value={recipe.id}>
                        {recipe.name}
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
                placeholder="Enter a description of this sample..."
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </div>
          </CardContent>

          <CardHeader>
            <CardTitle>Additional Metadata</CardTitle>
            <CardDescription>Optional additional information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="substrateSize">Substrate Size</Label>
                <Input
                  id="substrateSize"
                  name="substrateSize"
                  placeholder="1/4 3&quot;"
                  value={formData.metadata.substrateSize}
                  onChange={handleMetadataChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backingWafer">Backing Wafer</Label>
                <Input
                  id="backingWafer"
                  name="backingWafer"
                  placeholder="sapphire"
                  value={formData.metadata.backingWafer}
                  onChange={handleMetadataChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="rotationRpm">Rotation (RPM)</Label>
                <Input
                  id="rotationRpm"
                  name="rotationRpm"
                  type="number"
                  placeholder="5"
                  value={formData.metadata.rotationRpm}
                  onChange={handleMetadataChange}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/samples">Cancel</Link>
            </Button>
            <Button type="submit">Save Sample</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

