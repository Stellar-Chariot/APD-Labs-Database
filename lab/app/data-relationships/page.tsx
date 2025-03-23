import DataRelationshipVisualization from "@/components/data-relationship-visualization"

export default function DataRelationshipsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Relationships</h1>
        <p className="text-muted-foreground">
          Visualize connections between samples, measurements, and recipes in your scientific data system
        </p>
      </div>

      <DataRelationshipVisualization />
    </div>
  )
}

