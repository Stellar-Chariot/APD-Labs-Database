export type WorkflowTrigger =
  | "manual"
  | "scheduled"
  | "on_sample_creation"
  | "on_measurement_upload"
  | "on_threshold_exceeded"

export type WorkflowStatus = "draft" | "active" | "paused" | "completed" | "failed"

export type WorkflowStepType =
  | "data_transformation"
  | "notification"
  | "export"
  | "analysis"
  | "approval"
  | "conditional"

export interface WorkflowStep {
  id: string
  name: string
  type: WorkflowStepType
  config: Record<string, any>
  nextSteps: string[] // IDs of next steps
  condition?: {
    field: string
    operator: "equals" | "not_equals" | "greater_than" | "less_than" | "contains"
    value: any
  }
}

export interface Workflow {
  id: string
  name: string
  description: string
  trigger: WorkflowTrigger
  status: WorkflowStatus
  createdBy: string
  createdAt: string
  updatedAt: string
  schedule?: string // Cron expression for scheduled workflows
  steps: WorkflowStep[]
  startStepId: string
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: "running" | "completed" | "failed"
  startedAt: string
  completedAt?: string
  triggeredBy: string
  resourceType?: "sample" | "measurement"
  resourceId?: string
  currentStepId?: string
  logs: {
    timestamp: string
    stepId: string
    message: string
    status: "info" | "warning" | "error" | "success"
  }[]
  results?: Record<string, any>
}

