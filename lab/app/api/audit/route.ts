import { type NextRequest, NextResponse } from "next/server"
import { getAuditLog } from "@/lib/audit"
import { withAuth } from "@/lib/auth"

export const GET = withAuth(async (req: NextRequest, user) => {
  // Only admins can access the full audit log
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const url = new URL(req.url)

  // Parse filters from query parameters
  const filters = {
    userId: url.searchParams.get("userId") || undefined,
    action: (url.searchParams.get("action") as any) || undefined,
    resourceType: (url.searchParams.get("resourceType") as any) || undefined,
    resourceId: url.searchParams.get("resourceId") || undefined,
    fromDate: url.searchParams.get("fromDate") || undefined,
    toDate: url.searchParams.get("toDate") || undefined,
  }

  // Parse pagination
  const page = Number.parseInt(url.searchParams.get("page") || "1")
  const limit = Number.parseInt(url.searchParams.get("limit") || "50")

  const result = await getAuditLog(filters, { page, limit })

  return NextResponse.json(result)
})

