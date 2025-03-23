"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { useRouter } from "next/navigation"

interface RecentSamplesProps {
  searchQuery?: string
}

export function RecentSamples({ searchQuery = "" }: RecentSamplesProps) {
  const router = useRouter()

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
      recipeId: "r1",
    },
    {
      id: "2",
      identifier: "T250307B",
      name: "AlGaAs Barrier Test",
      growthDate: new Date("2025-03-07"),
      substrate: "GaAs",
      grower: "Maria Chen",
      measurements: 3,
      recipeId: "r2",
    },
    {
      id: "3",
      identifier: "T250310C",
      name: "InGaAs QD Sample",
      growthDate: new Date("2025-03-10"),
      substrate: "InP",
      grower: "Scott Sifferman",
      measurements: 2,
      recipeId: "r3",
    },
    {
      id: "4",
      identifier: "T250312D",
      name: "GaN HEMT Structure",
      growthDate: new Date("2025-03-12"),
      substrate: "Sapphire",
      grower: "James Wilson",
      measurements: 0,
      recipeId: "r4",
    },
    {
      id: "5",
      identifier: "T250315E",
      name: "AlN Buffer Layer Test",
      growthDate: new Date("2025-03-15"),
      substrate: "SiC",
      grower: "Maria Chen",
      measurements: 1,
      recipeId: "r5",
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

  const handleViewSample = (id: string) => {
    router.push(`/samples/${id}`)
  }

  const handleViewRecipe = (id: string) => {
    router.push(`/recipes/${id}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Samples</CardTitle>
        <CardDescription>Latest samples added to the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {filteredSamples.map((sample) => (
            <div
              key={sample.id}
              className="flex items-center justify-between space-x-4 rounded-md border p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {sample.identifier.substring(0, 2)}
                  </AvatarFallback>
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
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">{sample.measurements} measurements</span>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleViewRecipe(sample.recipeId)
                      }}
                    >
                      View Recipe
                    </Button>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleViewSample(sample.id)}>
                  View
                </Button>
              </div>
            </div>
          ))}

          {filteredSamples.length === 0 && (
            <div className="flex items-center justify-center h-40 bg-muted/20 rounded-lg border border-dashed">
              <p className="text-muted-foreground">No samples found matching your search</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

