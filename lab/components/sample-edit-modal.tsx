"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface SampleEditModalProps {
  isOpen: boolean
  onClose: () => void
  sampleId: string
}

export default function SampleEditModal({ isOpen, onClose, sampleId }: SampleEditModalProps) {
  const [isLoading, setIsLoading] = useState(false)
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

  // Load sample data when modal opens
  useEffect(() => {
    if (isOpen && sampleId) {
      loadSampleData(sampleId)
    }
  }, [isOpen, sampleId])

  const loadSampleData = async (id: string) => {
    setIsLoading(true)
    try {
      // In a real implementation, this would fetch the sample from the backend
      // For now, we'll use mock data
      const mockSample = {
        id,
        identifier: "T250306A",
        name: "GaAs QW Structure",
        growthDate: "2025-03-06",
        substrate: "GaAs",
        grower: "Scott Sifferman",
        description: "Standard GaAs/AlGaAs quantum well structure grown at 600°C",
        recipeId: "r1",
        metadata: {
          substrateSize: '1/4 3"',
          backingWafer: "sapphire",
          rotationRpm: "5",
        },
      }

      setFormData(mockSample)
    } catch (error) {
      console.error("Error loading sample:", error)
      toast.error("Failed to load sample data")
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // In a real implementation, this would call a GraphQL mutation or API endpoint
      console.log("Form submitted:", formData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      toast.success("Sample updated successfully!")
      onClose()
    } catch (error) {
      console.error("Error updating sample:", error)
      toast.error("Failed to update sample")
    } finally {
      setIsLoading(false)
    }
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Sample</DialogTitle>
          <DialogDescription>Make changes to the sample information below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
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

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Additional Metadata</h3>
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
                  placeholder="5"
                  value={formData.metadata.rotationRpm}
                  onChange={handleMetadataChange}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

