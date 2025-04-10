import { Heading } from "@/components/ui/heading"
import { DataImportForm } from "@/components/data-import/data-import-form"

export default function DataImportPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Heading title="Data Import" description="Import measurement data from files" />
      <DataImportForm />
    </div>
  )
}
