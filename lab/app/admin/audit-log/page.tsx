"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Download, Search } from "lucide-react"
import type { AuditEntry } from "@/types/audit-types"
import { useAuthStore } from "@/store/auth-store"
import { cn } from "@/lib/utils"

export default function AuditLogPage() {
  const { user } = useAuthStore()
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [limit] = useState(50)

  // Filters
  const [filters, setFilters] = useState({
    userId: "",
    action: "",
    resourceType: "",
    resourceId: "",
    fromDate: null as Date | null,
    toDate: null as Date | null,
  })

  const fetchAuditLog = async () => {
    setIsLoading(true)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })

      if (filters.userId) params.set("userId", filters.userId)
      if (filters.action) params.set("action", filters.action)
      if (filters.resourceType) params.set("resourceType", filters.resourceType)
      if (filters.resourceId) params.set("resourceId", filters.resourceId)
      if (filters.fromDate) params.set("fromDate", filters.fromDate.toISOString())
      if (filters.toDate) params.set("toDate", filters.toDate.toISOString())

      const response = await fetch(`/api/audit?${params.toString()}`)

      if (!response.ok) {
        throw new Error("Failed to fetch audit log")
      }

      const data = await response.json()
      setEntries(data.entries)
      setTotal(data.total)
    } catch (error) {
      console.error("Error fetching audit log:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (user?.role === "admin") {
      fetchAuditLog()
    }
  }, [user, page])

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    setPage(1)
    fetchAuditLog()
  }

  const handleReset = () => {
    setFilters({
      userId: "",
      action: "",
      resourceType: "",
      resourceId: "",
      fromDate: null,
      toDate: null,
    })
    setPage(1)
    fetchAuditLog()
  }

  const handleExport = () => {
    const csv = [
      // CSV header
      ["ID", "Timestamp", "User", "Action", "Resource Type", "Resource ID", "Resource Name", "Details"],
      // CSV data
      ...entries.map((entry) => [
        entry.id,
        entry.timestamp,
        entry.userName,
        entry.action,
        entry.resourceType,
        entry.resourceId,
        entry.resourceName,
        JSON.stringify(entry.details),
      ]),
    ]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (user?.role !== "admin") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">You do not have permission to view the audit log.</p>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground">View and search system activity</p>
      </div>

      <div className="border rounded-md p-4 bg-card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="action">Action</Label>
            <Select value={filters.action} onValueChange={(value) => handleFilterChange("action", value)}>
              <SelectTrigger id="action">
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="export">Export</SelectItem>
                <SelectItem value="import">Import</SelectItem>
                <SelectItem value="share">Share</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resourceType">Resource Type</Label>
            <Select value={filters.resourceType} onValueChange={(value) => handleFilterChange("resourceType", value)}>
              <SelectTrigger id="resourceType">
                <SelectValue placeholder="All resources" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All resources</SelectItem>
                <SelectItem value="sample">Sample</SelectItem>
                <SelectItem value="measurement">Measurement</SelectItem>
                <SelectItem value="project">Project</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="resourceId">Resource ID</Label>
            <Input
              id="resourceId"
              value={filters.resourceId}
              onChange={(e) => handleFilterChange("resourceId", e.target.value)}
              placeholder="Enter resource ID"
            />
          </div>

          <div className="space-y-2">
            <Label>From Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.fromDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.fromDate ? format(filters.fromDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.fromDate}
                  onSelect={(date) => handleFilterChange("fromDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>To Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.toDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.toDate ? format(filters.toDate, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.toDate}
                  onSelect={(date) => handleFilterChange("toDate", date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              value={filters.userId}
              onChange={(e) => handleFilterChange("userId", e.target.value)}
              placeholder="Enter user ID"
            />
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset Filters
          </Button>
          <div className="flex gap-2">
            <Button onClick={handleExport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Resource Name</TableHead>
              <TableHead>Details</TableHead>
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
            ) : entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No audit entries found
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(entry.timestamp), "MMM d, yyyy HH:mm:ss")}
                  </TableCell>
                  <TableCell>{entry.userName}</TableCell>
                  <TableCell className="capitalize">{entry.action}</TableCell>
                  <TableCell className="capitalize">{entry.resourceType}</TableCell>
                  <TableCell>{entry.resourceName}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="link" className="h-auto p-0">
                          View Details
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <pre className="text-xs overflow-auto max-h-60 p-2 bg-muted rounded">
                          {JSON.stringify(entry.details, null, 2)}
                        </pre>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1}-{Math.min(page * limit, total)} of {total} entries
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

