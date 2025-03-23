import { v4 as uuidv4 } from "uuid"
import type { AuditAction, AuditEntry } from "@/types/audit-types"
import type { User } from "@/lib/auth"

// In a real application, this would be stored in a database
const auditLog: AuditEntry[] = []

export async function logAction(
  user: User,
  action: AuditAction,
  resourceType: AuditEntry["resourceType"],
  resourceId: string,
  resourceName: string,
  details: Record<string, any> = {},
  request?: Request,
): Promise<AuditEntry> {
  const entry: AuditEntry = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    userId: user.id,
    userName: user.name,
    action,
    resourceType,
    resourceId,
    resourceName,
    details,
  }

  // Add IP and user agent if request is provided
  if (request) {
    const headers = new Headers(request.headers)
    entry.ipAddress = headers.get("x-forwarded-for") || "unknown"
    entry.userAgent = headers.get("user-agent") || "unknown"
  }

  // In a real application, this would be stored in a database
  auditLog.push(entry)

  return entry
}

export async function getAuditLog(
  filters: Partial<{
    userId: string
    action: AuditAction
    resourceType: AuditEntry["resourceType"]
    resourceId: string
    fromDate: string
    toDate: string
  }> = {},
  pagination: { page: number; limit: number } = { page: 1, limit: 50 },
): Promise<{ entries: AuditEntry[]; total: number }> {
  // Filter the audit log
  let filtered = [...auditLog]

  if (filters.userId) {
    filtered = filtered.filter((entry) => entry.userId === filters.userId)
  }

  if (filters.action) {
    filtered = filtered.filter((entry) => entry.action === filters.action)
  }

  if (filters.resourceType) {
    filtered = filtered.filter((entry) => entry.resourceType === filters.resourceType)
  }

  if (filters.resourceId) {
    filtered = filtered.filter((entry) => entry.resourceId === filters.resourceId)
  }

  if (filters.fromDate) {
    filtered = filtered.filter((entry) => entry.timestamp >= filters.fromDate)
  }

  if (filters.toDate) {
    filtered = filtered.filter((entry) => entry.timestamp <= filters.toDate)
  }

  // Sort by timestamp (newest first)
  filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Paginate
  const start = (pagination.page - 1) * pagination.limit
  const end = start + pagination.limit
  const entries = filtered.slice(start, end)

  return {
    entries,
    total: filtered.length,
  }
}

export async function getResourceHistory(
  resourceType: AuditEntry["resourceType"],
  resourceId: string,
): Promise<AuditEntry[]> {
  // Filter the audit log for the specific resource
  const history = auditLog.filter((entry) => entry.resourceType === resourceType && entry.resourceId === resourceId)

  // Sort by timestamp (oldest first)
  history.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  return history
}

