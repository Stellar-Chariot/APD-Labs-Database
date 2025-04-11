import { DashboardOverview } from "@/components/dashboard-overview"
import { Heading } from "@/components/ui/heading"

export default function Home() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <Heading title="Dashboard" description="Overview of your APD samples and measurements" />
      <DashboardOverview />
    </div>
  )
}
