import { NextRequest, NextResponse } from "next/server"

type Role = "admin" | "teacher" | "student"

const protectedRoutes: Record<string, Role> = {
  "/admin": "admin",
  "/teacher": "teacher",
  "/student": "student",
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const matchedRoute = Object.keys(protectedRoutes).find((route) =>
    pathname.startsWith(route)
  )

  if (!matchedRoute) {
    return NextResponse.next()
  }

  const role = req.cookies.get("horizon_role")?.value as Role | undefined

  if (!role) {
    const url = new URL("/login", req.url)
    url.searchParams.set("reason", "no_role_cookie")
    return NextResponse.redirect(url)
  }

  const requiredRole = protectedRoutes[matchedRoute]

  if (role !== requiredRole) {
    const url = new URL("/403", req.url)
    url.searchParams.set("reason", "wrong_role")
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"],
}