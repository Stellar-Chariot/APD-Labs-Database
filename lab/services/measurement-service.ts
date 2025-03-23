"use client"

import { useState, useEffect } from "react"
import type {
  Measurement,
  MeasurementParameter,
  MeasurementType,
  MeasurementTypeId,
  Sample,
} from "@/types/measurement-types"

// Mock data for measurements
const MEASUREMENTS: Measurement[] = [
  {
    id: "m1",
    title: "Room Temperature PL Measurement",
    measurementType: "UV_PL",
    sampleId: "s1",
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
    createdAt: new Date("2025-03-07T14:30:00Z"),
    createdBy: "user1",
    description: "",
    notes: "",
    tags: ["PL", "room-temperature", "GaAs"],
  },
  {
    id: "m2",
    title: "Room Temperature PR Measurement",
    measurementType: "UV_PR",
    sampleId: "s1",
    parameters: {
      wavelengthStart: 600,
      wavelengthEnd: 900,
      resolution: 1.0,
      temperature: 295,
      modulationFrequency: 1000,
      phaseAngle: 0,
    },
    createdAt: new Date("2025-03-07T16:45:00Z"),
    createdBy: "user2",
    description: "Photoreflectance measurement at room temperature",
    notes: "Strong Franz-Keldysh oscillations observed",
    tags: ["PR", "room-temperature", "GaAs"],
  },
  {
    id: "m3",
    title: "Low Temperature PL Measurement",
    measurementType: "IR_PL",
    sampleId: "s2",
    parameters: {
      wavelengthStart: 800,
      wavelengthEnd: 1600,
      resolution: 1.0,
      integrationTime: 0.5,
      temperature: 77,
      excitationWavelength: 808,
      excitationPower: 50,
      spotSize: 200,
    },
    createdAt: new Date("2025-03-08T09:15:00Z"),
    createdBy: "user1",
    description: "Liquid nitrogen temperature PL measurement",
    notes: "Sharp peaks observed at 1300nm",
    tags: ["PL", "low-temperature", "InGaAs"],
  },
  {
    id: "m4",
    title: "UV PL Measurement of Sample B",
    measurementType: "UV_PL",
    sampleId: "s2",
    parameters: {
      wavelengthStart: 350,
      wavelengthEnd: 650,
      resolution: 0.2,
      integrationTime: 0.2,
      temperature: 295,
      excitationWavelength: 325,
      excitationPower: 5,
      spotSize: 50,
    },
    createdAt: new Date("2025-03-09T11:30:00Z"),
    createdBy: "user3",
    description: "UV photoluminescence of wide bandgap layers",
    notes: "Weak signal, needed longer integration time",
    tags: ["PL", "UV", "AlGaN"],
  },
  {
    id: "m5",
    title: "Helium Temperature PL Measurement",
    measurementType: "IR_PL",
    sampleId: "s3",
    parameters: {
      wavelengthStart: 900,
      wavelengthEnd: 1700,
      resolution: 0.5,
      integrationTime: 1.0,
      temperature: 10,
      excitationWavelength: 532,
      excitationPower: 20,
      spotSize: 100,
    },
    createdAt: new Date("2025-03-10T14:00:00Z"),
    createdBy: "user2",
    description: "Helium cryostat PL measurement",
    notes: "Very sharp quantum dot emission lines observed",
    tags: ["PL", "helium-temperature", "InAs", "QD"],
  },
  {
    id: "m6",
    title: "High Resolution PR Measurement",
    measurementType: "UV_PR",
    sampleId: "s4",
    parameters: {
      wavelengthStart: 500,
      wavelengthEnd: 900,
      resolution: 0.1,
      temperature: 295,
      modulationFrequency: 2000,
      phaseAngle: 45,
    },
    createdAt: new Date("2025-03-11T10:45:00Z"),
    createdBy: "user1",
    description: "High resolution photoreflectance measurement",
    notes: "Multiple quantum well transitions resolved",
    tags: ["PR", "high-resolution", "GaAs", "QW"],
  },
  {
    id: "m7",
    title: "Temperature Dependent PL Series",
    measurementType: "UV_PL",
    sampleId: "s5",
    parameters: {
      wavelengthStart: 600,
      wavelengthEnd: 850,
      resolution: 0.5,
      integrationTime: 0.2,
      temperature: 150,
      excitationWavelength: 325,
      excitationPower: 15,
      spotSize: 75,
    },
    createdAt: new Date("2025-03-12T13:20:00Z"),
    createdBy: "user3",
    description: "Part of temperature series from 10K to 300K",
    notes: "Good signal-to-noise ratio throughout the series",
    tags: ["PL", "temperature-series", "GaAs"],
  },
]

// Mock data for samples
const SAMPLES: Sample[] = [
  {
    id: "s1",
    identifier: "T250306A",
    name: "GaAs QW Structure",
    substrate: "GaAs",
  },
  {
    id: "s2",
    identifier: "T250307B",
    name: "InGaAs QD Sample",
    substrate: "GaAs",
  },
  {
    id: "s3",
    identifier: "T250310C",
    name: "AlGaAs/GaAs Superlattice",
    substrate: "GaAs",
  },
  {
    id: "s4",
    identifier: "T250312D",
    name: "GaN on Si Template",
    substrate: "Si",
  },
  {
    id: "s5",
    identifier: "T250315E",
    name: "InP-based QW Laser Structure",
    substrate: "InP",
  },
]

// Mock data for measurement types
const MEASUREMENT_TYPES: MeasurementType[] = [
  {
    id: "UV_PL",
    name: "UV-Vis Photoluminescence",
    description: "Photoluminescence in the UV to visible range",
    category: "optical",
    defaultParameters: {
      wavelengthStart: 350,
      wavelengthEnd: 900,
      resolution: 0.5,
      integrationTime: 0.1,
      temperature: 295,
      excitationWavelength: 325,
      excitationPower: 10,
      spotSize: 100,
    },
    requiredParameters: ["wavelengthStart", "wavelengthEnd", "integrationTime"],
    supportedFileTypes: [".txt", ".csv", ".dat"],
  },
  {
    id: "IR_PL",
    name: "IR Photoluminescence",
    description: "Photoluminescence in the infrared range",
    category: "optical",
    defaultParameters: {
      wavelengthStart: 800,
      wavelengthEnd: 1700,
      resolution: 1.0,
      integrationTime: 0.5,
      temperature: 295,
      excitationWavelength: 808,
      excitationPower: 50,
      spotSize: 200,
    },
    requiredParameters: ["wavelengthStart", "wavelengthEnd", "integrationTime"],
    supportedFileTypes: [".txt", ".csv", ".dat"],
  },
  {
    id: "UV_PR",
    name: "UV-Vis Photoreflectance",
    description: "Photoreflectance in the UV to visible range",
    category: "optical",
    defaultParameters: {
      wavelengthStart: 350,
      wavelengthEnd: 900,
      resolution: 1.0,
      temperature: 295,
      modulationFrequency: 1000,
      phaseAngle: 0,
    },
    requiredParameters: ["wavelengthStart", "wavelengthEnd", "modulationFrequency"],
    supportedFileTypes: [".txt", ".csv", ".dat"],
  },
  {
    id: "IR_EL",
    name: "IR Electroluminescence",
    description: "Electroluminescence in the infrared range",
    category: "optical",
    defaultParameters: {
      wavelengthStart: 800,
      wavelengthEnd: 1700,
      resolution: 1.0,
      integrationTime: 0.5,
      temperature: 295,
      current: 50,
      pulseWidth: 1000,
      dutyCycle: 50,
    },
    requiredParameters: ["wavelengthStart", "wavelengthEnd", "current"],
    supportedFileTypes: [".txt", ".csv", ".dat"],
  },
  {
    id: "XRD",
    name: "X-Ray Diffraction",
    description: "X-ray diffraction for structural analysis",
    category: "structural",
    defaultParameters: {
      scanType: "2theta-omega",
      startAngle: 20,
      endAngle: 80,
      stepSize: 0.01,
      scanSpeed: 1,
      xraySource: "Cu-Ka",
    },
    requiredParameters: ["scanType", "startAngle", "endAngle"],
    supportedFileTypes: [".xrdml", ".txt", ".csv"],
  },
]

// Mock data for measurement parameters
const PARAMETER_DEFINITIONS: Record<MeasurementTypeId, MeasurementParameter[]> = {
  UV_PL: [
    {
      id: "wavelengthStart",
      name: "wavelengthStart",
      label: "Start Wavelength",
      type: "number",
      unit: "nm",
      min: 200,
      max: 900,
      step: 1,
      defaultValue: 350,
      required: true,
      description: "Starting wavelength for the scan",
      category: "basic",
    },
    {
      id: "wavelengthEnd",
      name: "wavelengthEnd",
      label: "End Wavelength",
      type: "number",
      unit: "nm",
      min: 200,
      max: 900,
      step: 1,
      defaultValue: 900,
      required: true,
      description: "Ending wavelength for the scan",
      category: "basic",
    },
    {
      id: "resolution",
      name: "resolution",
      label: "Resolution",
      type: "number",
      unit: "nm",
      min: 0.1,
      max: 10,
      step: 0.1,
      defaultValue: 0.5,
      required: false,
      description: "Spectral resolution of the measurement",
      category: "basic",
    },
    {
      id: "integrationTime",
      name: "integrationTime",
      label: "Integration Time",
      type: "number",
      unit: "s",
      min: 0.01,
      max: 10,
      step: 0.01,
      defaultValue: 0.1,
      required: true,
      description: "Detector integration time per point",
      category: "basic",
    },
    {
      id: "temperature",
      name: "temperature",
      label: "Temperature",
      type: "number",
      unit: "K",
      min: 4,
      max: 500,
      step: 1,
      defaultValue: 295,
      required: false,
      description: "Sample temperature during measurement",
      category: "basic",
    },
    {
      id: "excitationWavelength",
      name: "excitationWavelength",
      label: "Excitation Wavelength",
      type: "number",
      unit: "nm",
      min: 200,
      max: 1064,
      step: 1,
      defaultValue: 325,
      required: false,
      description: "Wavelength of the excitation laser",
      category: "basic",
    },
    {
      id: "excitationPower",
      name: "excitationPower",
      label: "Excitation Power",
      type: "number",
      unit: "mW",
      min: 0.1,
      max: 1000,
      step: 0.1,
      defaultValue: 10,
      required: false,
      description: "Power of the excitation laser",
      category: "basic",
    },
    {
      id: "spotSize",
      name: "spotSize",
      label: "Spot Size",
      type: "number",
      unit: "μm",
      min: 1,
      max: 1000,
      step: 1,
      defaultValue: 100,
      required: false,
      description: "Diameter of the excitation laser spot",
      category: "advanced",
    },
  ],
  IR_PL: [
    // Similar parameters as UV_PL but with different defaults and ranges
    {
      id: "wavelengthStart",
      name: "wavelengthStart",
      label: "Start Wavelength",
      type: "number",
      unit: "nm",
      min: 800,
      max: 3000,
      step: 1,
      defaultValue: 800,
      required: true,
      description: "Starting wavelength for the scan",
      category: "basic",
    },
    // More parameters would be defined here
    {
      id: "wavelengthEnd",
      name: "wavelengthEnd",
      label: "End Wavelength",
      type: "number",
      unit: "nm",
      min: 800,
      max: 3000,
      step: 1,
      defaultValue: 1700,
      required: true,
      description: "Ending wavelength for the scan",
      category: "basic",
    },
  ],
  UV_PR: [
    // Parameters specific to photoreflectance
    {
      id: "modulationFrequency",
      name: "modulationFrequency",
      label: "Modulation Frequency",
      type: "number",
      unit: "Hz",
      min: 10,
      max: 10000,
      step: 10,
      defaultValue: 1000,
      required: true,
      description: "Frequency of the pump beam modulation",
      category: "basic",
    },
  ],
  IR_EL: [
    // Parameters specific to electroluminescence
    {
      id: "current",
      name: "current",
      label: "Current",
      type: "number",
      unit: "mA",
      min: 1,
      max: 1000,
      step: 1,
      defaultValue: 50,
      required: true,
      description: "Injection current",
      category: "basic",
    },
  ],
  XRD: [
    // Parameters specific to XRD
    {
      id: "scanType",
      name: "scanType",
      label: "Scan Type",
      type: "select",
      options: [
        { value: "2theta-omega", label: "2θ-ω" },
        { value: "omega", label: "ω" },
        { value: "phi", label: "φ" },
        { value: "rocking-curve", label: "Rocking Curve" },
      ],
      defaultValue: "2theta-omega",
      required: true,
      description: "Type of XRD scan",
      category: "basic",
    },
  ],
  AFM: [],
  SEM: [],
  TEM: [],
  SIMS: [],
  HALL: [],
}

// Simulate network delay
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Mock measurement service implementation
export const measurementService = {
  getMeasurementTypes(): Promise<MeasurementType[]>,\
  getMeasurementParameters(typeId: MeasurementTypeId): Promise<MeasurementParameter[]>,
  getSamples(): Promise<Sample[]>,
  createMeasurement(measurement: Measurement): Promise<Measurement>,
  uploadFile(file: File, measurementId: string): Promise<MeasurementFile>,
  getMeasurements(filters?: Record<string, any>): Promise<Measurement[]>,
  getMeasurement(id: string): Promise<Measurement>,
  updateMeasurement(id: string, measurement: Partial<Measurement>): Promise<Measurement>,
  deleteMeasurement(id: string): Promise<void>,
  // Data relationship methods
  getSampleByIdOrName(query: string): Promise<Sample | null>,
  getMeasurementsBySampleId(sampleId: string): Promise<Measurement[]>,
  getRecipesBySampleId(sampleId: string): Promise<Recipe[]>,
  // Hooks for React components
  useMeasurements(filters?: Record<string, any>): { measurements, isLoading, error },
  useMeasurement(id: string): { measurement, isLoading, error },
  getMeasurementCountForSample(sampleId: string): Promise<number>,
  useMeasurementCountForSample(sampleId: string): { count, isLoading },
  // Get all measurement types
  async getMeasurementTypes(): Promise<MeasurementType[]> {
    await delay(300) // Simulate network delay
    return MEASUREMENT_TYPES
  },

  // Get parameters for a specific measurement type
  async getMeasurementParameters(typeId: MeasurementTypeId): Promise<MeasurementParameter[]> {
    await delay(300) // Simulate network delay
    return PARAMETER_DEFINITIONS[typeId] || []
  },

  // Get all samples
  async getSamples(): Promise<Sample[]> {
    await delay(300) // Simulate network delay
    return SAMPLES
  },

  // Create a new measurement
  async createMeasurement(measurement: Measurement): Promise<Measurement> {
    await delay(500) // Simulate network delay

    const newMeasurement: Measurement = {
      ...measurement,
      id: measurement.id || generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // In a real app, this would be saved to a database
    console.log("Created measurement:", newMeasurement)

    // Add to local array for demo purposes
    if (!measurement.id) {
      MEASUREMENTS.push(newMeasurement)
    }

    return newMeasurement
  },

  // Upload a file for a measurement
  async uploadFile(file: File, measurementId: string): Promise<any> {
    await delay(1000) // Simulate network delay and upload time

    // In a real app, this would upload the file to a server
    console.log(`Uploaded file ${file.name} for measurement ${measurementId}`)

    return {
      id: generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file), // This is just for demo purposes
      uploadProgress: 100,
      status: "success",
    }
  },

  // Get all measurements with optional filtering
  async getMeasurements(filters?: Record<string, any>): Promise<Measurement[]> {
    await delay(300) // Simulate network delay

    let filteredMeasurements = [...MEASUREMENTS]

    // Apply filters if provided
    if (filters) {
      if (filters.sampleId) {
        filteredMeasurements = filteredMeasurements.filter((m) => m.sampleId === filters.sampleId)
      }

      if (filters.measurementType) {
        filteredMeasurements = filteredMeasurements.filter((m) => m.measurementType === filters.measurementType)
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        filteredMeasurements = filteredMeasurements.filter(
          (m) =>
            m.title.toLowerCase().includes(searchLower) ||
            (m.description && m.description.toLowerCase().includes(searchLower)),
        )
      }

      // Add more filters as needed
    }

    return filteredMeasurements
  },

  // Get a single measurement by ID
  async getMeasurement(id: string): Promise<Measurement> {
    await delay(300) // Simulate network delay

    const measurement = MEASUREMENTS.find((m) => m.id === id)

    if (!measurement) {
      throw new Error(`Measurement with ID ${id} not found`)
    }

    return measurement
  },

  // Update a measurement
  async updateMeasurement(id: string, updates: Partial<Measurement>): Promise<Measurement> {
    await delay(500) // Simulate network delay

    const index = MEASUREMENTS.findIndex((m) => m.id === id)

    if (index === -1) {
      throw new Error(`Measurement with ID ${id} not found`)
    }

    // Update the measurement
    const updatedMeasurement = {
      ...MEASUREMENTS[index],
      ...updates,
      updatedAt: new Date(),
    }

    // In a real app, this would update the database
    console.log("Updated measurement:", updatedMeasurement)

    // Update local array for demo purposes
    MEASUREMENTS[index] = updatedMeasurement

    return updatedMeasurement
  },

  // Delete a measurement
  async deleteMeasurement(id: string): Promise<void> {
    await delay(500) // Simulate network delay

    const index = MEASUREMENTS.findIndex((m) => m.id === id)

    if (index === -1) {
      throw new Error(`Measurement with ID ${id} not found`)
    }

    // In a real app, this would delete from the database
    console.log(`Deleted measurement with ID ${id}`)

    // Remove from local array for demo purposes
    MEASUREMENTS.splice(index, 1)
  },

  // React hook for fetching measurements with loading and error states
  useMeasurements: (filters?: Record<string, any>) => {
    const [measurements, setMeasurements] = useState<Measurement[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
      const fetchMeasurements = async () => {
        try {
          setIsLoading(true)
          const data = await measurementService.getMeasurements(filters)
          setMeasurements(data)
          setError(null)
        } catch (err) {
          console.error("Error fetching measurements:", err)
          setError("Failed to load measurements")
        } finally {
          setIsLoading(false)
        }
      }

      fetchMeasurements()
    }, [filters])

    return { measurements, isLoading, error }
  },

  // React hook for fetching a single measurement
  useMeasurement: (id: string) => {
    const [measurement, setMeasurement] = useState<Measurement | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
      const fetchMeasurement = async () => {
        try {
          setIsLoading(true)
          const data = await measurementService.getMeasurement(id)
          setMeasurement(data)
          setError(null)
        } catch (err) {
          console.error("Error fetching measurement:", err)
          setError(`Failed to load measurement: ${err instanceof Error ? err.message : "Unknown error"}`)
        } finally {
          setIsLoading(false)
        }
      }

      fetchMeasurement()
    }, [id])

    return { measurement, isLoading, error }
  },

  // Get count of measurements for a sample
  async getMeasurementCountForSample(sampleId: string): Promise<number> {
    await delay(200) // Simulate network delay
    return MEASUREMENTS.filter((m) => m.sampleId === sampleId).length
  },

  // React hook for getting measurement count for a sample
  useMeasurementCountForSample: (sampleId: string) => {
    const [count, setCount] = useState<number>(0)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
      const fetchCount = async () => {
        try {
          setIsLoading(true)
          const data = await measurementService.getMeasurementCountForSample(sampleId)
          setCount(data)
        } catch (err) {
          console.error("Error fetching measurement count:", err)
        } finally {
          setIsLoading(false)
        }
      }

      fetchCount()
    }, [sampleId])

    return { count, isLoading }
  },

  // Add the missing methods for the data relationship visualization
  // Add these methods to the measurementService object

  // Get a sample by ID or name
  async getSampleByIdOrName(query: string): Promise<Sample | null> {
    await delay(300) // Simulate network delay

    // Search in SAMPLES array
    const sample = SAMPLES.find(
      (s) =>
        s.id === query ||
        s.identifier.toLowerCase() === query.toLowerCase() ||
        s.name.toLowerCase().includes(query.toLowerCase()),
    )

    return sample || null
  },

  // Get measurements for a sample
  async getMeasurementsBySampleId(sampleId: string): Promise<Measurement[]> {
    await delay(300) // Simulate network delay

    // Filter MEASUREMENTS array
    return MEASUREMENTS.filter((m) => m.sampleId === sampleId)
  },

  // Get recipes for a sample
  async getRecipesBySampleId(sampleId: string): Promise<Recipe[]> {
    await delay(300) // Simulate network delay

    // Mock recipes - in a real app, this would come from a database
    const mockRecipes: Recipe[] = [
      {
        id: "r1",
        name: "GaAs/AlGaAs QW",
        recipeType: "MBE",
        createdAt: new Date("2020-03-19"),
      },
      {
        id: "r2",
        name: "AlGaAs Barrier Test",
        recipeType: "MBE",
        createdAt: new Date("2020-03-20"),
      },
    ]

    // For demo purposes, return recipes for sample s1 only
    if (sampleId === "s1") {
      return mockRecipes
    }

    return []
  },
}

interface Recipe {
  id: string
  name: string
  recipeType: string
  createdAt: Date
}

interface MeasurementFile {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadProgress: number
  status: string
}

