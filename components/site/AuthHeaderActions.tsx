"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

type Role = "admin" | "teacher" | "student"

const roleHome: Record<Role, string> = {
  admin: "/admin",
  teacher: "/teacher",
  student: "/student",
}

type MeResponse =
  | {
      authenticated: true
      user: {
        id: number
        role: Role
        email: string
        full_name: string
      }
    }
  | {
      authenticated: false
    }

export function AuthHeaderActions() {
  const router = useRouter()
  const [data, setData] = useState<MeResponse | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    let mounted = true

    fetch("/api/auth/me", {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((json: MeResponse) => {
        if (mounted) {
          setData(json)
        }
      })
      .catch(() => {
        if (mounted) {
          setData({ authenticated: false })
        }
      })

    return () => {
      mounted = false
    }
  }, [])

  async function handleLogout() {
    setIsLoggingOut(true)

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      })
    } finally {
      setData({ authenticated: false })
      router.push("/login")
      router.refresh()
      setIsLoggingOut(false)
    }
  }

  if (!data) {
    return (
      <div className="nav-cta">
        <Link href="/login" className="btn btn-outline btn-sm">
          تسجيل الدخول
        </Link>

        <Link href="/subjects" className="btn btn-sm">
          ابدأ الآن
        </Link>
      </div>
    )
  }

  if (data.authenticated) {
    return (
      <div className="nav-cta">
        <Link href={roleHome[data.user.role]} className="btn btn-outline btn-sm">
          لوحة التحكم
        </Link>

        <button
          className="btn btn-sm"
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "جاري الخروج..." : "تسجيل خروج"}
        </button>
      </div>
    )
  }

  return (
    <div className="nav-cta">
      <Link href="/login" className="btn btn-outline btn-sm">
        تسجيل الدخول
      </Link>

      <Link href="/subjects" className="btn btn-sm">
        ابدأ الآن
      </Link>
    </div>
  )
}
