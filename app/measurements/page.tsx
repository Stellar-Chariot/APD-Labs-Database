import { Heading } from "@/components/ui/heading"
import { MeasurementList } from "@/components/measurements/measurement-list"
import { CreateMeasurementButton } from "@/components/measurements/create-measurement-button"

export default function MeasurementsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading title="Measurements" description="Manage your scientific measurements" />
        <CreateMeasurementButton />
      </div>
      <MeasurementList />
    </div>
  )
}
