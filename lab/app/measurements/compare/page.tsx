import MeasurementCompare from "@/components/measurement-compare"

export default function MeasurementComparePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Compare Measurements</h1>
      <p className="text-muted-foreground">
        Select multiple measurements to compare their data and parameters side by side.
      </p>
      <MeasurementCompare />
    </div>
  )
}

