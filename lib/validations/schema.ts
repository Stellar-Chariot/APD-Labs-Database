import { z } from "zod"

// Sample validation schema
export const sampleSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  type: z.string().min(1, "Type is required"),
  description: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
})

// Measurement validation schema
export const measurementSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  type: z.string().min(1, "Type is required"),
  sampleId: z.string().min(1, "Sample ID is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  metadata: z.record(z.string(), z.any()).optional(),
})

// File upload validation schema
export const fileUploadSchema = z.object({
  file: z
    .instanceof(File, { message: "Please select a file" })
    .refine((file) => file.size <= 10 * 1024 * 1024, {
      message: "File size must be less than 10MB",
    })
    .refine(
      (file) => {
        const validExtensions = [".csv", ".txt", ".xlsx", ".xls"]
        const fileExtension = "." + file.name.split(".").pop()?.toLowerCase()
        return validExtensions.includes(fileExtension)
      },
      {
        message: "Invalid file type. Supported formats: CSV, TXT, XLSX, XLS",
      },
    )
    .refine(
      (file) => {
        const filenamePattern = /^([A-Za-z0-9]+)(\d+)([a-z]+)\.(csv|txt|xlsx|xls)$/i
        return filenamePattern.test(file.name)
      },
      {
        message: "Filename does not follow the required pattern: [SampleID][MeasurementNumber][MeasurementType].csv",
      },
    ),
})

// Sample creation form schema
export const sampleFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  type: z.string().min(1, "Type is required"),
  description: z.string().optional(),
  substrate: z.string().optional(),
  growthMethod: z.string().optional(),
  thickness: z.string().optional(),
  orientation: z.string().optional(),
})

// Measurement creation form schema
export const measurementFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  type: z.string().min(1, "Type is required"),
  sampleId: z.string().min(1, "Sample ID is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  peakPositions: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",").map((v) => Number.parseFloat(v.trim())) : undefined)),
  fwhm: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",").map((v) => Number.parseFloat(v.trim())) : undefined)),
  scanRange: z.string().optional(),
  scanStep: z.string().optional(),
  temperature: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseFloat(val) : undefined)),
  power: z
    .string()
    .optional()
    .transform((val) => (val ? Number.parseFloat(val) : undefined)),
})

