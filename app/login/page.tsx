"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "تعذر تسجيل الدخول")
        return
      }

      router.push(data.redirectTo || "/")
      router.refresh()
    } catch {
      setError("تعذر الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main>
      <SiteHeader />

      <section className="auth-section">
        <div className="wrap auth-grid">
          <div className="auth-copy">
            <span className="eyebrow">تسجيل الدخول</span>
            <h1 className="h1">ادخل إلى حسابك في Horizon</h1>
            <p className="muted mt-5 text-lg">
              استخدم البريد وكلمة المرور الخاصة بحسابك للوصول إلى لوحة الطالب أو المدرس أو الأدمن.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="card auth-card">
            <h2 className="text-3xl font-black">تسجيل الدخول</h2>

            {error ? (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                {error}
              </div>
            ) : null}

            <label className="mt-6 block">
              البريد الإلكتروني
              <input
                className="input mt-2"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </label>

            <label className="mt-4 block">
              كلمة المرور
              <input
                className="input mt-2"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>

            <button
              className="btn mt-6 w-full disabled:opacity-60"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? "جاري الدخول..." : "دخول"}
            </button>

            <div className="mt-5 flex items-center justify-between text-sm">
              <Link href="/forgot-password" className="font-bold">
                نسيت كلمة المرور؟
              </Link>
              <Link href="/register" className="font-bold">
                إنشاء حساب طالب
              </Link>
            </div>
          </form>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
