import MeasurementForm from "@/components/measurement-form"

export default function NewSampleMeasurementPage({ params }: { params: { id: string } }) {
  return <MeasurementForm initialSampleId={params.id} />
}

