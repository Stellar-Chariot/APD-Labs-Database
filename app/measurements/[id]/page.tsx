import { getMeasurementById } from "@/lib/actions"
import { Heading } from "@/components/ui/heading"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { EnhancedMeasurementData } from "@/components/measurements/enhanced-measurement-data"

export default async function MeasurementDetailPage({ params }: { params: { id: string } }) {
  const measurementId = Number.parseInt(params.id)
  const measurement = await getMeasurementById(measurementId)

  if (!measurement) {
    return (
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center space-x-2">
          <Link href="/measurements">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Measurements
            </Button>
          </Link>
        </div>
        <div className="text-center py-10">
          <h2 className="text-2xl font-bold">Measurement not found</h2>
          <p className="text-muted-foreground">The measurement you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center space-x-2">
        <Link href="/measurements">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Measurements
          </Button>
        </Link>
      </div>

      <Heading title={`Measurement: ${measurement.name}`} description="Detailed information about this measurement" />

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Measurement Information</CardTitle>
            <CardDescription>Basic details about this measurement</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd className="text-lg font-semibold">{measurement.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Sample</dt>
                <dd className="text-lg font-semibold">
                  <Link href={`/samples/${measurement.sample_id}`} className="hover:underline">
                    {measurement.sample_name}
                  </Link>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Type</dt>
                <dd className="text-lg font-semibold">
                  <Badge variant="outline">{measurement.measurement_type}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Device Number</dt>
                <dd className="text-lg font-semibold">{measurement.device_number}</dd>
              </div>
              {measurement.experimental_parameter && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Parameter</dt>
                  <dd className="text-lg font-semibold">{measurement.experimental_parameter}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Date</dt>
                <dd className="text-lg font-semibold">{new Date(measurement.measurement_date).toLocaleDateString()}</dd>
              </div>
              {measurement.equipment && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Equipment</dt>
                  <dd className="text-lg font-semibold">{measurement.equipment}</dd>
                </div>
              )}
              {measurement.operator && (
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Operator</dt>
                  <dd className="text-lg font-semibold">{measurement.operator}</dd>
                </div>
              )}
            </dl>
            {measurement.description && (
              <div className="mt-4">
                <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                <dd className="mt-1 text-sm">{measurement.description}</dd>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related Information</CardTitle>
            <CardDescription>Additional details and related data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Sample</h3>
                <p className="mt-1">
                  <Link href={`/samples/${measurement.sample_id}`} className="text-primary hover:underline">
                    View sample: {measurement.sample_name}
                  </Link>
                </p>
              </div>

              {/* Additional related information could be added here */}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Measurement Data with Chart and Table */}
      <EnhancedMeasurementData measurementId={measurementId} measurementName={measurement.name} />
    </div>
  )
}
