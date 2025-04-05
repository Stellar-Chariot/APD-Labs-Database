"use client"

import { useUI } from "@/hooks/use-ui"
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from "lucide-react"
import { useEffect } from "react"

export function Notifications() {
  const { notifications, removeNotification } = useUI()

  // Auto-remove notifications after 5 seconds
  useEffect(() => {
    const timers = notifications.map((notification) => {
      return setTimeout(() => {
        removeNotification(notification.id)
      }, 5000)
    })

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [notifications, removeNotification])

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {notifications.map((notification) => {
        let bgColor = "bg-blue-50 border-blue-200"
        let textColor = "text-blue-800"
        let Icon = Info

        switch (notification.type) {
          case "success":
            bgColor = "bg-green-50 border-green-200"
            textColor = "text-green-800"
            Icon = CheckCircle
            break
          case "warning":
            bgColor = "bg-yellow-50 border-yellow-200"
            textColor = "text-yellow-800"
            Icon = AlertTriangle
            break
          case "error":
            bgColor = "bg-red-50 border-red-200"
            textColor = "text-red-800"
            Icon = AlertCircle
            break
        }

        return (
          <div
            key={notification.id}
            className={`${bgColor} ${textColor} border rounded-md p-4 shadow-md flex items-start`}
            role="alert"
          >
            <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
            <div className="flex-1">{notification.message}</div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-3 flex-shrink-0"
              aria-label="Close notification"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

