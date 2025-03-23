import MeasurementEditForm from "@/components/measurement-edit-form"

export default function MeasurementEditPage({ params }: { params: { id: string } }) {
  return <MeasurementEditForm id={params.id} />
}

