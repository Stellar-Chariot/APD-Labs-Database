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
  // Other samples omitted for brevity
]

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const sample = SAMPLES.find((s) => s.id === id)

  if (!sample) {
    return NextResponse.json({ error: "Sample not found" }, { status: 404 })
  }

  return NextResponse.json(sample)
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    const sampleIndex = SAMPLES.findIndex((s) => s.id === id)

    if (sampleIndex === -1) {
      return NextResponse.json({ error: "Sample not found" }, { status: 404 })
    }

    // In a real app, this would update the database
    // For now, we'll just return the updated sample

    const updatedSample = {
      ...SAMPLES[sampleIndex],
      ...body,
      id: id, // Ensure ID doesn't change
    }

    return NextResponse.json(updatedSample)
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = params.id
  const sampleIndex = SAMPLES.findIndex((s) => s.id === id)

  if (sampleIndex === -1) {
    return NextResponse.json({ error: "Sample not found" }, { status: 404 })
  }

  // In a real app, this would delete from the database
  // For now, we'll just return a success message

  return NextResponse.json({ success: true })
}

