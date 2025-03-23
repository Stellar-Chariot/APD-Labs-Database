export type UserRole = "admin" | "researcher" | "viewer"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  permissions: string[]
}

// Mock users database - in a real app, this would be in a database
export const users: Record<string, User> = {
  "user-1": {
    id: "user-1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    permissions: ["read:all", "write:all", "delete:all"],
  },
  "user-2": {
    id: "user-2",
    name: "Researcher",
    email: "researcher@example.com",
    role: "researcher",
    permissions: ["read:all", "write:own", "delete:own"],
  },
  "user-3": {
    id: "user-3",
    name: "Viewer",
    email: "viewer@example.com",
    role: "viewer",
    permissions: ["read:all"],
  },
}

export function hasPermission(user: User | null, permission: string): boolean {
  if (!user) return false
  return user.permissions.includes(permission) || user.permissions.includes("read:all")
}

