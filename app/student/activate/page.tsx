"use client"

import Link from "next/link"
import { useState } from "react"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

export default function StudentActivatePage() {
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/student/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "تعذر تفعيل الكود")
        return
      }

      setSuccess(data.message || "تم تفعيل الحصة بنجاح")
      setCode("")
    } catch {
      setError("تعذر الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main>
      <SiteHeader />

      <section className="section">
        <div className="wrap grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="card code-generator">
            <span className="eyebrow">تفعيل الحصة</span>
            <h1 className="h2">فعّل كود الوصول</h1>
            <p className="muted mt-4">
              ادخل الكود اللي حصلت عليه من المدرس أو الإدارة لتفعيل الوصول للحصة.
            </p>

            {error ? <div className="alert-error mt-5">{error}</div> : null}
            {success ? <div className="alert-success mt-5">{success}</div> : null}

            <form onSubmit={handleSubmit} className="mt-6">
              <label className="font-bold">
                كود الوصول
                <input
                  className="input mt-2"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="HZ-XXXXXXXXXX"
                  dir="ltr"
                  required
                />
              </label>

              <button className="btn btn-block mt-6 disabled:opacity-60" disabled={isLoading}>
                {isLoading ? "جاري التفعيل..." : "تفعيل الكود"}
              </button>
            </form>

            <div className="mt-6">
              <Link href="/student" className="btn btn-outline">
                رجوع للوحة الطالب
              </Link>
            </div>
          </div>

          <div className="course-preview">
            <span className="lesson-pill">وصول آمن للحصص</span>
            <h2 className="mt-5 font-[var(--display)] text-6xl font-bold leading-none">
              كل كود يفتح لك حصة محددة
            </h2>
            <p className="mt-4 max-w-sm opacity-80">
              بعد التفعيل، هتظهر الحصة داخل لوحة الطالب وتقدر تبدأ مذاكرتها.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
