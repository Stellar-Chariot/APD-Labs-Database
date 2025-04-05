import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getSamples } from "@/services/sample-service"
import { getAllMeasurements } from "@/services/measurement-service"
import { BarChart, FileSpreadsheet, FlaskRoundIcon as Flask, Folder, Upload } from "lucide-react"

export default async function DashboardPage() {
  // Fetch data with error handling
  let samples = []
  let measurements = []

  try {
    samples = await getSamples()
  } catch (error) {
    console.error("Error fetching samples:", error)
    // Continue with empty samples array
  }

  try {
    measurements = await getAllMeasurements()
  } catch (error) {
    console.error("Error fetching measurements:", error)
    // Continue with empty measurements array
  }

  const recentSamples = samples.slice(0, 5)
  const recentMeasurements = measurements.slice(0, 5)

  const measurementTypes = measurements.reduce(
    (acc, measurement) => {
      acc[measurement.type] = (acc[measurement.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">APD LABS</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Samples</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{samples.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Measurements</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{measurements.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Measurement Types</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(measurementTypes).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Latest Upload</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {measurements.length > 0 ? new Date(measurements[0].date).toLocaleDateString() : "No uploads"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Samples</CardTitle>
            <CardDescription>The most recently added samples in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSamples.length === 0 ? (
              <p className="text-sm text-muted-foreground">No samples available.</p>
            ) : (
              <div className="space-y-2">
                {recentSamples.map((sample) => (
                  <div key={sample.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{sample.name}</p>
                      <p className="text-sm text-muted-foreground">{sample.type}</p>
                    </div>
                    <Link href={`/samples/${sample.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/samples">
              <Button variant="outline">View All Samples</Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Measurements</CardTitle>
            <CardDescription>The most recently added measurements in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentMeasurements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No measurements available.</p>
            ) : (
              <div className="space-y-2">
                {recentMeasurements.map((measurement) => (
                  <div key={measurement.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{measurement.name}</p>
                      <p className="text-sm text-muted-foreground">{measurement.type}</p>
                    </div>
                    <Link href={`/measurements/${measurement.id}`}>
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Link href="/measurements">
              <Button variant="outline">View All Measurements</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/upload">
              <Button className="w-full">Upload New Data</Button>
            </Link>
            <Link href="/samples/new">
              <Button variant="outline" className="w-full">
                Add New Sample
              </Button>
            </Link>
            <Link href="/visualizations">
              <Button variant="outline" className="w-full">
                View Visualizations
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Measurement Types</CardTitle>
            <CardDescription>Distribution of measurement types in the system.</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(measurementTypes).length === 0 ? (
              <p className="text-sm text-muted-foreground">No measurement data available.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(measurementTypes).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Flask className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span>{type}</span>
                    </div>
                    <span className="font-medium">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

