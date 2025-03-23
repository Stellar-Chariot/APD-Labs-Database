// Define types for our visualization components
export interface DataPoint {
  wavelength: number
  intensity: number
  normalized: number
  [key: string]: any // Allow for additional properties
}

export interface Sample {
  id: string
  identifier: string
  name: string
  substrate: string
}

export interface MeasurementParameters {
  wavelengthStart: number
  wavelengthEnd: number
  resolution: number
  integrationTime: number
  temperature: number
  excitationWavelength?: number
  excitationPower?: number
  spotSize?: number
  [key: string]: number | undefined // Allow for additional parameters
}

export interface Measurement {
  id: string
  title: string
  measurementType: string
  description: string
  parameters: Record<string, any>
  sample: {
    id: string
    identifier: string
    name: string
    substrate: string
  }
  createdAt: Date
  createdBy: string
}

// Chart configuration types
export interface ChartConfig {
  xAxis: string
  yAxis: string
  isNormalized: boolean
  title: string
  showLegend: boolean
  [key: string]: any // Allow for additional configuration options
}

// Data fetching interface
export interface DataFetcher {
  getMeasurement(id: string): Promise<Measurement | null>
  getMeasurementData(id: string): Promise<DataPoint[]>
  getComparisonData(ids: string[]): Promise<{
    measurements: Measurement[]
    data: DataPoint[][]
  }>
}

