export type AuditAction = "create" | "update" | "delete" | "view" | "export" | "import" | "share"

export interface AuditEntry {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: AuditAction
  resourceType: "sample" | "measurement" | "project" | "system"
  resourceId: string
  resourceName: string
  details: Record<string, any>
  ipAddress?: string
  userAgent?: string
}

