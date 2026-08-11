import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/session"

export async function GET() {
  const user = await getCurrentUser()

  if (!user) {
    return NextResponse.json({
      authenticated: false,
    })
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      role: user.role,
      email: user.email,
      full_name: user.full_name,
    },
  })
}
