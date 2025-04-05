import type { Sample } from "@/types/sample"
import type { Measurement } from "@/types/measurement"
import type { MBERecipe } from "@/types/mbe-recipe"
import { generateSampleData } from "@/lib/sample-data-generator"

// In-memory database
let samples: Sample[] = []
let measurements: Measurement[] = []
let mbeRecipes: MBERecipe[] = []

// Initialize with some sample data
const initializeData = () => {
  const data = generateSampleData()
  samples = data.samples
  measurements = data.measurements
  mbeRecipes = data.mbeRecipes
}

// Initialize data when this module is imported
initializeData()

// Helper to simulate network delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Simulated backend API
export const simulatedBackend = {
  // GET requests
  get: async (url: string) => {
    // Simulate network delay
    await delay(300)

    // Parse the URL to determine what data to return
    if (url === "/samples") {
      return { data: samples }
    }

    if (url.startsWith("/samples/")) {
      const id = url.split("/samples/")[1]
      const sample = samples.find((s) => s.id === id)

      if (!sample) {
        throw new Error(`Sample with ID ${id} not found`)
      }

      return { data: sample }
    }

    if (url === "/measurements") {
      // Check if there's a query parameter for sampleId
      if (url.includes("?sampleId=")) {
        const sampleId = url.split("?sampleId=")[1]
        return {
          data: measurements.filter((m) => m.sampleId === sampleId),
        }
      }

      return { data: measurements }
    }

    if (url.startsWith("/measurements/")) {
      const id = url.split("/measurements/")[1]
      const measurement = measurements.find((m) => m.id === id)

      if (!measurement) {
        throw new Error(`Measurement with ID ${id} not found`)
      }

      return { data: measurement }
    }

    if (url === "/mbe-recipes") {
      return { data: mbeRecipes }
    }

    if (url.startsWith("/mbe-recipes/")) {
      // Check if this is a request for a recipe by sample ID
      if (url.includes("/mbe-recipes/sample/")) {
        const sampleId = url.split("/mbe-recipes/sample/")[1]
        const recipe = mbeRecipes.find((r) => r.sampleId === sampleId)

        // Return null if no recipe is found for this sample
        // This is not an error condition, just means the sample doesn't have a recipe
        return { data: recipe || null }
      }

      // Regular recipe by ID request
      const id = url.split("/mbe-recipes/")[1]
      const recipe = mbeRecipes.find((r) => r.id === id)

      if (!recipe) {
        throw new Error(`MBE Recipe with ID ${id} not found`)
      }

      return { data: recipe }
    }

    // If the URL doesn't match any of the above patterns
    throw new Error(`Endpoint not found: ${url}`)
  },

  // POST requests
  post: async (url: string, data: any) => {
    // Simulate network delay
    await delay(300)

    if (url === "/samples") {
      const newSample: Sample = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      }

      samples.push(newSample)
      return { data: newSample }
    }

    if (url === "/measurements") {
      const newMeasurement: Measurement = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      }

      measurements.push(newMeasurement)
      return { data: newMeasurement }
    }

    if (url === "/mbe-recipes") {
      const newRecipe: MBERecipe = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...data,
      }

      mbeRecipes.push(newRecipe)
      return { data: newRecipe }
    }

    // If the URL doesn't match any of the above patterns
    throw new Error(`Endpoint not found: ${url}`)
  },

  // PUT requests
  put: async (url: string, data: any) => {
    // Simulate network delay
    await delay(300)

    if (url.startsWith("/samples/")) {
      const id = url.split("/samples/")[1]
      const index = samples.findIndex((s) => s.id === id)

      if (index === -1) {
        throw new Error(`Sample with ID ${id} not found`)
      }

      const updatedSample = {
        ...samples[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }

      samples[index] = updatedSample
      return { data: updatedSample }
    }

    if (url.startsWith("/measurements/")) {
      const id = url.split("/measurements/")[1]
      const index = measurements.findIndex((m) => m.id === id)

      if (index === -1) {
        throw new Error(`Measurement with ID ${id} not found`)
      }

      const updatedMeasurement = {
        ...measurements[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }

      measurements[index] = updatedMeasurement
      return { data: updatedMeasurement }
    }

    if (url.startsWith("/mbe-recipes/")) {
      const id = url.split("/mbe-recipes/")[1]
      const index = mbeRecipes.findIndex((r) => r.id === id)

      if (index === -1) {
        throw new Error(`MBE Recipe with ID ${id} not found`)
      }

      const updatedRecipe = {
        ...mbeRecipes[index],
        ...data,
        updatedAt: new Date().toISOString(),
      }

      mbeRecipes[index] = updatedRecipe
      return { data: updatedRecipe }
    }

    // If the URL doesn't match any of the above patterns
    throw new Error(`Endpoint not found: ${url}`)
  },

  // DELETE requests
  delete: async (url: string) => {
    // Simulate network delay
    await delay(300)

    if (url.startsWith("/samples/")) {
      const id = url.split("/samples/")[1]
      const index = samples.findIndex((s) => s.id === id)

      if (index === -1) {
        throw new Error(`Sample with ID ${id} not found`)
      }

      samples.splice(index, 1)

      // Also delete related measurements and recipes
      measurements = measurements.filter((m) => m.sampleId !== id)
      mbeRecipes = mbeRecipes.filter((r) => r.sampleId !== id)

      return { data: { success: true } }
    }

    if (url.startsWith("/measurements/")) {
      const id = url.split("/measurements/")[1]
      const index = measurements.findIndex((m) => m.id === id)

      if (index === -1) {
        throw new Error(`Measurement with ID ${id} not found`)
      }

      measurements.splice(index, 1)
      return { data: { success: true } }
    }

    if (url.startsWith("/mbe-recipes/")) {
      const id = url.split("/mbe-recipes/")[1]
      const index = mbeRecipes.findIndex((r) => r.id === id)

      if (index === -1) {
        throw new Error(`MBE Recipe with ID ${id} not found`)
      }

      mbeRecipes.splice(index, 1)
      return { data: { success: true } }
    }

    // If the URL doesn't match any of the above patterns
    throw new Error(`Endpoint not found: ${url}`)
  },

  // Method to add a file to the system
  addFile: async (file: File, fileName: string) => {
    // Simulate network delay
    await delay(500)

    // Parse the filename to extract sample ID and measurement type
    // Expected format: {sampleId}{sequence}{type}.{extension}
    // Example: T250306GaNA1xrd.csv

    try {
      // Simple regex to extract parts
      const match = fileName.match(/^([A-Za-z0-9]+)(\d+)([a-z]+)\.([a-z]+)$/)

      if (!match) {
        throw new Error("Invalid filename format. Expected format: {sampleId}{sequence}{type}.{extension}")
      }

      const [, sampleId, sequence, measurementType, extension] = match

      // Check if the sample exists, create if not
      let sample = samples.find((s) => s.id === sampleId)

      if (!sample) {
        sample = {
          id: sampleId,
          name: `${sampleId} - Sample`,
          description: `Automatically created from file upload: ${fileName}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          metadata: {},
        }

        samples.push(sample)
      }

      // Create a measurement ID
      const measurementId = `${sampleId}${sequence}${measurementType}`

      // Generate mock data based on measurement type
      let mockData
      switch (measurementType.toLowerCase()) {
        case "xrd":
          mockData = { data: generateXRDData(), metadata: generateMetadataForType("xrd") }
          break
        case "pl":
          mockData = { data: generatePLData(), metadata: generateMetadataForType("pl") }
          break
        case "hall":
          mockData = { data: generateHallData(), metadata: generateMetadataForType("hall") }
          break
        case "sem":
          mockData = { data: [], metadata: generateMetadataForType("sem") }
          break
        case "afm":
          mockData = { data: generateAFMData(), metadata: generateMetadataForType("afm") }
          break
        default:
          mockData = { data: generateGenericData(), metadata: generateMetadataForType("generic") }
      }

      // Create the measurement with ID in the name
      const newMeasurement: Measurement = {
        id: measurementId,
        sampleId: sampleId,
        name: `${measurementId} - ${measurementType.toUpperCase()} Measurement ${sequence}`,
        type: measurementType,
        date: new Date().toISOString(),
        data: mockData.data,
        metadata: mockData.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      // Check if measurement already exists
      const existingIndex = measurements.findIndex((m) => m.id === measurementId)

      if (existingIndex >= 0) {
        // Update existing measurement
        measurements[existingIndex] = {
          ...measurements[existingIndex],
          ...newMeasurement,
          updatedAt: new Date().toISOString(),
        }
      } else {
        // Add new measurement
        measurements.push(newMeasurement)
      }

      return {
        data: {
          success: true,
          sampleId,
          measurementId,
          measurementType,
        },
      }
    } catch (error) {
      console.error("Error processing file:", error)
      throw error
    }
  },

  // Helper methods for direct access (for testing and debugging)
  getSamples: async () => {
    await delay(300)
    return samples
  },

  getSample: async (id: string) => {
    await delay(300)
    const sample = samples.find((s) => s.id === id)
    if (!sample) {
      throw new Error(`Sample with ID ${id} not found`)
    }
    return sample
  },

  getAllMeasurements: async () => {
    await delay(300)
    console.log("SimulatedBackend: getAllMeasurements called")
    console.log(`SimulatedBackend: Returning ${measurements.length} measurements`)
    return measurements
  },

  getMeasurementById: async (id: string) => {
    await delay(300)
    const measurement = measurements.find((m) => m.id === id)
    if (!measurement) {
      throw new Error(`Measurement with ID ${id} not found`)
    }
    return measurement
  },

  getMeasurementsBySampleId: async (sampleId: string) => {
    await delay(300)
    return measurements.filter((m) => m.sampleId === sampleId)
  },
}

// Helper function to generate mock data based on measurement type
function generateMockDataForType(type: string): { data: any[]; metadata: any } {
  switch (type.toLowerCase()) {
    case "xrd":
      return generateXRDData()
    case "pl":
      return generatePLData()
    case "hall":
      return generateHallData()
    case "sem":
      return generateSEMData()
    case "afm":
      return generateAFMData()
    default:
      return generateGenericData()
  }
}

function generateMetadataForType(type: string): any {
  switch (type.toLowerCase()) {
    case "xrd":
      return {
        peakPositions: [30.5, 45.2, 66.8],
        fwhm: [0.2, 0.3, 0.4],
        maxIntensity: 1000,
        scanRange: "20-80°",
        scanStep: "0.1°",
      }
    case "pl":
      return {
        peakWavelength: 550,
        fwhm: 30,
        maxIntensity: 1000,
        excitationWavelength: 325,
        temperature: 300,
        power: 10,
      }
    case "hall":
      return {
        carrierConcentration: "1e+17",
        mobility: 500,
        resistivity: "0.05",
        carrierType: "n-type",
        temperature: 300,
        contactConfiguration: "van der Pauw",
      }
    case "sem":
      return {
        magnification: "25k×",
        acceleratingVoltage: "10 kV",
        workingDistance: "7.5 mm",
        detector: "Secondary Electron",
        imageResolution: "2048 × 1536 pixels",
      }
    case "afm":
      return {
        roughness: "5.00 nm",
        scanSize: "5 × 5 μm",
        scanRate: "0.7 Hz",
        mode: "Tapping",
        resolution: "512 × 512 pixels",
      }
    default:
      return {
        dataPoints: 50,
        average: 150,
        min: 100,
        max: 200,
      }
  }
}

function generateXRDData() {
  const data = []
  const peakPositions = [30.5, 45.2, 66.8]
  const intensities = [1000, 500, 250]
  const fwhm = [0.2, 0.3, 0.4]

  for (let i = 20; i <= 80; i += 0.1) {
    let intensity = 50 + Math.random() * 20 // Background noise

    // Add peaks
    for (let j = 0; j < peakPositions.length; j++) {
      const peak = peakPositions[j]
      const amp = intensities[j]
      const width = fwhm[j]

      // Gaussian peak
      intensity += amp * Math.exp(-Math.pow(i - peak, 2) / (2 * Math.pow(width, 2)))
    }

    data.push({
      angle: i.toFixed(1),
      intensity: Math.round(intensity),
    })
  }

  return data
}

function generatePLData() {
  const data = []
  const peakWavelength = 550 + Math.random() * 100
  const fwhm = 30 + Math.random() * 20
  const maxIntensity = 1000 + Math.random() * 500

  for (let wavelength = 400; wavelength <= 800; wavelength += 2) {
    // Gaussian emission peak
    const intensity =
      maxIntensity * Math.exp(-Math.pow(wavelength - peakWavelength, 2) / (2 * Math.pow(fwhm / 2.355, 2)))

    data.push({
      wavelength,
      intensity: Math.round(intensity + Math.random() * 10),
    })
  }

  return data
}

function generateHallData() {
  const carrierConcentration = (1e16 + Math.random() * 1e18).toExponential(2)
  const mobility = Math.round(100 + Math.random() * 1000)
  const resistivity = (Math.random() * 0.1).toFixed(4)

  const data = []

  // Generate B-field vs. resistivity data
  for (let bField = -2; bField <= 2; bField += 0.1) {
    data.push({
      bField: bField.toFixed(1),
      resistivity: (Number.parseFloat(resistivity) + bField * 0.01 + Math.random() * 0.005).toFixed(4),
    })
  }

  return data
}

function generateSEMData() {
  // SEM doesn't typically have numerical data, but metadata
  return []
}

function generateAFMData() {
  const roughness = (Math.random() * 10).toFixed(2)
  const scanSize = `${Math.round(1 + Math.random() * 9)} × ${Math.round(1 + Math.random() * 9)} μm`

  // AFM typically has image data, but we'll create some height data points
  const data = []
  for (let i = 0; i < 100; i++) {
    data.push({
      position: i,
      height: (Math.random() * Number.parseFloat(roughness) * 2).toFixed(2),
    })
  }

  return data
}

function generateGenericData() {
  const data = []

  for (let i = 0; i < 50; i++) {
    data.push({
      x: i,
      y: Math.round(100 + Math.random() * 100),
    })
  }

  return data
}

