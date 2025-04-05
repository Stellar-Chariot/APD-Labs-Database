"use client"

import type React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FlaskRoundIcon as Flask, FileSpreadsheet, BarChart3, Upload, Settings } from "lucide-react"

interface NavLinkProps {
  href: string
  icon: React.ElementType
  label: string
  isActive?: boolean
}

export function NavLink({ href, icon: Icon, label, isActive }: NavLinkProps) {
  const pathname = usePathname()
  const active = isActive !== undefined ? isActive : pathname === href || pathname?.startsWith(`${href}/`)

  return (
    <li>
      <Link
        href={href}
        className={`flex items-center p-2 rounded-md transition-colors ${
          active ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        <Icon className={`h-5 w-5 mr-3 ${active ? "text-blue-600" : "text-gray-500"}`} />
        {label}
      </Link>
    </li>
  )
}

export function NavLinks() {
  // Update the navItems array to include the Comparison tool
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Samples", href: "/samples", icon: Flask },
    { name: "Measurements", href: "/measurements", icon: FileSpreadsheet },
    { name: "MBE Recipes", href: "/recipes", icon: BarChart3 },
    { name: "Visualizations", href: "/visualizations", icon: BarChart3 },
    { name: "Comparison", href: "/comparison", icon: BarChart3 },
    { name: "Upload", href: "/upload", icon: Upload },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <nav className="flex-1 overflow-y-auto p-4">
      <ul className="space-y-2">
        {navItems.map((item) => (
          <NavLink key={item.name} href={item.href} icon={item.icon} label={item.name} />
        ))}
      </ul>
    </nav>
  )
}

export default NavLinks

