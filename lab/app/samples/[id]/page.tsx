"use client"

import { useEffect } from "react"
import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Edit, Trash } from "lucide-react"
import Link from "next/link"
import { useSampleStore } from "@/store/sample-store"
import { Comments } from "@/components/comments"
import { ShareResource } from "@/components/share-resource"
import { useAuthStore } from "@/store/auth-store"

export default function SampleDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { user } = useAuthStore()
  const { sample, fetchSampleById, isLoading } = useSampleStore()

  useEffect(() => {
    fetchSampleById(id)
  }, [fetchSampleById, id])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!sample) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h1 className="text-2xl font-bold">Sample not found</h1>
        <p className="text-muted-foreground">The sample you are looking for does not exist or has been deleted.</p>
        <Button asChild className="mt-4">
          <Link href="/samples">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Samples
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/samples">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{sample.name}</h1>
            <p className="text-muted-foreground">
              {sample.type} • Created by {sample.createdBy} on {new Date(sample.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <ShareResource resourceType="sample" resourceId={sample.id} resourceName={sample.name} />
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/samples/${sample.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" size="sm">
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="details">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="measurements">Measurements</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Sample Information</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-2 text-sm">
                  <div className="grid grid-cols-3 gap-1">
                    <dt className="font-medium text-muted-foreground">ID:</dt>
                    <dd className="col-span-2">{sample.id}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <dt className="font-medium text-muted-foreground">Name:</dt>
                    <dd className="col-span-2">{sample.name}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <dt className="font-medium text-muted-foreground">Type:</dt>
                    <dd className="col-span-2">{sample.type}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <dt className="font-medium text-muted-foreground">Description:</dt>
                    <dd className="col-span-2">{sample.description}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <dt className="font-medium text-muted-foreground">Created By:</dt>
                    <dd className="col-span-2">{sample.createdBy}</dd>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    <dt className="font-medium text-muted-foreground">Created At:</dt>
                    <dd className="col-span-2">{new Date(sample.createdAt).toLocaleString()}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Recipe</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 gap-2 text-sm">
                  {sample.growthRecipe &&
                    Object.entries(sample.growthRecipe).map(([key, value]) => (
                      <div key={key} className="grid grid-cols-3 gap-1">
                        <dt className="font-medium text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}:
                        </dt>
                        <dd className="col-span-2">{value}</dd>
                      </div>
                    ))}
                </dl>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                {sample.metadata &&
                  Object.entries(sample.metadata).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-3 gap-1">
                      <dt className="font-medium text-muted-foreground capitalize">
                        {key.replace(/([A-Z])/g, " $1").trim()}:
                      </dt>
                      <dd className="col-span-2">{value}</dd>
                    </div>
                  ))}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="measurements">
          <Card>
            <CardHeader>
              <CardTitle>Measurements</CardTitle>
            </CardHeader>
            <CardContent>{/* Measurements content */}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Sample History</CardTitle>
            </CardHeader>
            <CardContent>{/* History content */}</CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card>
            <CardContent className="p-6">
              <Comments resourceType="sample" resourceId={sample.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

