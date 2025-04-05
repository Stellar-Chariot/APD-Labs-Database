"use client"

import { useAppState } from "@/context/state-context"
import type { AppState } from "@/types/state"
import { useCallback } from "react"

export function useUI() {
  const { state, dispatch } = useAppState()
  const { sidebarOpen, theme, notifications } = state.ui

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    dispatch({ type: "TOGGLE_SIDEBAR" })
  }, [dispatch])

  // Set sidebar state
  const setSidebar = useCallback(
    (open: boolean) => {
      dispatch({ type: "SET_SIDEBAR", payload: open })
    },
    [dispatch],
  )

  // Set theme
  const setTheme = useCallback(
    (newTheme: "light" | "dark" | "system") => {
      dispatch({ type: "SET_THEME", payload: newTheme })
    },
    [dispatch],
  )

  // Add notification
  const addNotification = useCallback(
    (notification: Omit<AppState["ui"]["notifications"][0], "id">) => {
      dispatch({ type: "ADD_NOTIFICATION", payload: notification })
    },
    [dispatch],
  )

  // Remove notification
  const removeNotification = useCallback(
    (id: string) => {
      dispatch({ type: "REMOVE_NOTIFICATION", payload: id })
    },
    [dispatch],
  )

  return {
    sidebarOpen,
    theme,
    notifications,
    toggleSidebar,
    setSidebar,
    setTheme,
    addNotification,
    removeNotification,
  }
}

