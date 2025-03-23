export interface Sample {
  id: string
  identifier: string
  name: string
  substrate: string
  growthDate: Date
  grower: string
  description: string
  createdAt: Date
  metadata: Record<string, string>
}

