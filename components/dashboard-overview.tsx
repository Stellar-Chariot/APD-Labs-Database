"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FlaskRoundIcon as Flask, Microscope, Layers, Database } from "lucide-react"
import { useEffect, useState } from "react"
import { getSummaryData } from "@/lib/actions"

interface SummaryData {
  sampleCount: number
  measurementCount: number
  recipeCount: number
  dataPointCount: number
}

export function DashboardOverview() {
  const [summaryData, setSummaryData] = useState<SummaryData>({
    sampleCount: 0,
    measurementCount: 0,
    recipeCount: 0,
    dataPointCount: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getSummaryData()
        setSummaryData(data)
      } catch (error) {
        console.error("Failed to fetch summary data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Samples</CardTitle>
          <Flask className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "Loading..." : summaryData.sampleCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Measurements</CardTitle>
          <Microscope className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "Loading..." : summaryData.measurementCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">MBE Recipes</CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "Loading..." : summaryData.recipeCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Data Points</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "Loading..." : summaryData.dataPointCount}</div>
        </CardContent>
      </Card>
    </div>
  )
}
