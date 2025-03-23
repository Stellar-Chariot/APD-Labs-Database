"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CircleOff, FlaskConical, FileSpreadsheet, Activity, Layers } from "lucide-react"

export function StatsCards() {
  // In a real implementation, this data would come from GraphQL queries
  const stats = {
    totalSamples: 156,
    measurements: 842,
    recipes: 48,
    processingJobs: 3,
    newResults: 12,
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card className="bg-gradient-to-br from-primary/20 to-primary/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Samples</CardTitle>
          <FlaskConical className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSamples}</div>
          <p className="text-xs text-muted-foreground">+6 added this month</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-secondary/20 to-secondary/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Measurements</CardTitle>
          <FileSpreadsheet className="h-4 w-4 text-secondary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.measurements}</div>
          <p className="text-xs text-muted-foreground">+24 added this month</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-amber-500/20 to-amber-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">MBE Recipes</CardTitle>
          <Layers className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.recipes}</div>
          <p className="text-xs text-muted-foreground">+3 added this month</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Processing Jobs</CardTitle>
          <Activity className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.processingJobs}</div>
          <p className="text-xs text-muted-foreground">2 high priority</p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-rose-500/20 to-rose-500/5">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Results</CardTitle>
          <CircleOff className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.newResults}</div>
          <p className="text-xs text-muted-foreground">Since yesterday</p>
        </CardContent>
      </Card>
    </div>
  )
}

