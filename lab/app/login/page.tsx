import { redirect } from "next/navigation"

export default function LoginPage() {
  // Automatically redirect to dashboard
  redirect("/dashboard")
}

