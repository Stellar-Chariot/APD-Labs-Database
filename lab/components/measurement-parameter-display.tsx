import type { MeasurementType } from "@/types/measurement-types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface MeasurementParameterDisplayProps {
  parameters: Record<string, any>
  measurementType: MeasurementType | null
}

export function MeasurementParameterDisplay({ parameters, measurementType }: MeasurementParameterDisplayProps) {
  // Group parameters by category if we have the measurement type
  const parametersByCategory: Record<string, { name: string; value: any; unit?: string; description?: string }[]> = {
    basic: [],
    advanced: [],
    experimental: [],
  }

  if (measurementType) {
    // Get parameter definitions from the measurement type
    const parameterDefinitions = measurementType.defaultParameters || {}

    // Process each parameter
    Object.entries(parameters).forEach(([key, value]) => {
      // Find the parameter definition if available
      const paramDef = Object.entries(parameterDefinitions).find(([defKey]) => defKey === key)

      // Determine the category (default to basic)
      let category = "basic"
      if (key.includes("advanced")) category = "advanced"
      if (key.includes("experimental")) category = "experimental"

      // Add to the appropriate category
      parametersByCategory[category].push({
        name: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
        value: value,
        unit: typeof paramDef?.[1] === "object" ? paramDef?.[1].unit : undefined,
        description: typeof paramDef?.[1] === "object" ? paramDef?.[1].description : undefined,
      })
    })
  } else {
    // If we don't have the measurement type, just put all parameters in basic
    Object.entries(parameters).forEach(([key, value]) => {
      parametersByCategory.basic.push({
        name: key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()),
        value: value,
      })
    })
  }

  // Check if we have parameters in each category
  const hasBasic = parametersByCategory.basic.length > 0
  const hasAdvanced = parametersByCategory.advanced.length > 0
  const hasExperimental = parametersByCategory.experimental.length > 0

  // If we only have basic parameters, just show them without tabs
  if (hasBasic && !hasAdvanced && !hasExperimental) {
    return (
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {parametersByCategory.basic.map((param, index) => (
          <div key={index}>
            <dt className="text-sm font-medium text-muted-foreground">{param.name}</dt>
            <dd>
              {param.value}
              {param.unit && <span className="text-xs text-muted-foreground ml-1">({param.unit})</span>}
            </dd>
            {param.description && <p className="text-xs text-muted-foreground mt-1">{param.description}</p>}
          </div>
        ))}
      </dl>
    )
  }

  // Otherwise, show tabs for each category
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basic">Basic Parameters</TabsTrigger>
        <TabsTrigger value="advanced">Advanced Parameters</TabsTrigger>
        <TabsTrigger value="experimental">Experimental</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-4 mt-4">
        {hasBasic ? (
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {parametersByCategory.basic.map((param, index) => (
              <div key={index}>
                <dt className="text-sm font-medium text-muted-foreground">{param.name}</dt>
                <dd>
                  {param.value}
                  {param.unit && <span className="text-xs text-muted-foreground ml-1">({param.unit})</span>}
                </dd>
                {param.description && <p className="text-xs text-muted-foreground mt-1">{param.description}</p>}
              </div>
            ))}
          </dl>
        ) : (
          <div className="text-center py-4 text-muted-foreground">No basic parameters for this measurement</div>
        )}
      </TabsContent>

      <TabsContent value="advanced" className="space-y-4 mt-4">
        {hasAdvanced ? (
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {parametersByCategory.advanced.map((param, index) => (
              <div key={index}>
                <dt className="text-sm font-medium text-muted-foreground">{param.name}</dt>
                <dd>
                  {param.value}
                  {param.unit && <span className="text-xs text-muted-foreground ml-1">({param.unit})</span>}
                </dd>
                {param.description && <p className="text-xs text-muted-foreground mt-1">{param.description}</p>}
              </div>
            ))}
          </dl>
        ) : (
          <div className="text-center py-4 text-muted-foreground">No advanced parameters for this measurement</div>
        )}
      </TabsContent>

      <TabsContent value="experimental" className="space-y-4 mt-4">
        {hasExperimental ? (
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {parametersByCategory.experimental.map((param, index) => (
              <div key={index}>
                <dt className="text-sm font-medium text-muted-foreground">{param.name}</dt>
                <dd>
                  {param.value}
                  {param.unit && <span className="text-xs text-muted-foreground ml-1">({param.unit})</span>}
                </dd>
                {param.description && <p className="text-xs text-muted-foreground mt-1">{param.description}</p>}
              </div>
            ))}
          </dl>
        ) : (
          <div className="text-center py-4 text-muted-foreground">No experimental parameters for this measurement</div>
        )}
      </TabsContent>
    </Tabs>
  )
}

