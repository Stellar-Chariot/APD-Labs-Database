"use client"

import type React from "react"

import { useState } from "react"
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
import { addRecipeLayer } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"
import { Plus } from "lucide-react"

export function AddRecipeLayerButton({ recipeId, nextLayerNumber }: { recipeId: number; nextLayerNumber: number }) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.append("recipe_id", recipeId.toString())

      const result = await addRecipeLayer(formData)

      toast({
        title: "Layer added",
        description: "Recipe layer has been added successfully.",
      })

      setOpen(false)
    } catch (error) {
      console.error("Failed to add recipe layer:", error)
      toast({
        title: "Error",
        description: "Failed to add recipe layer. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Layer
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Recipe Layer</DialogTitle>
            <DialogDescription>Add a new layer to this MBE recipe.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="layer_number">Layer Number</Label>
                <Input id="layer_number" name="layer_number" type="number" defaultValue={nextLayerNumber} required />
              </div>
              <div>
                <Label htmlFor="material">Material</Label>
                <Input id="material" name="material" placeholder="GaN" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="thickness">Thickness (Å)</Label>
                <Input id="thickness" name="thickness" type="number" step="0.01" placeholder="1000.00" required />
              </div>
              <div>
                <Label htmlFor="growth_time">Growth Time (s)</Label>
                <Input id="growth_time" name="growth_time" type="number" placeholder="3600" required />
              </div>
            </div>
            <div>
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input id="temperature" name="temperature" type="number" step="0.01" placeholder="750.00" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter layer description..."
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Layer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
