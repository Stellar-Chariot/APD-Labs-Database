export interface MBERecipe {
  id: string
  sampleId: string
  name: string
  description?: string
  growthParameters: {
    substrateTemperature?: string
    galliumFlux?: string
    nitrogenFlow?: string
    growthTime?: string
    chamberPressure?: string
    additionalParams?: string
    layerStructure?: string
    [key: string]: any
  }
  createdAt: string
  updatedAt: string
}

