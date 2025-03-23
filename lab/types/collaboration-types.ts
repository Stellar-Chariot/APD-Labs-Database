export type CommentType = "general" | "question" | "issue" | "suggestion"

export interface Comment {
  id: string
  resourceType: "sample" | "measurement" | "project"
  resourceId: string
  userId: string
  userName: string
  userRole: string
  content: string
  type: CommentType
  createdAt: string
  updatedAt: string
  parentId?: string
  resolved?: boolean
  resolvedBy?: string
  resolvedAt?: string
}

export interface SharedResource {
  id: string
  resourceType: "sample" | "measurement" | "project"
  resourceId: string
  resourceName: string
  ownerId: string
  ownerName: string
  sharedWith: {
    userId: string
    userName: string
    userRole: string
    permissions: ("view" | "edit" | "delete" | "share")[]
    sharedAt: string
  }[]
  createdAt: string
  updatedAt: string
}

