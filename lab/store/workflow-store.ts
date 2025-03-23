import { create } from "zustand"
import { v4 as uuidv4 } from "uuid"
import type { Workflow, WorkflowExecution } from "@/types/workflow-types"
import { useNotificationStore } from "./notification-store"

// Mock data for workflows
const mockWorkflows: Workflow[] = [
  {
    id: "workflow-1",
    name: "New Sample Processing",
    description: "Automatically process new samples when they are created",
    trigger: "on_sample_creation",
    status: "active",
    createdBy: "user-1",
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2023-01-15T10:30:00Z",
    steps: [
      {
        id: "step-1",
        name: "Validate Sample Data",
        type: "data_transformation",
        config: {
          validations: [
            { field: "name", rule: "required" },
            { field: "type", rule: "required" },
          ],
        },
        nextSteps: ["step-2"],
      },
      {
        id: "step-2",
        name: "Check Sample Type",
        type: "conditional",
        config: {},
        condition: {
          field: "type",
          operator: "equals",
          value: "silicon",
        },
        nextSteps: ["step-3a", "step-3b"],
      },
      {
        id: "step-3a",
        name: "Silicon Processing",
        type: "analysis",
        config: {
          analysisType: "silicon_standard",
        },
        nextSteps: ["step-4"],
      },
      {
        id: "step-3b",
        name: "Other Material Processing",
        type: "analysis",
        config: {
          analysisType: "general",
        },
        nextSteps: ["step-4"],
      },
      {
        id: "step-4",
        name: "Notify Creator",
        type: "notification",
        config: {
          template: "sample_processed",
          recipients: ["creator"],
        },
        nextSteps: [],
      },
    ],
    startStepId: "step-1",
  },
  {
    id: "workflow-2",
    name: "Weekly Data Export",
    description: "Export all new data on a weekly basis",
    trigger: "scheduled",
    status: "active",
    createdBy: "user-1",
    createdAt: "2023-02-10T14:15:00Z",
    updatedAt: "2023-02-10T14:15:00Z",
    schedule: "0 0 * * 0", // Every Sunday at midnight
    steps: [
      {
        id: "step-1",
        name: "Collect New Data",
        type: "data_transformation",
        config: {
          query: "createdAt > 'last_week'",
        },
        nextSteps: ["step-2"],
      },
      {
        id: "step-2",
        name: "Export to CSV",
        type: "export",
        config: {
          format: "csv",
          destination: "file_storage",
        },
        nextSteps: ["step-3"],
      },
      {
        id: "step-3",
        name: "Notify Admin",
        type: "notification",
        config: {
          template: "export_completed",
          recipients: ["admin"],
        },
        nextSteps: [],
      },
    ],
    startStepId: "step-1",
  },
]

// Mock data for workflow executions
const mockExecutions: WorkflowExecution[] = [
  {
    id: "execution-1",
    workflowId: "workflow-1",
    status: "completed",
    startedAt: "2023-03-20T09:45:00Z",
    completedAt: "2023-03-20T09:46:30Z",
    triggeredBy: "user-2",
    resourceType: "sample",
    resourceId: "sample-123",
    logs: [
      {
        timestamp: "2023-03-20T09:45:00Z",
        stepId: "step-1",
        message: "Starting validation of sample data",
        status: "info",
      },
      {
        timestamp: "2023-03-20T09:45:10Z",
        stepId: "step-1",
        message: "Sample data validated successfully",
        status: "success",
      },
      {
        timestamp: "2023-03-20T09:45:20Z",
        stepId: "step-2",
        message: "Checking sample type",
        status: "info",
      },
      {
        timestamp: "2023-03-20T09:45:30Z",
        stepId: "step-3a",
        message: "Running silicon standard analysis",
        status: "info",
      },
      {
        timestamp: "2023-03-20T09:46:00Z",
        stepId: "step-3a",
        message: "Analysis completed successfully",
        status: "success",
      },
      {
        timestamp: "2023-03-20T09:46:10Z",
        stepId: "step-4",
        message: "Sending notification to creator",
        status: "info",
      },
      {
        timestamp: "2023-03-20T09:46:30Z",
        stepId: "step-4",
        message: "Notification sent successfully",
        status: "success",
      },
    ],
    results: {
      validationPassed: true,
      analysisResults: {
        purity: 0.998,
        defects: "minimal",
        recommendation: "Proceed with experiment",
      },
    },
  },
  {
    id: "execution-2",
    workflowId: "workflow-2",
    status: "completed",
    startedAt: "2023-03-19T00:00:00Z",
    completedAt: "2023-03-19T00:05:45Z",
    triggeredBy: "system",
    logs: [
      {
        timestamp: "2023-03-19T00:00:00Z",
        stepId: "step-1",
        message: "Collecting new data from the past week",
        status: "info",
      },
      {
        timestamp: "2023-03-19T00:02:30Z",
        stepId: "step-1",
        message: "Collected 42 new records",
        status: "success",
      },
      {
        timestamp: "2023-03-19T00:02:45Z",
        stepId: "step-2",
        message: "Exporting data to CSV",
        status: "info",
      },
      {
        timestamp: "2023-03-19T00:04:15Z",
        stepId: "step-2",
        message: "Export completed successfully",
        status: "success",
      },
      {
        timestamp: "2023-03-19T00:04:30Z",
        stepId: "step-3",
        message: "Sending notification to admin",
        status: "info",
      },
      {
        timestamp: "2023-03-19T00:05:45Z",
        stepId: "step-3",
        message: "Notification sent successfully",
        status: "success",
      },
    ],
    results: {
      recordsExported: 42,
      exportPath: "/exports/weekly/2023-03-19.csv",
      notificationSent: true,
    },
  },
]

interface WorkflowState {
  workflows: Workflow[]
  executions: WorkflowExecution[]
  isLoading: boolean
  error: string | null

  fetchWorkflows: () => Promise<void>
  fetchWorkflowById: (id: string) => Promise<Workflow | null>
  fetchExecutions: (workflowId?: string) => Promise<void>
  fetchExecutionById: (id: string) => Promise<WorkflowExecution | null>

  createWorkflow: (workflow: Omit<Workflow, "id" | "createdAt" | "updatedAt">) => Promise<Workflow>
  updateWorkflow: (id: string, updates: Partial<Workflow>) => Promise<Workflow>
  deleteWorkflow: (id: string) => Promise<void>

  executeWorkflow: (
    workflowId: string,
    params?: {
      resourceType?: "sample" | "measurement"
      resourceId?: string
    },
  ) => Promise<WorkflowExecution>
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  workflows: [...mockWorkflows],
  executions: [...mockExecutions],
  isLoading: false,
  error: null,

  fetchWorkflows: async () => {
    set({ isLoading: true, error: null })
    try {
      // In a real app, this would be an API call
      // For now, we'll just use the mock data
      set({ workflows: [...mockWorkflows], isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch workflows",
        isLoading: false,
      })
    }
  },

  fetchWorkflowById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      // In a real app, this would be an API call
      const workflow = mockWorkflows.find((w) => w.id === id) || null
      set({ isLoading: false })
      return workflow
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch workflow",
        isLoading: false,
      })
      return null
    }
  },

  fetchExecutions: async (workflowId?: string) => {
    set({ isLoading: true, error: null })
    try {
      // In a real app, this would be an API call
      const executions = workflowId ? mockExecutions.filter((e) => e.workflowId === workflowId) : [...mockExecutions]

      set({ executions, isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch executions",
        isLoading: false,
      })
    }
  },

  fetchExecutionById: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      // In a real app, this would be an API call
      const execution = mockExecutions.find((e) => e.id === id) || null
      set({ isLoading: false })
      return execution
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch execution",
        isLoading: false,
      })
      return null
    }
  },

  createWorkflow: async (workflowData) => {
    set({ isLoading: true, error: null })
    try {
      // In a real app, this would be an API call
      const now = new Date().toISOString()
      const newWorkflow: Workflow = {
        ...workflowData,
        id: `workflow-${uuidv4()}`,
        createdAt: now,
        updatedAt: now,
      }

      set((state) => ({
        workflows: [...state.workflows, newWorkflow],
        isLoading: false,
      }))

      return newWorkflow
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create workflow",
        isLoading: false,
      })
      throw error
    }
  },

  updateWorkflow: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      // In a real app, this would be an API call
      const now = new Date().toISOString()

      set((state) => {
        const updatedWorkflows = state.workflows.map((workflow) =>
          workflow.id === id ? { ...workflow, ...updates, updatedAt: now } : workflow,
        )

        return { workflows: updatedWorkflows, isLoading: false }
      })

      const updatedWorkflow = get().workflows.find((w) => w.id === id)
      if (!updatedWorkflow) throw new Error("Workflow not found")

      return updatedWorkflow
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update workflow",
        isLoading: false,
      })
      throw error
    }
  },

  deleteWorkflow: async (id) => {
    set({ isLoading: true, error: null })
    try {
      // In a real app, this would be an API call
      set((state) => ({
        workflows: state.workflows.filter((workflow) => workflow.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete workflow",
        isLoading: false,
      })
      throw error
    }
  },

  executeWorkflow: async (workflowId, params = {}) => {
    set({ isLoading: true, error: null })
    try {
      // In a real app, this would be an API call
      const workflow = get().workflows.find((w) => w.id === workflowId)
      if (!workflow) throw new Error("Workflow not found")

      const now = new Date().toISOString()
      const execution: WorkflowExecution = {
        id: `execution-${uuidv4()}`,
        workflowId,
        status: "running",
        startedAt: now,
        triggeredBy: "user-1", // In a real app, this would be the current user
        resourceType: params.resourceType,
        resourceId: params.resourceId,
        currentStepId: workflow.startStepId,
        logs: [
          {
            timestamp: now,
            stepId: workflow.startStepId,
            message: `Starting workflow execution: ${workflow.name}`,
            status: "info",
          },
        ],
      }

      set((state) => ({
        executions: [...state.executions, execution],
        isLoading: false,
      }))

      // Simulate workflow execution (in a real app, this would be handled by a backend service)
      setTimeout(() => {
        const completedExecution: WorkflowExecution = {
          ...execution,
          status: "completed",
          completedAt: new Date().toISOString(),
          logs: [
            ...execution.logs,
            {
              timestamp: new Date().toISOString(),
              stepId: workflow.steps[workflow.steps.length - 1].id,
              message: `Workflow execution completed: ${workflow.name}`,
              status: "success",
            },
          ],
          results: {
            success: true,
            message: "Workflow executed successfully",
          },
        }

        set((state) => ({
          executions: state.executions.map((e) => (e.id === execution.id ? completedExecution : e)),
        }))

        // Add a notification
        useNotificationStore.getState().addNotification({
          type: "success",
          title: "Workflow Completed",
          message: `The workflow "${workflow.name}" has completed successfully.`,
        })
      }, 5000) // Simulate a 5-second execution

      return execution
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to execute workflow",
        isLoading: false,
      })
      throw error
    }
  },
}))

