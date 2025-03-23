import { NextResponse } from "next/server"

// This would connect to your database in production
// For now, we'll use the mock data from the service
import { measurementService } from "@/services/measurement-service"

export async function GET(request: Request) {
  // Get URL parameters
  const { searchParams } = new URL(request.url)
  const sampleId = searchParams.get("sampleId")
  const measurementType = searchParams.get("measurementType")
  const search = searchParams.get("search")

  try {
    // Use the existing service to get measurements
    const measurements = await measurementService.getMeasurements({
      sampleId: sampleId || undefined,
      measurementType: measurementType || undefined,
      search: search || undefined,
    })

    return NextResponse.json(measurements)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch measurements" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.measurementType || !body.sampleId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Use the existing service to create a measurement
    const newMeasurement = await measurementService.createMeasurement(body)

    return NextResponse.json(newMeasurement, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

