import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SampleForm } from "@/components/sample-form"

export default function NewSamplePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Add New Sample</h1>

      <Card>
        <CardHeader>
          <CardTitle>Sample Information</CardTitle>
          <CardDescription>Enter the details of the new sample. Fields marked with * are required.</CardDescription>
        </CardHeader>
        <CardContent>
          <SampleForm />
        </CardContent>
      </Card>
    </div>
  )
}

