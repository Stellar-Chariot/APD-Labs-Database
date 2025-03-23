"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Download, Share, Maximize2 } from "lucide-react"
import Link from "next/link"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"

export default function MeasurementVisualization() {
  // In a real implementation, this would be fetched via GraphQL using a measurement ID from the URL
  const measurement = {
    id: "m1",
    title: "Room Temperature PL Measurement",
    measurementType: "UV_PL",
    parameters: {
      wavelengthStart: 600,
      wavelengthEnd: 850,
      resolution: 0.5,
      integrationTime: 0.1,
      temperature: 295,
      csvWavelengthColumn: "wavelength",
      csvIntensityColumn: "intensity",
    },
    sample: {
      id: "s1",
      identifier: "T250306A",
      name: "GaAs QW Structure",
    },
  }

  // Mock data for visualization
  const generateMockData = () => {
    const data = []
    const start = measurement.parameters.wavelengthStart
    const end = measurement.parameters.wavelengthEnd
    const step = measurement.parameters.resolution

    for (let x = start; x <= end; x += step) {
      // Simulate a Gaussian peak
      const peak1 = 100 * Math.exp(-Math.pow((x - 720) / 15, 2))
      const peak2 = 30 * Math.exp(-Math.pow((x - 680) / 10, 2))
      const noise = Math.random() * 5

      data.push({
        wavelength: x,
        intensity: peak1 + peak2 + noise,
        normalized: (peak1 + peak2 + noise) / 100,
      })
    }

    return data
  }

  const [chartData, setChartData] = useState(generateMockData())
  const [xAxis, setXAxis] = useState("wavelength")
  const [yAxis, setYAxis] = useState("intensity")
  const [isNormalized, setIsNormalized] = useState(false)

  // Update Y-axis when normalization changes
  useEffect(() => {
    setYAxis(isNormalized ? "normalized" : "intensity")
  }, [isNormalized])

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/measurements/${measurement.id}`}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{measurement.title}</h1>
          <p className="text-muted-foreground">
            Sample: {measurement.sample.identifier} - {measurement.sample.name}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Data Visualization</CardTitle>
            <CardDescription>{measurement.measurementType.replace("_", " ")} data visualization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px]">
              <ChartContainer
                config={{
                  data: {
                    label: "Data",
                    color: "hsl(var(--chart-1))",
                  },
                }}
              >
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey={xAxis}
                    label={{
                      value: `${xAxis} (nm)`,
                      position: "insideBottomRight",
                      offset: -10,
                    }}
                  />
                  <YAxis
                    label={{
                      value: isNormalized ? "Normalized Intensity (a.u.)" : "Intensity (a.u.)",
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <ChartTooltip content={<ChartTooltipContent indicator="dashed" />} />
                  <Line type="monotone" dataKey={yAxis} stroke="var(--color-data)" activeDot={{ r: 8 }} />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Visualization Controls</CardTitle>
            <CardDescription>Customize the data display</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="x-axis">X-Axis</Label>
              <Select value={xAxis} onValueChange={setXAxis}>
                <SelectTrigger id="x-axis">
                  <SelectValue placeholder="Select X-Axis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wavelength">Wavelength (nm)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="y-axis">Y-Axis</Label>
              <Select value={yAxis} onValueChange={setYAxis}>
                <SelectTrigger id="y-axis">
                  <SelectValue placeholder="Select Y-Axis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="intensity">Intensity (a.u.)</SelectItem>
                  <SelectItem value="normalized">Normalized Intensity</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="normalize" checked={isNormalized} onCheckedChange={setIsNormalized} />
              <Label htmlFor="normalize">Normalize Data</Label>
            </div>

            <div className="pt-4 space-y-2">
              <Button className="w-full" variant="outline">
                <Download className="mr-2 h-4 w-4" /> Export Data
              </Button>
              <Button className="w-full" variant="outline">
                <Share className="mr-2 h-4 w-4" /> Share Visualization
              </Button>
              <Button className="w-full" variant="outline">
                <Maximize2 className="mr-2 h-4 w-4" /> Full Screen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="parameters" className="space-y-4">
        <TabsList>
          <TabsTrigger value="parameters">Measurement Parameters</TabsTrigger>
          <TabsTrigger value="data">Raw Data</TabsTrigger>
          <TabsTrigger value="compare">Compare</TabsTrigger>
        </TabsList>

        <TabsContent value="parameters">
          <Card>
            <CardHeader>
              <CardTitle>Measurement Parameters</CardTitle>
              <CardDescription>Settings used for this measurement</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {Object.entries(measurement.parameters).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm font-medium text-muted-foreground">
                      {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                    </dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Raw Data</CardTitle>
              <CardDescription>First 10 rows of raw measurement data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr className="divide-x divide-border">
                      <th className="px-4 py-3.5 text-left text-sm font-semibold">Wavelength (nm)</th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold">Intensity (a.u.)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {chartData.slice(0, 10).map((row, i) => (
                      <tr key={i} className="divide-x divide-border">
                        <td className="whitespace-nowrap px-4 py-2 text-sm">{row.wavelength.toFixed(1)}</td>
                        <td className="whitespace-nowrap px-4 py-2 text-sm">{row.intensity.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" /> Download Full Dataset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compare">
          <Card>
            <CardHeader>
              <CardTitle>Compare Measurements</CardTitle>
              <CardDescription>Select other measurements to compare with this one</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Comparison functionality would be implemented here...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

