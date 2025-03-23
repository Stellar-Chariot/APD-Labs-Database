import { redirect } from "next/navigation"
import MeasurementDetail from "@/components/measurement-detail"

export default function MeasurementPage({ params }: { params: { id: string } }) {
  // Handle special routes
  if (params.id === "new") {
    redirect("/measurements/new")
  }

  // Handle the compare route
  if (params.id === "compare") {
    redirect("/measurements/compare")
  }

  return <MeasurementDetail id={params.id} />
}

