"use client"

import Link from "next/link"
import { useState } from "react"
import { BrandMark } from "@/components/site/BrandMark"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")
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
        setError(data.message || "حدث خطأ أثناء تسجيل الدخول")
        return
      }

      setSuccess("تم تسجيل الدخول بنجاح، جاري التحويل...")

      const redirectTo = data.redirectTo || "/"
      window.location.replace(window.location.origin + redirectTo)
    } catch {
      setError("تعذر الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="login-shell">
      <section className="login-art">
        <div>
          <BrandMark />
          <h1 className="mt-10 font-[var(--display)] text-6xl font-bold leading-none md:text-8xl">
            أهلاً بك في حورايزون تعليم
          </h1>
          <p className="mt-6 max-w-xl text-lg opacity-85">
            ادخل بحساب الإدارة أو المدرس أو الطالب، وسيتم توجيهك تلقائيًا للوحة المناسبة.
          </p>
        </div>
      </section>

      <section className="login-panel">
        <form onSubmit={handleSubmit} className="card w-full max-w-md p-8">
          <Link href="/" className="text-sm font-bold text-[var(--maple)]">
            ← الرئيسية
          </Link>

          <h2 className="mt-5 text-4xl font-black">تسجيل الدخول</h2>
          <p className="muted mt-2">
            استخدم بيانات الحساب التجريبي أو حسابك المسجل على المنصة.
          </p>

          {error ? <div className="alert-error mt-5">{error}</div> : null}
          {success ? <div className="alert-success mt-5">{success}</div> : null}

          <label className="mt-6 block font-bold">
            البريد الإلكتروني
            <input
              className="input mt-2"
              placeholder="name@horizon.test"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="mt-4 block font-bold">
            كلمة المرور
            <input
              className="input mt-2"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>

          <button className="btn btn-block mt-6 disabled:opacity-60" type="submit" disabled={isLoading}>
            {isLoading ? "جاري الدخول..." : "دخول آمن"}
          </button>

          <div className="mt-5 flex justify-between text-sm font-bold text-[var(--maple)]">
            <Link href="/register">إنشاء حساب طالب</Link>
            <Link href="/forgot-password">نسيت كلمة المرور؟</Link>
          </div>

          <div className="mt-6 rounded-2xl bg-[var(--cream-2)] p-4 text-sm">
            <p className="font-black">حسابات التجربة:</p>
            <p className="mt-2">admin@horizon.test / Admin123456</p>
            <p>teacher@horizon.test / Teacher123456</p>
            <p>student@horizon.test / Student123456</p>
          </div>
        </form>
      </section>
    </main>
  )
}
