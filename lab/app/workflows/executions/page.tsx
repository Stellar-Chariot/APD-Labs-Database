"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Clock, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useWorkflowStore } from "@/store/workflow-store"

const statusColors: Record<string, string> = {
  running: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
}

const logStatusColors: Record<string, string> = {
  info: "text-blue-600",
  success: "text-green-600",
  warning: "text-yellow-600",
  error: "text-red-600",
}

export default function WorkflowExecutionsPage() {
  const searchParams = useSearchParams()
  const workflowId = searchParams.get("workflowId")

  const { executions, workflows, fetchExecutions, fetchWorkflows, isLoading } = useWorkflowStore()

  const [selectedExecution, setSelectedExecution] = useState<string | null>(null)

  useEffect(() => {
    fetchWorkflows()
    fetchExecutions(workflowId || undefined)
  }, [fetchWorkflows, fetchExecutions, workflowId])

  const workflow = workflowId ? workflows.find((w) => w.id === workflowId) : null

  const filteredExecutions = workflowId ? executions.filter((e) => e.workflowId === workflowId) : executions

  const selectedExecutionData = selectedExecution ? executions.find((e) => e.id === selectedExecution) : null

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/workflows">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {workflow ? `${workflow.name} - Executions` : "All Workflow Executions"}
          </h1>
          <p className="text-muted-foreground">
            {workflow ? workflow.description : "View the execution history of all workflows"}
          </p>
        </div>
      </div>

      {workflow && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Executions</CardTitle>
              <CardDescription>All runs of this workflow</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{filteredExecutions.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Successful Runs</CardTitle>
              <CardDescription>Completed executions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {filteredExecutions.filter((e) => e.status === "completed").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Failed Runs</CardTitle>
              <CardDescription>Executions with errors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{filteredExecutions.filter((e) => e.status === "failed").length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 border rounded-md overflow-hidden">
          <div className="bg-muted p-4 font-medium">Execution History</div>
          <div className="divide-y">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredExecutions.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">No executions found</div>
            ) : (
              filteredExecutions.map((execution) => (
                <div
                  key={execution.id}
                  className={`p-4 cursor-pointer hover:bg-muted/50 ${
                    selectedExecution === execution.id ? "bg-muted/50" : ""
                  }`}
                  onClick={() => setSelectedExecution(execution.id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">{format(new Date(execution.startedAt), "MMM d, yyyy h:mm a")}</div>
                      <div className="text-sm text-muted-foreground">
                        {execution.triggeredBy === "system"
                          ? "Triggered automatically"
                          : `Triggered by ${execution.triggeredBy}`}
                      </div>
                    </div>
                    <Badge className={statusColors[execution.status]}>{execution.status}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 border rounded-md overflow-hidden">
          {selectedExecutionData ? (
            <Tabs defaultValue="details">
              <div className="bg-muted p-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="logs">Logs</TabsTrigger>
                  <TabsTrigger value="results">Results</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="details" className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                    <div>
                      <Badge className={statusColors[selectedExecutionData.status]}>
                        {selectedExecutionData.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Duration</div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                      {selectedExecutionData.completedAt
                        ? `${Math.round(
                            (new Date(selectedExecutionData.completedAt).getTime() -
                              new Date(selectedExecutionData.startedAt).getTime()) /
                              1000,
                          )} seconds`
                        : "Running..."}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">Started At</div>
                  <div>{format(new Date(selectedExecutionData.startedAt), "PPpp")}</div>
                </div>

                {selectedExecutionData.completedAt && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Completed At</div>
                    <div>{format(new Date(selectedExecutionData.completedAt), "PPpp")}</div>
                  </div>
                )}

                {selectedExecutionData.resourceType && selectedExecutionData.resourceId && (
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Resource</div>
                    <div className="capitalize">
                      {selectedExecutionData.resourceType}: {selectedExecutionData.resourceId}
                    </div>
                  </div>
                )}

                <div className="pt-4">
                  <Button variant="outline" size="sm">
                    <FileDown className="h-4 w-4 mr-2" />
                    Export Execution Details
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="logs" className="p-0">
                <div className="bg-black text-white p-4 font-mono text-sm overflow-auto max-h-96">
                  {selectedExecutionData.logs.map((log, index) => (
                    <div key={index} className="pb-1">
                      <span className="text-gray-400">[{format(new Date(log.timestamp), "HH:mm:ss")}]</span>{" "}
                      <span className={logStatusColors[log.status]}>[{log.status.toUpperCase()}]</span>{" "}
                      <span className="text-yellow-300">[{log.stepId}]</span> {log.message}
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="results" className="p-4">
                {selectedExecutionData.results ? (
                  <Accordion type="single" collapsible className="w-full">
                    {Object.entries(selectedExecutionData.results).map(([key, value], index) => (
                      <AccordionItem key={index} value={key}>
                        <AccordionTrigger className="capitalize">
                          {key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                        </AccordionTrigger>
                        <AccordionContent>
                          {typeof value === "object" ? (
                            <pre className="bg-muted p-2 rounded-md overflow-auto">
                              {JSON.stringify(value, null, 2)}
                            </pre>
                          ) : (
                            <div>{String(value)}</div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="text-center text-muted-foreground py-8">No results available</div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="text-muted-foreground mb-4">Select an execution to view details</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

