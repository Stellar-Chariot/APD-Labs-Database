import { create } from "zustand"
import { v4 as uuidv4 } from "uuid"
import type { Comment, SharedResource } from "@/types/collaboration-types"
import { useNotificationStore } from "./notification-store"

// Mock data for comments
const mockComments: Comment[] = [
  {
    id: "comment-1",
    resourceType: "sample",
    resourceId: "sample-1",
    userId: "user-1",
    userName: "Admin User",
    userRole: "admin",
    content: "This sample shows promising results. We should continue with this approach.",
    type: "general",
    createdAt: "2023-03-15T14:30:00Z",
    updatedAt: "2023-03-15T14:30:00Z",
  },
  {
    id: "comment-2",
    resourceType: "sample",
    resourceId: "sample-1",
    userId: "user-2",
    userName: "Researcher",
    userRole: "researcher",
    content: "I noticed some anomalies in the measurement data. Could this be due to equipment calibration?",
    type: "question",
    createdAt: "2023-03-16T09:15:00Z",
    updatedAt: "2023-03-16T09:15:00Z",
  },
  {
    id: "comment-3",
    resourceType: "sample",
    resourceId: "sample-1",
    userId: "user-1",
    userName: "Admin User",
    userRole: "admin",
    content: "Good catch. I'll check the calibration logs and get back to you.",
    type: "general",
    createdAt: "2023-03-16T10:45:00Z",
    updatedAt: "2023-03-16T10:45:00Z",
    parentId: "comment-2",
  },
  {
    id: "comment-4",
    resourceType: "measurement",
    resourceId: "measurement-1",
    userId: "user-2",
    userName: "Researcher",
    userRole: "researcher",
    content: "The peak at 532nm is much higher than expected. This could indicate contamination.",
    type: "issue",
    createdAt: "2023-03-17T11:20:00Z",
    updatedAt: "2023-03-17T11:20:00Z",
  },
]

// Mock data for shared resources
const mockSharedResources: SharedResource[] = [
  {
    id: "share-1",
    resourceType: "sample",
    resourceId: "sample-1",
    resourceName: "Silicon Wafer A-123",
    ownerId: "user-1",
    ownerName: "Admin User",
    sharedWith: [
      {
        userId: "user-2",
        userName: "Researcher",
        userRole: "researcher",
        permissions: ["view", "edit"],
        sharedAt: "2023-03-10T08:00:00Z",
      },
      {
        userId: "user-3",
        userName: "Viewer",
        userRole: "viewer",
        permissions: ["view"],
        sharedAt: "2023-03-12T14:30:00Z",
      },
    ],
    createdAt: "2023-03-10T08:00:00Z",
    updatedAt: "2023-03-12T14:30:00Z",
  },
  {
    id: "share-2",
    resourceType: "project",
    resourceId: "project-1",
    resourceName: "Quantum Dot Research",
    ownerId: "user-1",
    ownerName: "Admin User",
    sharedWith: [
      {
        userId: "user-2",
        userName: "Researcher",
        userRole: "researcher",
        permissions: ["view", "edit", "share"],
        sharedAt: "2023-02-20T10:15:00Z",
      },
    ],
    createdAt: "2023-02-20T10:15:00Z",
    updatedAt: "2023-02-20T10:15:00Z",
  },
]

interface CollaborationState {
  comments: Comment[]
  sharedResources: SharedResource[]
  isLoading: boolean
  error: string | null

  fetchComments: (resourceType: string, resourceId: string) => Promise<Comment[]>
  addComment: (comment: Omit<Comment, "id" | "createdAt" | "updatedAt">) => Promise<Comment>
  updateComment: (id: string, content: string) => Promise<Comment>
  resolveComment: (id: string, userId: string) => Promise<Comment>
  deleteComment: (id: string) => Promise<void>

  fetchSharedResources: (userId: string) => Promise<SharedResource[]>
  shareResource: (
    resource: Omit<SharedResource, "id" | "createdAt" | "updatedAt"> & {
      sharedWith: Omit<SharedResource["sharedWith"][0], "sharedAt">[]
    },
  ) => Promise<SharedResource>
  updateSharing: (
    id: string,
    updates: {
      userId: string
      permissions: ("view" | "edit" | "delete" | "share")[]
    }[],
  ) => Promise<SharedResource>
  removeSharing: (id: string, userIds: string[]) => Promise<void>
}

export const useCollaborationStore = create<CollaborationState>((set, get) => ({
  comments: [...mockComments],
  sharedResources: [...mockSharedResources],
  isLoading: false,
  error: null,

  fetchComments: async (resourceType, resourceId) => {
    set({ isLoading: true, error: null })
    try {
      // In a real app, this would be an API call
      const comments = mockComments.filter(
        (comment) => comment.resourceType === resourceType && comment.resourceId === resourceId,
      )

      set({ comments, isLoading: false })
      return comments
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch comments",
        isLoading: false,
      })
      return []
    }
  },

  addComment: async (commentData) => {
    set({ isLoading: true, error: null })
    try {
      // In a real app, this would be an API call
      const now = new Date().toISOString()
      const newComment: Comment = {
        ...commentData,
        id: `comment-${uuidv4()}`,
        createdAt: now,
        updatedAt: now,
      }

      set((state) => ({
        comments: [...state.comments, newComment],
        isLoading: false,
      }))

      // Add a notification if this is a reply
      if (newComment.parentId) {
        const parentComment = get().comments.find((c) => c.id === newComment.parentId)
        if (parentComment && parentComment.userId !== newComment.userId) {
          useNotificationStore.getState().addNotification({
            type: "info",
            title: "New Reply",
            message: `${newComment.userName} replied to your comment on ${newComment.resourceType} ${newComment.resourceId}`,
          })
        }
      }

      return newComment
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to add comment",
        isLoading: false,
      })
      throw error
    }
  },

  updateComment: async (id, content) => {
    set({ isLoading: true, error: null })
    try {
      // In a real app, this would be an API call
      const now = new Date().toISOString()

      set((state) => {
        const updatedComments = state.comments.map((comment) =>
          comment.id === id ? { ...comment, content, updatedAt: now } : comment,
        )

        return { comments: updatedComments, isLoading: false }
      })

      const updatedComment = get().comments.find((c) => c.id === id)
      if (!updatedComment) throw new Error("Comment not found")

      return updatedComment
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update comment",
        isLoading: false,
      })
      throw error
    }
  },

  resolveComment: async (id, userId) => {
    set({ isLoading: true, error: null })
    try {
      // In a real app, this would be an API call
      const now = new Date().toISOString()

      set((state) => {
        const updatedComments = state.comments.map((comment) =>
          comment.id === id
            ? {
                ...comment,
                resolved: true,
                resolvedBy: userId,
                resolvedAt: now,
                updatedAt: now,
              }
            : comment,
        )

        return { comments: updatedComments, isLoading: false }
      })

      const resolvedComment = get().comments.find((c) => c.id === id)
      if (!resolvedComment) throw new Error("Comment not found")

      return resolvedComment
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to resolve comment",
        isLoading: false,
      })
      throw error
    }
  },

  deleteComment: async (id) => {
    set({ isLoading: true, error: null })
    try {
      // In a real app, this would be an API call
      set((state) => ({
        comments: state.comments.filter((comment) => comment.id !== id),
        isLoading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete comment",
        isLoading: false,
      })
      throw error
    }
  },

  fetchSharedResources: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      // In a real app, this would be an API call
      const resources = mockSharedResources.filter(
        (resource) => resource.ownerId === userId || resource.sharedWith.some((share) => share.userId === userId),
      )

      set({ sharedResources: resources, isLoading: false })
      return resources
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch shared resources",
        isLoading: false,
      })
      return []
    }
  },

  shareResource: async (resourceData) => {
    set({ isLoading: true, error: null })
    try {
      // In a real app, this would be an API call
      const now = new Date().toISOString()

      // Check if the resource is already shared
      const existingShare = get().sharedResources.find(
        (share) => share.resourceType === resourceData.resourceType && share.resourceId === resourceData.resourceId,
      )

      if (existingShare) {
        // Update existing share
        const updatedShare: SharedResource = {
          ...existingShare,
          updatedAt: now,
          sharedWith: [
            ...existingShare.sharedWith,
            ...resourceData.sharedWith.map((share) => ({
              ...share,
              sharedAt: now,
            })),
          ],
        }

        set((state) => ({
          sharedResources: state.sharedResources.map((share) => (share.id === existingShare.id ? updatedShare : share)),
          isLoading: false,
        }))

        return updatedShare
      } else {
        // Create new share
        const newShare: SharedResource = {
          ...resourceData,
          id: `share-${uuidv4()}`,
          createdAt: now,
          updatedAt: now,
          sharedWith: resourceData.sharedWith.map((share) => ({
            ...share,
            sharedAt: now,
          })),
        }

        set((state) => ({
          sharedResources: [...state.sharedResources, newShare],
          isLoading: false,
        }))

        return newShare
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to share resource",
        isLoading: false,
      })
      throw error
    }
  },

  updateSharing: async (id, updates) => {
    set({ isLoading: true, error: null })
    try {
      // In a real app, this would be an API call
      const now = new Date().toISOString()

      set((state) => {
        const updatedResources = state.sharedResources.map((resource) => {
          if (resource.id !== id) return resource

          const updatedSharedWith = resource.sharedWith.map((share) => {
            const update = updates.find((u) => u.userId === share.userId)
            return update ? { ...share, permissions: update.permissions } : share
          })

          return {
            ...resource,
            sharedWith: updatedSharedWith,
            updatedAt: now,
          }
        })

        return { sharedResources: updatedResources, isLoading: false }
      })

      const updatedResource = get().sharedResources.find((r) => r.id === id)
      if (!updatedResource) throw new Error("Shared resource not found")

      return updatedResource
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update sharing",
        isLoading: false,
      })
      throw error
    }
  },

  removeSharing: async (id, userIds) => {
    set({ isLoading: true, error: null })
    try {
      // In a real app, this would be an API call
      const now = new Date().toISOString()

      set((state) => {
        const updatedResources = state.sharedResources
          .map((resource) => {
            if (resource.id !== id) return resource

            return {
              ...resource,
              sharedWith: resource.sharedWith.filter((share) => !userIds.includes(share.userId)),
              updatedAt: now,
            }
          })

          // Remove resources that no longer have any shares
          .filter((resource) => resource.sharedWith.length > 0)

        return { sharedResources: updatedResources, isLoading: false }
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to remove sharing",
        isLoading: false,
      })
      throw error
    }
  },
}))

