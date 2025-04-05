"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { useCreateRecipe, useUpdateRecipe } from "@/hooks/use-query-recipes"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { useSamplesQuery } from "@/hooks/use-query-samples"
import type { MBERecipe } from "@/types/mbe-recipe"

// Define the form schema
const recipeFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  sampleId: z.string().min(1, "Sample ID is required"),
  description: z.string().optional(),
  substrateTemperature: z.string().optional(),
  galliumFlux: z.string().optional(),
  nitrogenFlow: z.string().optional(),
  growthTime: z.string().optional(),
  chamberPressure: z.string().optional(),
  additionalParams: z.string().optional(),
  layerStructure: z.string().optional(),
})

type RecipeFormValues = z.infer<typeof recipeFormSchema>

interface RecipeFormProps {
  initialData?: MBERecipe
  isEditing?: boolean
}

export function RecipeForm({ initialData, isEditing = false }: RecipeFormProps) {
  const router = useRouter()
  const createRecipeMutation = useCreateRecipe()
  const updateRecipeMutation = useUpdateRecipe()
  const [loading, setLoading] = useState(false)

  // Fetch samples for the dropdown
  const { data: samples, isLoading: samplesLoading } = useSamplesQuery()

  // Update the RecipeForm component to handle initialData with just a sampleId
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      sampleId: initialData?.sampleId || "",
      description: initialData?.description || "",
      substrateTemperature: initialData?.growthParameters?.substrateTemperature || "",
      galliumFlux: initialData?.growthParameters?.galliumFlux || "",
      nitrogenFlow: initialData?.growthParameters?.nitrogenFlow || "",
      growthTime: initialData?.growthParameters?.growthTime || "",
      chamberPressure: initialData?.growthParameters?.chamberPressure || "",
      additionalParams: initialData?.growthParameters?.additionalParams || "",
      layerStructure: initialData?.growthParameters?.layerStructure || "",
    },
  })

  // Update form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        sampleId: initialData.sampleId || "",
        description: initialData.description || "",
        substrateTemperature: initialData.growthParameters?.substrateTemperature || "",
        galliumFlux: initialData.growthParameters?.galliumFlux || "",
        nitrogenFlow: initialData.growthParameters?.nitrogenFlow || "",
        growthTime: initialData.growthParameters?.growthTime || "",
        chamberPressure: initialData.growthParameters?.chamberPressure || "",
        additionalParams: initialData.growthParameters?.additionalParams || "",
        layerStructure: initialData.growthParameters?.layerStructure || "",
      })
    }
  }, [initialData, form])

  // Handle form submission
  const onSubmit = async (data: RecipeFormValues) => {
    setLoading(true)
    try {
      // Get the sample name for the selected sample
      const selectedSample = samples?.find((s) => s.id === data.sampleId)

      // Prepare recipe data with sample ID in the name
      const recipeData = {
        name: `${data.sampleId} - ${data.name}`,
        sampleId: data.sampleId,
        description: data.description,
        growthParameters: {
          substrateTemperature: data.substrateTemperature,
          galliumFlux: data.galliumFlux,
          nitrogenFlow: data.nitrogenFlow,
          growthTime: data.growthTime,
          chamberPressure: data.chamberPressure,
          additionalParams: data.additionalParams,
          layerStructure: data.layerStructure,
        },
        updatedAt: new Date().toISOString(),
      }

      if (isEditing && initialData) {
        // Update existing recipe
        const result = await updateRecipeMutation.mutateAsync({
          id: initialData.id,
          data: recipeData,
        })

        if (result) {
          router.push(`/recipes/${result.id}`)
        }
      } else {
        // Create new recipe
        const result = await createRecipeMutation.mutateAsync(recipeData)

        if (result) {
          router.push(`/recipes/${result.id}`)
        }
      }
    } catch (error) {
      console.error("Recipe form submission error:", error)
    } finally {
      setLoading(false)
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
                <FormLabel>Recipe Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., GaN on Si MBE Recipe" {...field} />
                </FormControl>
                <FormDescription>A descriptive name for the MBE recipe</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sampleId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sample *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={samplesLoading}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={samplesLoading ? "Loading samples..." : "Select a sample"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {samples?.map((sample) => (
                      <SelectItem key={sample.id} value={sample.id}>
                        {sample.name} ({sample.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>The sample this recipe is associated with</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="substrateTemperature"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Substrate Temperature</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 750°C" {...field} />
                </FormControl>
                <FormDescription>The substrate temperature during growth</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="galliumFlux"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gallium Flux</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 5.2e-7 Torr" {...field} />
                </FormControl>
                <FormDescription>The gallium flux during growth</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="nitrogenFlow"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nitrogen Flow</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 2.5 sccm" {...field} />
                </FormControl>
                <FormDescription>The nitrogen flow rate during growth</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="growthTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Growth Time</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 120 min" {...field} />
                </FormControl>
                <FormDescription>The total growth time</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="chamberPressure"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Chamber Pressure</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 2.1e-5 Torr" {...field} />
                </FormControl>
                <FormDescription>The chamber pressure during growth</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="additionalParams"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Parameters</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Rotation speed: 10 rpm" {...field} />
                </FormControl>
                <FormDescription>Any additional growth parameters</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="layerStructure"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Layer Structure</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter the layer structure (e.g., 100 Ang GaAs, 3000 Ang AlGaAs, etc.)"
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe the layer structure from top to bottom, including material types and thicknesses
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a detailed description of the MBE recipe..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>Detailed information about the growth process, layer structure, etc.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || createRecipeMutation.isPending || updateRecipeMutation.isPending}>
            {loading || createRecipeMutation.isPending || updateRecipeMutation.isPending
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
                ? "Update Recipe"
                : "Create Recipe"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

