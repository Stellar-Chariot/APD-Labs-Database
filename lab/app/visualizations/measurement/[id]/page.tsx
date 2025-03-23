import MeasurementVisualization from "@/components/measurement-visualization"

export default function MeasurementVisualizationPage({ params }: { params: { id: string } }) {
  return <MeasurementVisualization id={params.id} />
}

