export interface Measurement {
  id: string
  sampleId: string
  name: string
  type: string
  date: string
  data: any[]
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
}

