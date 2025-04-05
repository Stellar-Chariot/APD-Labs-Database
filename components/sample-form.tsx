"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useCreateSample } from "@/hooks/use-query-samples"
import { sampleFormSchema } from "@/lib/validations/schema"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type SampleFormValues = z.infer<typeof sampleFormSchema>

export function SampleForm() {
  const router = useRouter()
  const createSampleMutation = useCreateSample()

  // Initialize form with react-hook-form and zod validation
  const form = useForm<SampleFormValues>({
    resolver: zodResolver(sampleFormSchema),
    defaultValues: {
      name: "",
      type: "",
      description: "",
      substrate: "",
      growthMethod: "",
      thickness: "",
      orientation: "",
    },
  })

  // Handle form submission
  const onSubmit = async (data: SampleFormValues) => {
    try {
      // Generate a sample ID if not provided
      const sampleId = crypto.randomUUID().substring(0, 8).toUpperCase()

      // Prepare sample data with ID in the name
      const sampleData = {
        name: `${sampleId} - ${data.name}`,
        type: data.type,
        description: data.description,
        metadata: {
          substrate: data.substrate,
          growthMethod: data.growthMethod,
          thickness: data.thickness,
          orientation: data.orientation,
        },
        updatedAt: new Date().toISOString(),
      }

      // Create the sample using React Query mutation
      const result = await createSampleMutation.mutateAsync(sampleData)

      if (result) {
        // Navigate to the sample detail page
        router.push(`/samples/${result.id}`)
      }
    } catch (error) {
      console.error("Sample creation error:", error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sample Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., GaN Sample A" {...field} />
                </FormControl>
                <FormDescription>A descriptive name for the sample</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sample Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sample type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="GaN">GaN</SelectItem>
                    <SelectItem value="AlGaN">AlGaN</SelectItem>
                    <SelectItem value="InGaN">InGaN</SelectItem>
                    <SelectItem value="AlInGaN">AlInGaN</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>The material type of the sample</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="substrate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Substrate</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select substrate" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Sapphire">Sapphire</SelectItem>
                    <SelectItem value="Silicon">Silicon</SelectItem>
                    <SelectItem value="SiC">SiC</SelectItem>
                    <SelectItem value="GaN">GaN</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>The substrate material</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="growthMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Growth Method</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select growth method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="MOCVD">MOCVD</SelectItem>
                    <SelectItem value="MBE">MBE</SelectItem>
                    <SelectItem value="HVPE">HVPE</SelectItem>
                    <SelectItem value="PLD">PLD</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>The method used to grow the sample</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="thickness"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Thickness</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 2.5 μm" {...field} />
                </FormControl>
                <FormDescription>The thickness of the sample</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="orientation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Orientation</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select orientation" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="(0001)">(0001)</SelectItem>
                    <SelectItem value="(11-20)">(11-20)</SelectItem>
                    <SelectItem value="(1-100)">(1-100)</SelectItem>
                    <SelectItem value="(111)">(111)</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>The crystallographic orientation</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a detailed description of the sample..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Detailed information about the sample structure, growth conditions, etc.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={createSampleMutation.isPending}>
            {createSampleMutation.isPending ? "Creating..." : "Create Sample"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

