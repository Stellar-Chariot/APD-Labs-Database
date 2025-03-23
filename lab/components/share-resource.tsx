"use client"

import { useState, useEffect } from "react"
import { Share2, Plus, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useCollaborationStore } from "@/store/collaboration-store"
import { useAuthStore } from "@/store/auth-store"
import { users } from "@/lib/auth"

interface ShareResourceProps {
  resourceType: "sample" | "measurement" | "project"
  resourceId: string
  resourceName: string
}

export function ShareResource({ resourceType, resourceId, resourceName }: ShareResourceProps) {
  const { user } = useAuthStore()
  const { sharedResources, fetchSharedResources, shareResource, updateSharing, removeSharing } = useCollaborationStore()

  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<
    {
      userId: string
      userName: string
      userRole: string
      permissions: ("view" | "edit" | "delete" | "share")[]
    }[]
  >([])

  // Find if this resource is already shared
  const existingShare = sharedResources.find(
    (share) => share.resourceType === resourceType && share.resourceId === resourceId,
  )

  useEffect(() => {
    if (user) {
      fetchSharedResources(user.id)
    }
  }, [fetchSharedResources, user])

  useEffect(() => {
    if (existingShare) {
      setSelectedUsers(
        existingShare.sharedWith.map((share) => ({
          userId: share.userId,
          userName: share.userName,
          userRole: share.userRole,
          permissions: [...share.permissions],
        })),
      )
    } else {
      setSelectedUsers([])
    }
  }, [existingShare])

  const filteredUsers = Object.values(users)
    .filter((u) => u.id !== user?.id) // Don't show current user
    .filter((u) => !selectedUsers.some((selected) => selected.userId === u.id)) // Don't show already selected users
    .filter(
      (u) =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()),
    )

  const handleAddUser = (userId: string) => {
    const userToAdd = Object.values(users).find((u) => u.id === userId)
    if (!userToAdd) return

    setSelectedUsers((prev) => [
      ...prev,
      {
        userId: userToAdd.id,
        userName: userToAdd.name,
        userRole: userToAdd.role,
        permissions: ["view"], // Default permission
      },
    ])

    setSearchTerm("")
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers((prev) => prev.filter((u) => u.userId !== userId))
  }

  const handlePermissionChange = (
    userId: string,
    permission: "view" | "edit" | "delete" | "share",
    checked: boolean,
  ) => {
    setSelectedUsers((prev) =>
      prev.map((user) => {
        if (user.userId !== userId) return user

        let newPermissions = [...user.permissions]

        if (checked) {
          // Add permission if not already present
          if (!newPermissions.includes(permission)) {
            newPermissions.push(permission)
          }

          // If adding edit, make sure view is also added
          if (permission === "edit" && !newPermissions.includes("view")) {
            newPermissions.push("view")
          }

          // If adding delete, make sure view and edit are also added
          if (permission === "delete" && (!newPermissions.includes("view") || !newPermissions.includes("edit"))) {
            if (!newPermissions.includes("view")) newPermissions.push("view")
            if (!newPermissions.includes("edit")) newPermissions.push("edit")
          }

          // If adding share, make sure view is also added
          if (permission === "share" && !newPermissions.includes("view")) {
            newPermissions.push("view")
          }
        } else {
          // Remove permission
          newPermissions = newPermissions.filter((p) => p !== permission)

          // If removing view, also remove edit, delete, and share
          if (permission === "view") {
            newPermissions = newPermissions.filter((p) => p !== "edit" && p !== "delete" && p !== "share")
          }

          // If removing edit, also remove delete
          if (permission === "edit") {
            newPermissions = newPermissions.filter((p) => p !== "delete")
          }
        }

        return { ...user, permissions: newPermissions }
      }),
    )
  }

  const handleSave = async () => {
    if (!user) return

    try {
      if (existingShare) {
        // Get users to remove
        const usersToRemove = existingShare.sharedWith
          .filter((share) => !selectedUsers.some((selected) => selected.userId === share.userId))
          .map((share) => share.userId)

        if (usersToRemove.length > 0) {
          await removeSharing(existingShare.id, usersToRemove)
        }

        // Get users to update
        const usersToUpdate = selectedUsers
          .filter((selected) =>
            existingShare.sharedWith.some(
              (share) => share.userId === selected.userId && !arraysEqual(share.permissions, selected.permissions),
            ),
          )
          .map((selected) => ({
            userId: selected.userId,
            permissions: selected.permissions,
          }))

        if (usersToUpdate.length > 0) {
          await updateSharing(existingShare.id, usersToUpdate)
        }

        // Get users to add
        const usersToAdd = selectedUsers.filter(
          (selected) => !existingShare.sharedWith.some((share) => share.userId === selected.userId),
        )

        if (usersToAdd.length > 0) {
          await shareResource({
            resourceType,
            resourceId,
            resourceName,
            ownerId: user.id,
            ownerName: user.name,
            sharedWith: usersToAdd,
          })
        }
      } else if (selectedUsers.length > 0) {
        // Create new share
        await shareResource({
          resourceType,
          resourceId,
          resourceName,
          ownerId: user.id,
          ownerName: user.name,
          sharedWith: selectedUsers,
        })
      }

      setOpen(false)
    } catch (error) {
      console.error("Failed to save sharing settings:", error)
    }
  }

  // Helper function to compare arrays
  const arraysEqual = (a: any[], b: any[]) => {
    if (a.length !== b.length) return false
    const sortedA = [...a].sort()
    const sortedB = [...b].sort()
    return sortedA.every((val, idx) => val === sortedB[idx])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share {resourceType}</DialogTitle>
          <DialogDescription>Share this {resourceType} with other users and set their permissions.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Add people</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {searchTerm && filteredUsers.length > 0 && (
              <div className="border rounded-md mt-1 max-h-40 overflow-y-auto">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="p-2 hover:bg-muted cursor-pointer flex justify-between items-center"
                    onClick={() => handleAddUser(user.id)}
                  >
                    <div>
                      <div>{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                    </div>
                    <Plus className="h-4 w-4" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <Label>People with access</Label>
              <div className="border rounded-md divide-y">
                {selectedUsers.map((user) => (
                  <div key={user.userId} className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{user.userName}</div>
                        <div className="text-xs text-muted-foreground capitalize">{user.userRole}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleRemoveUser(user.userId)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`view-${user.userId}`}
                          checked={user.permissions.includes("view")}
                          onCheckedChange={(checked) => handlePermissionChange(user.userId, "view", checked === true)}
                        />
                        <Label htmlFor={`view-${user.userId}`}>View</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`edit-${user.userId}`}
                          checked={user.permissions.includes("edit")}
                          onCheckedChange={(checked) => handlePermissionChange(user.userId, "edit", checked === true)}
                          disabled={!user.permissions.includes("view")}
                        />
                        <Label htmlFor={`edit-${user.userId}`}>Edit</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`delete-${user.userId}`}
                          checked={user.permissions.includes("delete")}
                          onCheckedChange={(checked) => handlePermissionChange(user.userId, "delete", checked === true)}
                          disabled={!user.permissions.includes("edit")}
                        />
                        <Label htmlFor={`delete-${user.userId}`}>Delete</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`share-${user.userId}`}
                          checked={user.permissions.includes("share")}
                          onCheckedChange={(checked) => handlePermissionChange(user.userId, "share", checked === true)}
                          disabled={!user.permissions.includes("view")}
                        />
                        <Label htmlFor={`share-${user.userId}`}>Share</Label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Check className="h-4 w-4 mr-2" />
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

