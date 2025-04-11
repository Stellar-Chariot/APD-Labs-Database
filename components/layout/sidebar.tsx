import { SidebarNav } from "./sidebar-nav"
import { BarChart3, Beaker, FileSpreadsheet, Layers, Upload } from "lucide-react"
import Link from "next/link"

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

export function Sidebar() {
  return (
    <div className="hidden border-r bg-background lg:block w-64">
      <div className="flex h-full flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4">
          <Link href="/" className="flex items-center">
            <Beaker className="h-6 w-6 mr-2" />
            <span className="font-semibold">APD Dashboard</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <SidebarNav items={sidebarNavItems} className="px-4" />
        </div>
      </div>
    </div>
  )
}
