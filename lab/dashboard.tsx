"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RecentSamples } from "./recent-samples"
import { ActivityLog } from "./activity-log"
import { StatsCards } from "./stats-cards"
import { SearchBar } from "./search-bar"

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Scientific Data Dashboard</h1>
        <SearchBar onSearch={setSearchQuery} />
      </div>

      <StatsCards />

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="samples">Recent Samples</TabsTrigger>
          <TabsTrigger value="measurements">Recent Measurements</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="space-y-4">
          <ActivityLog />
        </TabsContent>
        <TabsContent value="samples" className="space-y-4">
          <RecentSamples searchQuery={searchQuery} />
        </TabsContent>
        <TabsContent value="measurements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Measurements</CardTitle>
              <CardDescription>Latest measurements across all samples</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Measurement list component would go here */}
              <p>Measurement data loading...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

