import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { users } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = cookies().get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ user: null })
    }

    // Decode the token (in a real app, verify JWT)
    try {
      const decoded = JSON.parse(atob(token))

      // Check if token is expired
      if (decoded.exp < Date.now()) {
        cookies().delete("auth-token")
        return NextResponse.json({ user: null })
      }

      const userId = decoded.userId
      const user = users[userId]

      if (!user) {
        return NextResponse.json({ user: null })
      }

      // Return the user without sensitive information
      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      })
    } catch (error) {
      cookies().delete("auth-token")
      return NextResponse.json({ user: null })
    }
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

