import { Heading } from "@/components/ui/heading"
import { SampleList } from "@/components/samples/sample-list"
import { CreateSampleButton } from "@/components/samples/create-sample-button"

export default function SamplesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading title="Samples" description="Manage your APD samples" />
        <CreateSampleButton />
      </div>
      <SampleList />
    </div>
  )
}
