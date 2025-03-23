// Define all measurement-related types for the application

export interface Sample {
  id: string
  identifier: string
  name: string
  substrate: string
}

export interface User {
  id: string
  username: string
  fullName: string
}

export type MeasurementTypeId = "UV_PL" | "IR_PL" | "UV_PR" | "IR_EL" | "XRD" | "AFM" | "SEM" | "TEM" | "SIMS" | "HALL"

export interface MeasurementType {
  id: MeasurementTypeId
  name: string
  description: string
  category: "optical" | "structural" | "electrical" | "compositional"
  defaultParameters: Record<string, any>
  requiredParameters: string[]
  supportedFileTypes: string[]
}

export interface MeasurementParameter {
  id: string
  name: string
  label: string
  type: "number" | "text" | "select" | "slider" | "checkbox" | "date"
  unit?: string
  min?: number
  max?: number
  step?: number
  options?: { value: string; label: string }[]
  defaultValue?: any
  required?: boolean
  description?: string
  category?: "basic" | "advanced" | "experimental"
  dependsOn?: {
    parameter: string
    value: any
    condition: "equals" | "notEquals" | "greaterThan" | "lessThan"
  }
}

export interface MeasurementFile {
  id?: string
  name: string
  size: number
  type: string
  url?: string
  localFile?: File
  uploadProgress?: number
  status?: "pending" | "uploading" | "success" | "error"
  error?: string
  metadata?: Record<string, any>
}

export interface Measurement {
  id?: string
  title: string
  measurementType: MeasurementTypeId
  description?: string
  sampleId: string
  sample?: Sample
  parameters: Record<string, any>
  files?: MeasurementFile[]
  createdAt?: Date
  createdBy?: string
  updatedAt?: Date
  updatedBy?: string
  status?: "draft" | "pending" | "completed" | "error"
  notes?: string
  tags?: string[]
}

// Add MeasurementFormState to the existing types
export interface MeasurementFormState {
  title: string
  description: string
  measurementType: string
  sampleId: string
  parameters: Array<{
    id: string
    name: string
    value: any
    unit?: string
  }>
  files: Array<{
    name: string
    size: number
    type: string
    localFile?: File
    status?: string
    url?: string
  }>
  notes: string
  tags: string[]
}

export interface MeasurementFormErrors {
  title?: string
  measurementType?: string
  description?: string
  sampleId?: string
  parameters?: Record<string, string>
  files?: string
  general?: string
}

export interface MeasurementService {
  getMeasurementTypes(): Promise<MeasurementType[]>
  getMeasurementParameters(typeId: MeasurementTypeId): Promise<MeasurementParameter[]>
  getSamples(): Promise<Sample[]>
  createMeasurement(measurement: Measurement): Promise<Measurement>
  uploadFile(file: File, measurementId: string): Promise<MeasurementFile>
  getMeasurements(filters?: Record<string, any>): Promise<Measurement[]>
  getMeasurement(id: string): Promise<Measurement>
  updateMeasurement(id: string, measurement: Partial<Measurement>): Promise<Measurement>
  deleteMeasurement(id: string): Promise<void>
}

export interface Recipe {
  id: string
  name: string
  recipeType: string
  createdAt: Date
}

export interface DataPoint {
  wavelength: number
  intensity: number
  normalized: number
  [key: string]: any // Allow for additional properties
}

