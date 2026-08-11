import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

type Role = "admin" | "teacher" | "student"

const protectedRoutes: Record<string, Role> = {
  "/admin": "admin",
  "/teacher": "teacher",
  "/student": "student",
}

function getJwtSecret() {
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret || jwtSecret.length < 32) {
    if (process.env.NODE_ENV === "production") {
      return null
    }

    return "horizon-development-secret-change-me-32"
  }

  return jwtSecret
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const matchedRoute = Object.keys(protectedRoutes).find((route) =>
    pathname.startsWith(route)
  )

  if (!matchedRoute) {
    return NextResponse.next()
  }

  const jwtSecret = getJwtSecret()

  if (!jwtSecret) {
    const url = new URL("/login", req.url)
    url.searchParams.set("reason", "missing_secret")
    return NextResponse.redirect(url)
  }

  const token = req.cookies.get("horizon_session")?.value

  if (!token) {
    const url = new URL("/login", req.url)
    url.searchParams.set("reason", "no_session")
    return NextResponse.redirect(url)
  }

  try {
    const secret = new TextEncoder().encode(jwtSecret)
    const { payload } = await jwtVerify(token, secret)
    const role = payload.role as Role | undefined
    const requiredRole = protectedRoutes[matchedRoute]

    if (!role || role !== requiredRole) {
      const url = new URL("/403", req.url)
      url.searchParams.set("reason", "wrong_role")
      return NextResponse.redirect(url)
    }

    return NextResponse.next()
  } catch {
    const url = new URL("/login", req.url)
    url.searchParams.set("reason", "invalid_session")
    const res = NextResponse.redirect(url)

    res.cookies.delete("horizon_session")
    res.cookies.delete("horizon_role")

    return res
  }
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"],
}
