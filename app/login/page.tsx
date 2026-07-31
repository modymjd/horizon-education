"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function Login() {
  const router = useRouter()

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
    <main className="grid min-h-screen place-items-center p-5">
      <form onSubmit={handleSubmit} className="card w-full max-w-md p-8">
        <Link href="/" className="text-sm">
          ← الرئيسية
        </Link>

        <h1 className="mt-4 text-3xl font-black">تسجيل الدخول</h1>

        <p className="mt-2 opacity-70">
          ادخل بحساب الأدمن أو المدرس أو الطالب، وسيتم توجيهك حسب الصلاحية.
        </p>

        {error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        ) : null}

        <label className="mt-6 block">
          البريد الإلكتروني
          <input
            className="input mt-2"
            placeholder="name@horizon-education.edu"
            type="email"
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button
          className="btn btn-primary mt-6 w-full disabled:opacity-60"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "جاري الدخول..." : "دخول آمن"}
        </button>

        <div className="mt-5 flex justify-between text-sm">
          <Link href="/register">إنشاء حساب طالب</Link>
          <Link href="/forgot-password">نسيت كلمة المرور؟</Link>
        </div>
      </form>
    </main>
  )
}