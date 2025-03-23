"use client"

import { createContext, useContext, type ReactNode } from "react"

// Define user types
export type UserRole = "admin" | "researcher" | "viewer"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  permissions: string[]
}

// Create a default admin user
const defaultUser: User = {
  id: "admin-id",
  name: "Admin User",
  email: "admin@example.com",
  role: "admin",
  permissions: ["read:all", "write:all", "delete:all"],
}

// Create the context
interface AuthContextType {
  user: User
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  isAuthenticated: true,
})

// Create a provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  // Always return the default user and authenticated state
  const value = {
    user: defaultUser,
    isAuthenticated: true,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Create a hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

