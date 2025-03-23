import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import VisualizationDetail from "@/components/visualization-detail"

interface VisualizationDetailPageProps {
  params: {
    id: string
  }
}

export default function VisualizationDetailPage({ params }: VisualizationDetailPageProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/visualizations">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Visualization Details</h1>
      </div>

      <VisualizationDetail id={params.id} />
    </div>
  )
}

