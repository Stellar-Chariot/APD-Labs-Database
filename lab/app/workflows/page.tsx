"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Play, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWorkflowStore } from "@/store/workflow-store"
import type { Workflow, WorkflowStatus, WorkflowTrigger } from "@/types/workflow-types"

const statusColors: Record<WorkflowStatus, string> = {
  draft: "bg-gray-200 text-gray-800",
  active: "bg-green-100 text-green-800",
  paused: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
}

const triggerLabels: Record<WorkflowTrigger, string> = {
  manual: "Manual",
  scheduled: "Scheduled",
  on_sample_creation: "On Sample Creation",
  on_measurement_upload: "On Measurement Upload",
  on_threshold_exceeded: "On Threshold Exceeded",
}

export default function WorkflowsPage() {
  const router = useRouter()
  const { workflows, fetchWorkflows, executeWorkflow, isLoading } = useWorkflowStore()
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [triggerFilter, setTriggerFilter] = useState<string>("")

  useEffect(() => {
    fetchWorkflows()
  }, [fetchWorkflows])

  const filteredWorkflows = workflows.filter((workflow) => {
    if (statusFilter && workflow.status !== statusFilter) return false
    if (triggerFilter && workflow.trigger !== triggerFilter) return false
    return true
  })

  const handleExecute = async (workflow: Workflow) => {
    try {
      await executeWorkflow(workflow.id)
      router.push(`/workflows/executions?workflowId=${workflow.id}`)
    } catch (error) {
      console.error("Failed to execute workflow:", error)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Workflows</h1>
          <p className="text-muted-foreground">Manage and automate your data processing workflows</p>
        </div>
        <Button asChild>
          <Link href="/workflows/create">
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Workflows</CardTitle>
            <CardDescription>All configured workflows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{workflows.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Workflows</CardTitle>
            <CardDescription>Currently running workflows</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{workflows.filter((w) => w.status === "active").length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Automated Workflows</CardTitle>
            <CardDescription>Triggered automatically</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{workflows.filter((w) => w.trigger !== "manual").length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="w-full md:w-1/4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/4">
          <Select value={triggerFilter} onValueChange={setTriggerFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by trigger" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Triggers</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="on_sample_creation">On Sample Creation</SelectItem>
              <SelectItem value="on_measurement_upload">On Measurement Upload</SelectItem>
              <SelectItem value="on_threshold_exceeded">On Threshold Exceeded</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Trigger</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredWorkflows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No workflows found
                </TableCell>
              </TableRow>
            ) : (
              filteredWorkflows.map((workflow) => (
                <TableRow key={workflow.id}>
                  <TableCell>
                    <Link href={`/workflows/${workflow.id}`} className="font-medium hover:underline">
                      {workflow.name}
                    </Link>
                    <div className="text-sm text-muted-foreground">{workflow.description}</div>
                  </TableCell>
                  <TableCell>
                    {triggerLabels[workflow.trigger]}
                    {workflow.trigger === "scheduled" && workflow.schedule && (
                      <div className="text-xs text-muted-foreground">Schedule: {workflow.schedule}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[workflow.status]}>{workflow.status}</Badge>
                  </TableCell>
                  <TableCell>{format(new Date(workflow.createdAt), "MMM d, yyyy")}</TableCell>
                  <TableCell>{format(new Date(workflow.updatedAt), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExecute(workflow)}
                        disabled={workflow.status !== "active"}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Run
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/workflows/executions?workflowId=${workflow.id}`}>History</Link>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

