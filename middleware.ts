import { NextRequest, NextResponse } from "next/server"
import { jwtVerify } from "jose"

type Role = "admin" | "teacher" | "student"

const protectedRoutes: Record<string, Role> = {
  "/admin": "admin",
  "/teacher": "teacher",
  "/student": "student",
}

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "horizon-super-secret-dev-key"
)

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const matchedRoute = Object.keys(protectedRoutes).find((route) =>
    pathname.startsWith(route)
  )

  if (!matchedRoute) {
    return NextResponse.next()
  }

  const token = req.cookies.get("horizon_session")?.value

  if (!token) {
    const url = new URL("/login", req.url)
    url.searchParams.set("reason", "no_session")
    return NextResponse.redirect(url)
  }

  try {
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