import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({
    message: "Signed out successfully.",
  })

  const isProduction = process.env.NODE_ENV === "production"

  response.cookies.set({
    name: "horizon_session",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: 0,
  })

  response.cookies.set({
    name: "horizon_role",
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    maxAge: 0,
  })

  return response
}
