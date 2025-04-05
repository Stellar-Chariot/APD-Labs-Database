export interface Sample {
  id: string
  name: string
  description?: string
  type?: string
  createdAt: string
  updatedAt: string
  metadata: Record<string, any>
}

