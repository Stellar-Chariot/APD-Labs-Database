import { MeasurementAnalysis } from "@/components/domain/measurements/measurement-analysis"

export default function MeasurementAnalysisPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Measurement Analysis</h1>
      <MeasurementAnalysis measurementId={params.id} />
    </div>
  )
}

