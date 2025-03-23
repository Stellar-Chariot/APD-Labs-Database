"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"

interface RecentSamplesProps {
  searchQuery?: string
}

export function RecentSamples({ searchQuery = "" }: RecentSamplesProps) {
  // In a real implementation, this would be fetched via GraphQL
  const samples = [
    {
      id: "1",
      identifier: "T250306A",
      name: "GaAs QW Structure",
      growthDate: new Date("2025-03-06"),
      substrate: "GaAs",
      grower: "Scott Sifferman",
      measurements: 5,
    },
    {
      id: "2",
      identifier: "T250307B",
      name: "AlGaAs Barrier Test",
      growthDate: new Date("2025-03-07"),
      substrate: "GaAs",
      grower: "Maria Chen",
      measurements: 3,
    },
    {
      id: "3",
      identifier: "T250310C",
      name: "InGaAs QD Sample",
      growthDate: new Date("2025-03-10"),
      substrate: "InP",
      grower: "Scott Sifferman",
      measurements: 2,
    },
    {
      id: "4",
      identifier: "T250312D",
      name: "GaN HEMT Structure",
      growthDate: new Date("2025-03-12"),
      substrate: "Sapphire",
      grower: "James Wilson",
      measurements: 0,
    },
    {
      id: "5",
      identifier: "T250315E",
      name: "AlN Buffer Layer Test",
      growthDate: new Date("2025-03-15"),
      substrate: "SiC",
      grower: "Maria Chen",
      measurements: 1,
    },
  ]

  const filteredSamples = searchQuery
    ? samples.filter(
        (sample) =>
          sample.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sample.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          sample.grower.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : samples

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Samples</CardTitle>
        <CardDescription>Latest samples added to the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredSamples.map((sample) => (
            <div key={sample.id} className="flex items-center justify-between space-x-4 rounded-md border p-4">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback>{sample.identifier.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none">{sample.identifier}</p>
                  <p className="text-sm text-muted-foreground">{sample.name}</p>
                  <div className="flex items-center pt-2">
                    <Badge variant="outline" className="mr-1">
                      {sample.substrate}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(sample.growthDate, { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium">{sample.grower}</span>
                  <span className="text-xs text-muted-foreground">{sample.measurements} measurements</span>
                </div>
                <Button variant="outline" size="sm">
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

