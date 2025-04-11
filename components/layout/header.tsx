"use client"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { SidebarNav } from "./sidebar-nav"
import { BarChart3, Beaker, FileSpreadsheet, Layers, Upload } from "lucide-react"
import { usePathname } from "next/navigation"

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    title: "Samples",
    href: "/samples",
    icon: <Beaker className="h-4 w-4" />,
  },
  {
    title: "Measurements",
    href: "/measurements",
    icon: <FileSpreadsheet className="h-4 w-4" />,
  },
  {
    title: "MBE Recipes",
    href: "/recipes",
    icon: <Layers className="h-4 w-4" />,
  },
  {
    title: "Data Import",
    href: "/data-import", // Changed from "/import" to "/data-import"
    icon: <Upload className="h-4 w-4" />,
  },
]

export function Header() {
  const pathname = usePathname()

  // Get the current page title
  const currentPage = sidebarNavItems.find((item) => item.href === pathname)?.title || "Dashboard"

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="lg:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <div className="grid gap-4 py-4">
            <div className="px-2 py-2">
              <h2 className="mb-4 px-2 text-lg font-semibold tracking-tight">APD Dashboard</h2>
              <SidebarNav items={sidebarNavItems} className="px-2" />
            </div>
          </div>
        </SheetContent>
      </Sheet>
      <div className="flex-1">
        <h1 className="text-lg font-semibold">{currentPage}</h1>
      </div>
    </header>
  )
}
