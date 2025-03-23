"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

export function ActivityLog() {
  // In a real implementation, this would be fetched via GraphQL
  const activities = [
    {
      id: "1",
      userId: "user1",
      username: "sscott",
      action: "CREATE_MEASUREMENT",
      description: "Added new UV PL measurement to sample T250306A",
      timestamp: new Date("2025-03-20T14:30:00Z"),
      resourceType: "Measurement",
      resourceId: "m1",
      sampleId: "1",
    },
    {
      id: "2",
      userId: "user2",
      username: "mchen",
      action: "CREATE_SAMPLE",
      description: "Created new sample T250315E",
      timestamp: new Date("2025-03-15T10:15:00Z"),
      resourceType: "Sample",
      resourceId: "s5",
      sampleId: "5",
    },
    {
      id: "3",
      userId: "user1",
      username: "sscott",
      action: "UPDATE_RECIPE",
      description: "Updated MBE recipe for sample T250310C",
      timestamp: new Date("2025-03-14T09:45:00Z"),
      resourceType: "MBERecipe",
      resourceId: "r3",
      sampleId: "3",
    },
    {
      id: "4",
      userId: "user3",
      username: "jwilson",
      action: "CREATE_MEASUREMENT",
      description: "Added new IR PL measurement to sample T250312D",
      timestamp: new Date("2025-03-13T16:20:00Z"),
      resourceType: "Measurement",
      resourceId: "m4",
      sampleId: "4",
    },
    {
      id: "5",
      userId: "user2",
      username: "mchen",
      action: "CREATE_VISUALIZATION",
      description: "Created new visualization comparing samples T250306A and T250307B",
      timestamp: new Date("2025-03-12T11:05:00Z"),
      resourceType: "Visualization",
      resourceId: "v1",
      sampleId: "1,2",
    },
  ]

  const getActionColor = (action: string) => {
    switch (action) {
      case "CREATE_SAMPLE":
        return "bg-primary/20 text-primary-foreground dark:bg-primary/30 dark:text-primary-foreground"
      case "CREATE_MEASUREMENT":
        return "bg-secondary/20 text-secondary-foreground dark:bg-secondary/30 dark:text-secondary-foreground"
      case "UPDATE_RECIPE":
        return "bg-amber-500/20 text-amber-800 dark:bg-amber-500/30 dark:text-amber-300"
      case "CREATE_VISUALIZATION":
        return "bg-purple-500/20 text-purple-800 dark:bg-purple-500/30 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
        <CardDescription>Recent actions performed in the system</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-4">
              <div className="w-10 text-center">
                <span className="text-xs font-medium text-muted-foreground">
                  {activity.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center">
                  <span className="font-medium">{activity.username}</span>
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${getActionColor(activity.action)}`}
                  >
                    {activity.action.replace(/_/g, " ")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{activity.description}</p>
                <p className="text-xs text-muted-foreground flex gap-2">
                  {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                  {activity.sampleId && (
                    <Link href={`/samples/${activity.sampleId.split(",")[0]}`} className="text-primary hover:underline">
                      View Sample
                    </Link>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

