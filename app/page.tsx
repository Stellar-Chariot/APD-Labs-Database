"use client"

import { SafeRedirect } from "@/lib/navigation"

export default function Home() {
  return <SafeRedirect to="/dashboard" />
}

