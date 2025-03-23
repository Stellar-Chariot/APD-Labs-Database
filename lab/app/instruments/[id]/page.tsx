import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import InstrumentDetail from "@/components/instrument-detail"

interface InstrumentDetailPageProps {
  params: {
    id: string
  }
}

export default function InstrumentDetailPage({ params }: InstrumentDetailPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/instruments">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Instrument Details</h1>
      </div>

      <InstrumentDetail id={params.id} />
    </div>
  )
}

