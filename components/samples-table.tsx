"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Eye, Trash2, AlertTriangle } from "lucide-react"
import { useSamplesQuery, useDeleteSample } from "@/hooks/use-query-samples"
import { ErrorDisplay, EmptyStateError } from "@/components/ui/error-display"
import { ErrorBoundary } from "@/components/error-boundary"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function SamplesTable({ sampleId }: { sampleId?: string }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [sampleToDelete, setSampleToDelete] = useState<string | null>(null)

  // Use React Query to fetch samples
  const { data: samples, isLoading, error, refetch } = useSamplesQuery()

  // Use React Query mutation for deleting samples
  const deleteSampleMutation = useDeleteSample()

  // Safely filter samples, ensuring samples is an array
  const filteredSamples = Array.isArray(samples)
    ? samples
        .filter((s) => !sampleId || s.id === sampleId)
        .filter((sample) => {
          const searchString = searchQuery.toLowerCase()
          return (
            sample.id.toLowerCase().includes(searchString) ||
            (sample.name?.toLowerCase() || "").includes(searchString) ||
            (sample.type?.toLowerCase() || "").includes(searchString)
          )
        })
    : []

  const handleViewSample = (id: string) => {
    if (!id) {
      console.error("Cannot navigate to sample detail: Missing ID")
      return
    }
    router.push(`/samples/${encodeURIComponent(id)}`)
  }

  const handleDeleteSample = async () => {
    if (sampleToDelete) {
      await deleteSampleMutation.mutateAsync(sampleToDelete)
      setSampleToDelete(null)
    }
  }

  return (
    <ErrorBoundary>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search samples..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
            disabled={isLoading}
            aria-label="Search samples"
          />
        </div>

        {isLoading ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Measurements</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
                      Loading samples...
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ) : error ? (
          <ErrorDisplay
            title="Failed to load samples"
            message={error instanceof Error ? error.message : "Unknown error"}
            onRetry={() => refetch()}
          />
        ) : filteredSamples.length === 0 ? (
          <EmptyStateError
            title={searchQuery ? "No matching samples" : "No samples available"}
            message={
              searchQuery
                ? "No samples match your search criteria. Try adjusting your search terms."
                : "There are no samples available in the system."
            }
            actionLabel={searchQuery ? "Clear Search" : "Add Sample"}
            onAction={searchQuery ? () => setSearchQuery("") : () => router.push("/samples/new")}
          />
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Created</TableHead>
                  <TableHead>Measurements</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSamples.map((sample) => (
                  <TableRow key={sample.id}>
                    <TableCell className="font-mono text-xs">{sample.id}</TableCell>
                    <TableCell>{sample.name || "Unnamed"}</TableCell>
                    <TableCell>{sample.type || "N/A"}</TableCell>
                    <TableCell>{new Date(sample.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{sample.measurementCount || 0}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewSample(sample.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>

                        <AlertDialog
                          open={sampleToDelete === sample.id}
                          onOpenChange={(open) => !open && setSampleToDelete(null)}
                        >
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => setSampleToDelete(sample.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center">
                                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                                Delete Sample
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this sample? This action cannot be undone and will also
                                delete all associated measurements.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteSample}
                                className="bg-red-500 hover:bg-red-600"
                                disabled={deleteSampleMutation.isPending}
                              >
                                {deleteSampleMutation.isPending ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </ErrorBoundary>
  )
}

