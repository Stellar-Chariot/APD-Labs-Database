import { redirect } from "next/navigation"

export default function Home() {
  // This is a server component, so we can use redirect
  redirect("/dashboard")
}

