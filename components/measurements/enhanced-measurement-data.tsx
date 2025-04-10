"use client"

import { useState, useEffect, useRef } from "react"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts"
import { getMeasurementData } from "@/lib/actions"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Copy, BarChart2, TableIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

interface MeasurementDataPoint {
  id: number
  measurement_id: number
  x_value: number
  y_value: number
  z_value: number | null
  additional_data: any
}

export function EnhancedMeasurementData({
  measurementId,
  measurementName,
}: { measurementId: number; measurementName: string }) {
  const [data, setData] = useState<MeasurementDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const chartRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getMeasurementData(measurementId)
        setData(result)
      } catch (error) {
        console.error("Failed to fetch measurement data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [measurementId])

  const filteredData = data.filter((point) => {
    if (!searchTerm) return true

    const searchValue = searchTerm.toLowerCase()
    return point.x_value.toString().includes(searchValue) || point.y_value.toString().includes(searchValue)
  })

  // Sample the data for the chart if there are too many points
  const sampleStep = Math.max(1, Math.floor(data.length / 200))
  const sampledData = data.filter((_, i) => i % sampleStep === 0)

  const downloadCSV = () => {
    try {
      // Create a CSV string
      let csvContent = "data:text/csv;charset=utf-8,"

      // Add header row
      csvContent += "X Value,Y Value" + (data[0]?.z_value !== null ? ",Z Value" : "") + "\n"

      // Add data rows
      data.forEach((point) => {
        let row = `${point.x_value},${point.y_value}`
        if (point.z_value !== null) row += `,${point.z_value}`
        csvContent += row + "\n"
      })

      // Create download link
      const encodedUri = encodeURI(csvContent)
      const link = document.createElement("a")
      link.setAttribute("href", encodedUri)
      link.setAttribute("download", `${measurementName}_data.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Download started",
        description: "Your data has been downloaded as a CSV file.",
      })
    } catch (error) {
      console.error("Failed to download data:", error)
      toast({
        title: "Download failed",
        description: "There was an error downloading the data.",
        variant: "destructive",
      })
    }
  }

  const copyData = () => {
    try {
      // Create a CSV string
      let csvContent = "X Value,Y Value" + (data[0]?.z_value !== null ? ",Z Value" : "") + "\n"

      // Add data rows
      data.forEach((point) => {
        let row = `${point.x_value},${point.y_value}`
        if (point.z_value !== null) row += `,${point.z_value}`
        csvContent += row + "\n"
      })

      // Copy to clipboard
      navigator.clipboard.writeText(csvContent)

      toast({
        title: "Copied to clipboard",
        description: "Data has been copied to clipboard as CSV.",
      })
    } catch (error) {
      console.error("Failed to copy data:", error)
      toast({
        title: "Copy failed",
        description: "There was an error copying the data to clipboard.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Measurement Data</CardTitle>
          <CardDescription>Loading data...</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div>Loading data...</div>
        </CardContent>
      </Card>
    )
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Measurement Data</CardTitle>
          <CardDescription>No data available for this measurement</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div>No data available</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Measurement Data</CardTitle>
          <CardDescription>View and export data for {measurementName}</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={copyData}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Data
          </Button>
          <Button variant="outline" size="sm" onClick={downloadCSV}>
            <Download className="mr-2 h-4 w-4" />
            Download CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="chart">
          <TabsList className="mb-4">
            <TabsTrigger value="chart">
              <BarChart2 className="h-4 w-4 mr-2" />
              Chart View
            </TabsTrigger>
            <TabsTrigger value="table">
              <TableIcon className="h-4 w-4 mr-2" />
              Table View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="h-[400px]" ref={chartRef}>
            <ChartContainer
              config={{
                data: {
                  label: measurementName,
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sampledData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x_value" label={{ value: "X Value", position: "insideBottom", offset: -5 }} />
                  <YAxis label={{ value: "Y Value", angle: -90, position: "insideLeft" }} />
                  <Tooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="y_value" stroke="var(--color-data)" dot={false} name="Data" />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </TabsContent>

          <TabsContent value="table">
            <div className="mb-4">
              <Input
                placeholder="Search data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {filteredData.length} of {data.length} data points
              </p>
            </div>

            <div className="border rounded-md max-h-[400px] overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    <TableHead className="w-[80px]">#</TableHead>
                    <TableHead>X Value</TableHead>
                    <TableHead>Y Value</TableHead>
                    {data[0]?.z_value !== null && <TableHead>Z Value</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((point, index) => (
                    <TableRow key={point.id}>
                      <TableCell className="font-mono">{index + 1}</TableCell>
                      <TableCell className="font-mono">{point.x_value}</TableCell>
                      <TableCell className="font-mono">{point.y_value}</TableCell>
                      {point.z_value !== null && <TableCell className="font-mono">{point.z_value}</TableCell>}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
