import { create } from "zustand"

export type UserRole = "admin" | "researcher" | "viewer"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  permissions: string[]
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean

  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

// Create a default admin user
const defaultUser: User = {
  id: "admin-id",
  name: "Admin User",
  email: "admin@example.com",
  role: "admin",
  permissions: ["read:all", "write:all", "delete:all"],
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initialize with the default user already authenticated
  user: defaultUser,
  isLoading: false,
  error: null,
  isAuthenticated: true,

  login: async (email, password) => {
    // No-op since we're already "logged in"
    return
  },

  logout: async () => {
    // No-op since we're bypassing authentication
    return
  },

  checkAuth: async () => {
    // No-op since we're already "logged in"
    return
  },
}))

