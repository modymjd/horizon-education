import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    {
      message: "This endpoint is deprecated. Use /api/admin/courses instead.",
    },
    { status: 410 }
  )
}
