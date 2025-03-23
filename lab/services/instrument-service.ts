"use client"

import { useState, useEffect } from "react"

// Define instrument types
export interface Instrument {
  id: string
  name: string
  type: string
  manufacturer: string
  model: string
  location: string
  status: "operational" | "maintenance" | "offline"
  lastCalibration: Date
  responsible: string
  notes?: string
  metadata?: Record<string, any>
}

// Mock instruments data
const INSTRUMENTS: Instrument[] = [
  {
    id: "i1",
    name: "MBE System 1",
    type: "MBE",
    manufacturer: "Veeco",
    model: "GEN10",
    location: "Lab 101",
    status: "operational",
    lastCalibration: new Date("2025-02-15"),
    responsible: "Scott Sifferman",
  },
  {
    id: "i2",
    name: "PL Spectrometer",
    type: "Spectrometer",
    manufacturer: "Horiba",
    model: "LabRAM HR",
    location: "Lab 102",
    status: "operational",
    lastCalibration: new Date("2025-03-01"),
    responsible: "Maria Chen",
  },
  {
    id: "i3",
    name: "AFM System",
    type: "Microscope",
    manufacturer: "Bruker",
    model: "Dimension Icon",
    location: "Lab 103",
    status: "maintenance",
    lastCalibration: new Date("2025-01-20"),
    responsible: "James Wilson",
  },
  {
    id: "i4",
    name: "XRD System",
    type: "Diffractometer",
    manufacturer: "Rigaku",
    model: "SmartLab",
    location: "Lab 104",
    status: "operational",
    lastCalibration: new Date("2025-02-28"),
    responsible: "Scott Sifferman",
  },
  {
    id: "i5",
    name: "Cryostat",
    type: "Cryogenic",
    manufacturer: "Oxford",
    model: "OptistatDry",
    location: "Lab 102",
    status: "operational",
    lastCalibration: new Date("2025-03-10"),
    responsible: "Maria Chen",
  },
]

// Simulate network delay
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Generate a unique ID
function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// This service handles instrument management
export const instrumentService = {\
  useInstruments(): { instruments, isLoading, error },
  getInstrument(id: string): Promise<Instrument>,
  addInstrument(instrumentData): Promise<Instrument>,
  updateInstrument(id: string, updates: Partial<Instrument>): Promise<Instrument>,
  deleteInstrument(id: string): Promise<void>,
  getCalibrationHistory(id: string): Promise<{ date: Date; technician: string; notes: string }[]>
}

// Mock instrument service implementation
instrumentService.useInstruments = () => {
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInstruments = async () => {
      try {
        setIsLoading(true)
        // Simulate API call
        await delay(500)
        setInstruments(INSTRUMENTS)
        setError(null)
      } catch (err) {
        console.error("Error fetching instruments:", err)
        setError("Failed to load instruments")
      } finally {
        setIsLoading(false)
      }
    }

    fetchInstruments()
  }, [])

  return { instruments, isLoading, error }
}

// Get a single instrument by ID
instrumentService.getInstrument = async (id: string): Promise<Instrument> => {
  await delay(300) // Simulate network delay

  const instrument = INSTRUMENTS.find((i) => i.id === id)

  if (!instrument) {
    throw new Error(`Instrument with ID ${id} not found`)
  }

  return instrument
}

// Add a new instrument
instrumentService.addInstrument = async (
  instrumentData: Omit<Instrument, "id" | "lastCalibration">,
): Promise<Instrument> => {
  await delay(500) // Simulate network delay

  const newInstrument: Instrument = {
    ...instrumentData,
    id: generateId(),
    lastCalibration: new Date(),
  }

  // In a real app, this would be saved to a database
  console.log("Added instrument:", newInstrument)

  // Add to local array for demo purposes
  INSTRUMENTS.push(newInstrument)

  return newInstrument
}

// Update an instrument
instrumentService.updateInstrument = async (id: string, updates: Partial<Instrument>): Promise<Instrument> => {
  await delay(500) // Simulate network delay

  const index = INSTRUMENTS.findIndex((i) => i.id === id)

  if (index === -1) {
    throw new Error(`Instrument with ID ${id} not found`)
  }

  // Update the instrument
  const updatedInstrument = {
    ...INSTRUMENTS[index],
    ...updates,
  }

  // In a real app, this would update the database
  console.log("Updated instrument:", updatedInstrument)

  // Update local array for demo purposes
  INSTRUMENTS[index] = updatedInstrument

  return updatedInstrument
}

// Delete an instrument
instrumentService.deleteInstrument = async (id: string): Promise<void> => {
  await delay(500) // Simulate network delay

  const index = INSTRUMENTS.findIndex((i) => i.id === id)

  if (index === -1) {
    throw new Error(`Instrument with ID ${id} not found`)
  }

  // In a real app, this would delete from the database
  console.log(`Deleted instrument with ID ${id}`)

  // Remove from local array for demo purposes
  INSTRUMENTS.splice(index, 1)
}

// Get instrument calibration history
instrumentService.getCalibrationHistory = async (
  id: string,
): Promise<{ date: Date; technician: string; notes: string }[]> => {
  await delay(300) // Simulate network delay

  // Mock calibration history
  return [
    {
      date: new Date("2025-02-15"),
      technician: "John Smith",
      notes: "Regular annual calibration",
    },
    {
      date: new Date("2024-02-10"),
      technician: "Jane Doe",
      notes: "Calibration after maintenance",
    },
    {
      date: new Date("2023-02-05"),
      technician: "John Smith",
      notes: "Initial calibration",
    },
  ]
}

