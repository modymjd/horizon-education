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
        setError(data.message || "Unable to activate code")
        return
      }

      setSuccess(data.message || "Lesson activated successfully")
      setCode("")
    } catch {
      setError("Unable to connect to the server")
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
            <span className="eyebrow">Lesson Access</span>
            <h1 className="h2">Activate your access code</h1>
            <p className="muted mt-4">
              Enter the code you received from your teacher or the administration to unlock the lesson.
            </p>

            {error ? <div className="alert-error mt-5">{error}</div> : null}
            {success ? <div className="alert-success mt-5">{success}</div> : null}

            <form onSubmit={handleSubmit} className="mt-6">
              <label className="font-bold">
                Access Code
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
                {isLoading ? "Activating..." : "Activate code"}
              </button>
            </form>

            <div className="mt-6">
              <Link href="/student" className="btn btn-outline">
                Back to Student Dashboard
              </Link>
            </div>
          </div>

          <div className="course-preview">
            <span className="lesson-pill">Secure lesson access</span>
            <h2 className="mt-5 font-[var(--display)] text-6xl font-bold leading-none">
              Each code unlocks a specific lesson
            </h2>
            <p className="mt-4 max-w-sm opacity-80">
              After activation, the lesson will appear in your student dashboard and you can start studying.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
