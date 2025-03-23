import { type NextRequest, NextResponse } from "next/server"

// Mock user database
const users = [
  {
    id: "admin-id",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    permissions: ["read:all", "write:all", "delete:all"],
  },
  {
    id: "researcher-id",
    name: "Researcher User",
    email: "researcher@example.com",
    role: "researcher",
    permissions: ["read:all", "write:own", "delete:own"],
  },
  {
    id: "viewer-id",
    name: "Viewer User",
    email: "viewer@example.com",
    role: "viewer",
    permissions: ["read:all"],
  },
]

export async function POST(request: NextRequest) {
  try {
    // Read the request body
    const body = await request.json()
    const { email } = body

    console.log("Login attempt for email:", email)

    // Find user by email
    const user = users.find((user) => user.email === email)

    if (!user) {
      console.log("User not found for email:", email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    console.log("User found:", user.email, user.role)

    // For this demo, we'll skip token creation and cookie setting
    // Just return the user info directly

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error details:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

