"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useUI } from "@/hooks/use-ui"
import { useApi } from "@/hooks/use-api"
import { createMeasurement } from "@/services/measurement-service"
import { measurementFormSchema } from "@/lib/validations/schema"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { getSamples } from "@/services/sample-service"
import type { Sample } from "@/types/sample"

type MeasurementFormValues = z.infer<typeof measurementFormSchema>

interface MeasurementFormProps {
  sampleId?: string
}

export function MeasurementForm({ sampleId }: MeasurementFormProps) {
  const router = useRouter()
  const { addNotification } = useUI()
  const [samples, setSamples] = useState<Sample[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch samples for the dropdown
  useEffect(() => {
    async function fetchSamples() {
      try {
        setLoading(true)
        const samplesData = await getSamples()
        setSamples(samplesData)
      } catch (error) {
        console.error("Error fetching samples:", error)
        addNotification({
          type: "error",
          message: "Failed to load samples",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchSamples()
  }, [addNotification])

  // Initialize form with react-hook-form and zod validation
  const form = useForm<MeasurementFormValues>({
    resolver: zodResolver(measurementFormSchema),
    defaultValues: {
      name: "",
      type: "",
      sampleId: sampleId || "",
      date: new Date().toISOString().split("T")[0],
      peakPositions: "",
      fwhm: "",
      scanRange: "",
      scanStep: "",
      temperature: "",
      power: "",
    },
  })

  // Use our API hook for measurement creation
  const {
    loading: submitting,
    error,
    execute: executeMeasurementCreation,
  } = useApi(createMeasurement, {
    showSuccessNotification: true,
    successMessage: "Measurement created successfully",
    showErrorNotification: true,
  })

  // Handle form submission
  const onSubmit = async (data: MeasurementFormValues) => {
    try {
      // Generate a measurement ID based on sample ID and type
      const measurementNumber = Math.floor(Math.random() * 100) + 1
      const measurementId = `${data.sampleId}${measurementNumber}${data.type.toLowerCase()}`

      // Prepare metadata based on measurement type
      let metadata: Record<string, any> = {}

      switch (data.type) {
        case "xrd":
          metadata = {
            peakPositions: data.peakPositions,
            fwhm: data.fwhm,
            scanRange: data.scanRange,
            scanStep: data.scanStep,
          }
          break
        case "pl":
          metadata = {
            peakWavelength: data.peakPositions,
            fwhm: data.fwhm,
            temperature: data.temperature,
            power: data.power,
          }
          break
        case "hall":
          metadata = {
            temperature: data.temperature,
          }
          break
        default:
          metadata = {
            temperature: data.temperature,
          }
      }

      // Filter out undefined values
      Object.keys(metadata).forEach((key) => {
        if (metadata[key] === undefined || metadata[key] === "") {
          delete metadata[key]
        }
      })

      // Prepare measurement data with ID in the name
      const measurementData = {
        id: measurementId,
        name: `${measurementId} - ${data.name}`,
        type: data.type,
        sampleId: data.sampleId,
        date: new Date(data.date).toISOString(),
        metadata,
        data: [], // This would normally come from a file upload
        updatedAt: new Date().toISOString(),
      }

      // Create the measurement
      const result = await executeMeasurementCreation(measurementData)

      if (result) {
        // Navigate to the measurement detail page
        router.push(`/measurements/${result.id}`)
      }
    } catch (error) {
      console.error("Measurement creation error:", error)
    }
  }

  // Dynamically show fields based on measurement type
  const measurementType = form.watch("type")

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Measurement Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., XRD Measurement 1" {...field} />
                </FormControl>
                <FormDescription>A descriptive name for the measurement</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Measurement Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select measurement type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="xrd">XRD (X-Ray Diffraction)</SelectItem>
                    <SelectItem value="pl">PL (Photoluminescence)</SelectItem>
                    <SelectItem value="hall">Hall Effect</SelectItem>
                    <SelectItem value="afm">AFM (Atomic Force Microscopy)</SelectItem>
                    <SelectItem value="sem">SEM (Scanning Electron Microscopy)</SelectItem>
                    <SelectItem value="raman">Raman Spectroscopy</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>The type of measurement performed</FormDescription>
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
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loading || !!sampleId}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={loading ? "Loading samples..." : "Select a sample"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {samples.map((sample) => (
                      <SelectItem key={sample.id} value={sample.id}>
                        {sample.name} ({sample.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>The sample this measurement is associated with</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Measurement Date *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormDescription>The date when the measurement was performed</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {(measurementType === "xrd" || measurementType === "pl") && (
            <>
              <FormField
                control={form.control}
                name="peakPositions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{measurementType === "xrd" ? "Peak Positions" : "Peak Wavelength"}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={measurementType === "xrd" ? "e.g., 30.5, 45.2, 66.8" : "e.g., 550"}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {measurementType === "xrd"
                        ? "Comma-separated list of peak positions (in degrees)"
                        : "Peak wavelength (in nm)"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fwhm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>FWHM</FormLabel>
                    <FormControl>
                      <Input placeholder={measurementType === "xrd" ? "e.g., 0.2, 0.3, 0.4" : "e.g., 30"} {...field} />
                    </FormControl>
                    <FormDescription>
                      {measurementType === "xrd"
                        ? "Comma-separated list of full width at half maximum values"
                        : "Full width at half maximum (in nm)"}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {measurementType === "xrd" && (
            <>
              <FormField
                control={form.control}
                name="scanRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scan Range</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 20-80°" {...field} />
                    </FormControl>
                    <FormDescription>The angular range of the XRD scan</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scanStep"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scan Step</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 0.1°" {...field} />
                    </FormControl>
                    <FormDescription>The step size of the XRD scan</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {(measurementType === "pl" || measurementType === "hall") && (
            <>
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperature</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 300" {...field} />
                    </FormControl>
                    <FormDescription>The temperature during the measurement (in K)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

          {measurementType === "pl" && (
            <FormField
              control={form.control}
              name="power"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Power</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 10" {...field} />
                  </FormControl>
                  <FormDescription>The excitation power (in mW)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Measurement"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

