import { Suspense } from "react"
import { SamplesTable } from "@/components/samples-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SamplesPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Samples</h1>
        <Link href="/samples/new">
          <Button>Add New Sample</Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Samples</CardTitle>
          <CardDescription>View and manage all sample data in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading samples...</div>}>
            <SamplesTable />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}

