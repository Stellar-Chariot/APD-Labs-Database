"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createRecipe, getSamples } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Sample {
  id: number
  name: string
}

export function CreateRecipeButton() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [samples, setSamples] = useState<Sample[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const fetchSamples = async () => {
      try {
        const data = await getSamples()
        setSamples(data)
      } catch (error) {
        console.error("Failed to fetch samples:", error)
      }
    }

    if (open) {
      fetchSamples()
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await createRecipe(formData)

      toast({
        title: "Recipe created",
        description: "MBE recipe has been created successfully.",
      })

      setOpen(false)
    } catch (error) {
      console.error("Failed to create recipe:", error)
      toast({
        title: "Error",
        description: "Failed to create recipe. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Recipe</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New MBE Recipe</DialogTitle>
            <DialogDescription>Enter the details for your new growth recipe.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sample_id">Sample</Label>
              <Select name="sample_id" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sample" />
                </SelectTrigger>
                <SelectContent>
                  {samples.map((sample) => (
                    <SelectItem key={sample.id} value={sample.id.toString()}>
                      {sample.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="name">Recipe Name</Label>
              <Input id="name" name="name" placeholder="GaN HEMT Structure" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="growth_temperature">Temperature (°C)</Label>
                <Input
                  id="growth_temperature"
                  name="growth_temperature"
                  type="number"
                  step="0.01"
                  placeholder="750.00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="growth_pressure">Pressure</Label>
                <Input
                  id="growth_pressure"
                  name="growth_pressure"
                  type="number"
                  step="0.000001"
                  placeholder="0.000001"
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter recipe description..."
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Recipe"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
