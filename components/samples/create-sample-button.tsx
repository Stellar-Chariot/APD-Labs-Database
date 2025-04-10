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
import { createSample } from "@/lib/actions"
import { useToast } from "@/hooks/use-toast"

export function CreateSampleButton() {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await createSample(formData)

      toast({
        title: "Sample created",
        description: `Sample ${result.name} has been created successfully.`,
      })

      setOpen(false)
    } catch (error) {
      console.error("Failed to create sample:", error)
      toast({
        title: "Error",
        description: "Failed to create sample. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create Sample</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Sample</DialogTitle>
            <DialogDescription>Enter the details for your new scientific sample.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label htmlFor="equipment_code">Equipment</Label>
                <Input id="equipment_code" name="equipment_code" placeholder="T" maxLength={1} required />
              </div>
              <div>
                <Label htmlFor="year">Year</Label>
                <Input id="year" name="year" placeholder="25" maxLength={2} required />
              </div>
              <div>
                <Label htmlFor="month">Month</Label>
                <Input id="month" name="month" placeholder="03" maxLength={2} required />
              </div>
              <div>
                <Label htmlFor="day">Day</Label>
                <Input id="day" name="day" placeholder="06" maxLength={2} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="material">Material</Label>
                <Input id="material" name="material" placeholder="GaN" required />
              </div>
              <div>
                <Label htmlFor="sample_identifier">Identifier</Label>
                <Input id="sample_identifier" name="sample_identifier" placeholder="A" maxLength={1} required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter sample description..."
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Sample"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
