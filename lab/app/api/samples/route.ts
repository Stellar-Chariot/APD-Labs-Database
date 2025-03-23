import { NextResponse } from "next/server"
import type { Sample } from "@/types/sample-types"

// This would connect to your database in production
// For now, we'll use the mock data
const SAMPLES: Sample[] = [
  {
    id: "s1",
    identifier: "T250306A",
    name: "GaAs QW Structure",
    substrate: "GaAs",
    growthDate: new Date("2025-03-06"),
    grower: "Scott Sifferman",
    description: "Standard GaAs/AlGaAs quantum well structure grown at 600°C",
    createdAt: new Date("2025-03-07T10:15:00Z"),
    metadata: {
      substrateSize: '1/4 3"',
      backingWafer: "sapphire",
      rotationRpm: "5",
    },
  },
  {
    id: "s2",
    identifier: "T250307B",
    name: "InGaAs QD Sample",
    substrate: "GaAs",
    growthDate: new Date("2025-03-07"),
    grower: "Maria Chen",
    description: "InGaAs/GaAs quantum dot sample with 2.5ML InAs deposition",
    createdAt: new Date("2025-03-08T09:30:00Z"),
    metadata: {
      substrateSize: '2"',
      backingWafer: "molybdenum",
      rotationRpm: "10",
    },
  },
  {
    id: "s3",
    identifier: "T250310C",
    name: "AlGaAs/GaAs Superlattice",
    substrate: "GaAs",
    growthDate: new Date("2025-03-10"),
    grower: "James Wilson",
    description: "20-period AlGaAs/GaAs superlattice for XRD calibration",
    createdAt: new Date("2025-03-11T14:45:00Z"),
    metadata: {
      substrateSize: '3"',
      backingWafer: "silicon",
      rotationRpm: "7",
    },
  },
  {
    id: "s4",
    identifier: "T250312D",
    name: "GaN on Si Template",
    substrate: "Si",
    growthDate: new Date("2025-03-12"),
    grower: "Scott Sifferman",
    description: "GaN template layer on Si substrate with AlN buffer",
    createdAt: new Date("2025-03-13T11:20:00Z"),
    metadata: {
      substrateSize: '4"',
      backingWafer: "none",
      rotationRpm: "3",
    },
  },
  {
    id: "s5",
    identifier: "T250315E",
    name: "InP-based QW Laser Structure",
    substrate: "InP",
    growthDate: new Date("2025-03-15"),
    grower: "Maria Chen",
    description: "InGaAsP/InP quantum well laser structure for 1550nm emission",
    createdAt: new Date("2025-03-16T15:10:00Z"),
    metadata: {
      substrateSize: '2"',
      backingWafer: "indium",
      rotationRpm: "5",
    },
  },
]

export async function GET(request: Request) {
  // Get URL parameters
  const { searchParams } = new URL(request.url)
  const substrate = searchParams.get("substrate")
  const search = searchParams.get("search")

  let filteredSamples = [...SAMPLES]

  // Apply filters
  if (substrate && substrate !== "all") {
    filteredSamples = filteredSamples.filter((sample) => sample.substrate === substrate)
  }

  if (search) {
    const searchLower = search.toLowerCase()
    filteredSamples = filteredSamples.filter(
      (sample) =>
        sample.identifier.toLowerCase().includes(searchLower) ||
        sample.name.toLowerCase().includes(searchLower) ||
        sample.description.toLowerCase().includes(searchLower) ||
        sample.grower.toLowerCase().includes(searchLower),
    )
  }

  return NextResponse.json(filteredSamples)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.identifier || !body.name || !body.substrate || !body.grower) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create new sample with generated ID
    const newSample: Sample = {
      id: `s${SAMPLES.length + 1}`,
      identifier: body.identifier,
      name: body.name,
      substrate: body.substrate,
      growthDate: new Date(body.growthDate || Date.now()),
      grower: body.grower,
      description: body.description || "",
      createdAt: new Date(),
      metadata: body.metadata || {},
    }

    // In a real app, this would save to a database
    // For now, we'll just return the new sample

    return NextResponse.json(newSample, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

