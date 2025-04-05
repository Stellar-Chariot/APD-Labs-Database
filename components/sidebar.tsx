"use client"
import { useUI } from "@/hooks/use-ui"
import NavLinks from "@/components/nav-links"

export default function Sidebar() {
  const { sidebarOpen } = useUI()

  return (
    <div
      className={`${sidebarOpen ? "md:flex" : "md:hidden"} hidden md:flex-col md:w-64 md:bg-white md:border-r transition-all duration-300`}
    >
      <div className="flex items-center justify-center h-16 border-b">
        <h1 className="text-xl font-bold text-blue-600">APD LABS</h1>
      </div>
      <NavLinks />
    </div>
  )
}

