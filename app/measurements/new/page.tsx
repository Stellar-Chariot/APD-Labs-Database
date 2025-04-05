import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MeasurementForm } from "@/components/measurement-form"

export default function NewMeasurementPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Add New Measurement</h1>

      <Card>
        <CardHeader>
          <CardTitle>Measurement Information</CardTitle>
          <CardDescription>
            Enter the details of the new measurement. Fields marked with * are required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MeasurementForm />
        </CardContent>
      </Card>
    </div>
  )
}

