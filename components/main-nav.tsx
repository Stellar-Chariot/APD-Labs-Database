"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { FlaskRoundIcon as Flask, BarChart3, Database, Layers, Microscope } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()

  const routes = [
    {
      href: "/",
      label: "Dashboard",
      icon: <BarChart3 className="mr-2 h-4 w-4" />,
      active: pathname === "/",
    },
    {
      href: "/samples",
      label: "Samples",
      icon: <Flask className="mr-2 h-4 w-4" />,
      active: pathname === "/samples",
    },
    {
      href: "/measurements",
      label: "Measurements",
      icon: <Microscope className="mr-2 h-4 w-4" />,
      active: pathname === "/measurements",
    },
    {
      href: "/recipes",
      label: "MBE Recipes",
      icon: <Layers className="mr-2 h-4 w-4" />,
      active: pathname === "/recipes",
    },
    {
      href: "/data-import",
      label: "Data Import",
      icon: <Database className="mr-2 h-4 w-4" />,
      active: pathname === "/data-import",
    },
  ]

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <Link href="/" className="flex items-center">
          <Flask className="h-6 w-6 mr-2" />
          <span className="font-bold">Scientific Samples DB</span>
        </Link>
        <nav className="mx-6 flex items-center space-x-4 lg:space-x-6">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center text-sm font-medium transition-colors hover:text-primary",
                route.active ? "text-black dark:text-white" : "text-muted-foreground",
              )}
            >
              {route.icon}
              {route.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  )
}
