"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

/**
 * A hook that safely redirects to a new page
 * @param path The path to redirect to
 * @param condition Optional condition to control when the redirect happens
 */
export function useRedirect(path: string, condition = true) {
  const router = useRouter()

  useEffect(() => {
    if (condition) {
      router.push(path)
    }
  }, [router, path, condition])
}

/**
 * A component that safely redirects to a new page
 */
export function SafeRedirect({ to }: { to: string }) {
  useRedirect(to)

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  )
} 