import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/sidebar"
import Header from "@/components/header"
import { AppStateProvider } from "@/context/state-context"
import { Notifications } from "@/components/ui/notifications"
import { ClientErrorBoundary } from "@/components/client-error-boundary"
import { GlobalErrorHandler } from "@/components/global-error-handler"
import { ReactQueryProvider } from "@/lib/react-query"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "APD LABS",
  description: "Dashboard for scientific data visualization and analysis",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReactQueryProvider>
          <AppStateProvider>
            <GlobalErrorHandler>
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex flex-col flex-1 overflow-hidden">
                  <Header />
                  <main className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    <ClientErrorBoundary>
                      {children}
                    </ClientErrorBoundary>
                  </main>
                </div>
              </div>
              <Notifications />
            </GlobalErrorHandler>
          </AppStateProvider>
        </ReactQueryProvider>
      </body>
    </html>
  )
}



import './globals.css'