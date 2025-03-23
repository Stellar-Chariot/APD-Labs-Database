// This file simulates a backend API service with mock data
import type { DataPoint, Measurement, DataFetcher } from "@/components/visualizations/chart-types"

// Mock database of measurements
const MEASUREMENTS: Record<string, Measurement> = {
  m1: {
    id: "m1",
    title: "Room Temperature PL Measurement",
    measurementType: "UV_PL",
    description: "Photoluminescence measurement at room temperature (295K)",
    parameters: {
      wavelengthStart: 600,
      wavelengthEnd: 850,
      resolution: 0.5,
      integrationTime: 0.1,
      temperature: 295,
      excitationWavelength: 532,
      excitationPower: 10,
      spotSize: 100,
    },
    sample: {
      id: "s1",
      identifier: "T250306A",
      name: "GaAs QW Structure",
      substrate: "GaAs",
    },
    createdAt: new Date("2025-03-07T14:30:00Z"),
    createdBy: "Scott Sifferman",
  },
  m2: {
    id: "m2",
    title: "PR Measurement at 300K",
    measurementType: "UV_PR",
    description: "Photoreflectance measurement at room temperature",
    parameters: {
      wavelengthStart: 550,
      wavelengthEnd: 800,
      resolution: 0.5,
      integrationTime: 0.2,
      temperature: 300,
      excitationWavelength: 405,
      excitationPower: 5,
      spotSize: 200,
    },
    sample: {
      id: "s1",
      identifier: "T250306A",
      name: "GaAs QW Structure",
      substrate: "GaAs",
    },
    createdAt: new Date("2025-03-08T11:15:00Z"),
    createdBy: "Maria Chen",
  },
  m3: {
    id: "m3",
    title: "IR PL at 77K",
    measurementType: "IR_PL",
    description: "Low temperature infrared photoluminescence",
    parameters: {
      wavelengthStart: 800,
      wavelengthEnd: 1200,
      resolution: 1.0,
      integrationTime: 0.5,
      temperature: 77,
      excitationWavelength: 785,
      excitationPower: 20,
      spotSize: 150,
    },
    sample: {
      id: "s1",
      identifier: "T250306A",
      name: "GaAs QW Structure",
      substrate: "GaAs",
    },
    createdAt: new Date("2025-03-09T09:45:00Z"),
    createdBy: "Scott Sifferman",
  },
}

// Mock data generator functions
function generateGaussianPeak(x: number, center: number, height: number, width: number): number {
  return height * Math.exp(-Math.pow((x - center) / width, 2))
}

function generateMockData(measurement: Measurement): DataPoint[] {
  const data: DataPoint[] = []
  const { wavelengthStart, wavelengthEnd, resolution } = measurement.parameters

  // Different peak parameters based on measurement type
  let peaks: { center: number; height: number; width: number }[] = []

  if (measurement.measurementType === "UV_PL") {
    peaks = [
      { center: 720, height: 100, width: 15 },
      { center: 680, height: 30, width: 10 },
    ]
  } else if (measurement.measurementType === "UV_PR") {
    peaks = [
      { center: 700, height: -50, width: 8 },
      { center: 650, height: 70, width: 12 },
    ]
  } else if (measurement.measurementType === "IR_PL") {
    peaks = [
      { center: 950, height: 80, width: 25 },
      { center: 1050, height: 40, width: 20 },
    ]
  }

  for (let x = wavelengthStart; x <= wavelengthEnd; x += resolution) {
    // Calculate intensity from all peaks
    let intensity = 0
    for (const peak of peaks) {
      intensity += generateGaussianPeak(x, peak.center, peak.height, peak.width)
    }

    // Add some random noise
    const noise = Math.random() * 5
    intensity += noise

    // Ensure intensity is positive (for PL)
    if (measurement.measurementType.includes("PL")) {
      intensity = Math.max(0, intensity)
    }

    data.push({
      wavelength: x,
      intensity,
      normalized: intensity / 100, // Simple normalization
    })
  }

  return data
}

// Simulate network delay
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Function to get multiple measurements for comparison
async function getComparisonData(ids: string[]): Promise<{
  measurements: Measurement[]
  data: DataPoint[][]
}> {
  await delay(800) // Simulate network delay

  const measurements: Measurement[] = []
  const data: DataPoint[][] = []

  for (const id of ids) {
    const measurement = MEASUREMENTS[id]
    if (measurement) {
      measurements.push(measurement)
      data.push(generateMockData(measurement))
    }
  }

  return { measurements, data }
}

// This service handles chart data for visualizations
export const mockDataService: DataFetcher = {\
  getMeasurement(id: string): Promise<Measurement | null>,
  getMeasurementData(id: string): Promise<DataPoint[]>,
  getComparisonData(ids: string[]): Promise<{ measurements: Measurement[], data: DataPoint[][] }>,
  async getMeasurement(id: string): Promise<Measurement | null> {
    await delay(300) // Simulate network delay
    return MEASUREMENTS[id] || null
  },

  async getMeasurementData(id: string): Promise<DataPoint[]> {
    await delay(500) // Simulate network delay for data fetching
    const measurement = MEASUREMENTS[id]
    if (!measurement) {
      return []
    }
    return generateMockData(measurement)
  },

  async getComparisonData(ids: string[]): Promise<{
    measurements: Measurement[]
    data: DataPoint[][]
  }> {
    return getComparisonData(ids)
  },
}

// Fallback data in case the service fails
export const FALLBACK_DATA: DataPoint[] = [
  { wavelength: 600, intensity: 10, normalized: 0.1 },
  { wavelength: 620, intensity: 15, normalized: 0.15 },
  { wavelength: 640, intensity: 25, normalized: 0.25 },
  { wavelength: 660, intensity: 40, normalized: 0.4 },
  { wavelength: 680, intensity: 70, normalized: 0.7 },
  { wavelength: 700, intensity: 95, normalized: 0.95 },
  { wavelength: 720, intensity: 100, normalized: 1.0 },
  { wavelength: 740, intensity: 80, normalized: 0.8 },
  { wavelength: 760, intensity: 50, normalized: 0.5 },
  { wavelength: 780, intensity: 30, normalized: 0.3 },
  { wavelength: 800, intensity: 15, normalized: 0.15 },
  { wavelength: 820, intensity: 8, normalized: 0.08 },
  { wavelength: 840, intensity: 5, normalized: 0.05 },
]

