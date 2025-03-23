import { redirect } from "next/navigation"

export default function SampleEditPage({ params }: { params: { id: string } }) {
  // Redirect to the sample detail page
  redirect(`/samples/${params.id}`)
}

