"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type LessonOption = {
  id: number
  title: string
  course_title: string | null
  chapter_title: string | null
  status: string
}

type Props = {
  lessons: LessonOption[]
}

function getLessonStatusLabel(status: string) {
  if (status === "published") return "Published"
  if (status === "draft") return "Draft"
  if (status === "hidden") return "Hidden"
  return status
}

export function AccessCodeCreateForm({ lessons }: Props) {
  const router = useRouter()

  const [lessonId, setLessonId] = useState("")
  const [count, setCount] = useState("10")
  const [expiresAt, setExpiresAt] = useState("")
  const [singleUse, setSingleUse] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [codes, setCodes] = useState<string[]>([])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setCodes([])

    if (!lessonId) {
      setError("Choose a lesson first")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/teacher/access-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lesson_id: Number(lessonId),
          count: Number(count),
          expires_at: expiresAt || undefined,
          single_use: singleUse,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Unable to create codes")
        return
      }

      setCodes(data.codes || [])
      router.refresh()
    } catch {
      setError("Unable to connect to the server")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card code-generator">
      <span className="eyebrow">Create Codes</span>
      <h2 className="text-3xl font-black">Generate New Codes</h2>
      <p className="muted mt-3">
        Choose one of your lessons and the number of codes. Raw codes will be shown only once.
      </p>

      {error ? <div className="alert-error mt-5">{error}</div> : null}

      {codes.length ? (
        <div className="alert-success mt-5">
          <p className="font-black">Codes created successfully. Copy them now:</p>
          <div className="mt-3 grid gap-2">
            {codes.map((code) => (
              <code className="code-preview" key={code}>
                {code}
              </code>
            ))}
          </div>
        </div>
      ) : null}

      <div className="form-grid mt-6">
        <label className="font-bold">
          Lesson
          <select
            className="input mt-2"
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
            required
          >
            <option value="">Select lesson</option>
            {lessons.map((lesson) => (
              <option value={lesson.id} key={lesson.id}>
                {lesson.course_title ? `${lesson.course_title} — ` : ""}
                {lesson.chapter_title ? `${lesson.chapter_title} — ` : ""}
                {lesson.title} ({getLessonStatusLabel(lesson.status)})
              </option>
            ))}
          </select>
        </label>

        <label className="font-bold">
          Number of Codes
          <input
            className="input mt-2"
            type="number"
            min="1"
            max="500"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            required
          />
        </label>

        <label className="font-bold">
          Expiry Date
          <input
            className="input mt-2"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </label>

        <label className="font-bold">
          Code Type
          <select
            className="input mt-2"
            value={singleUse ? "single" : "multi"}
            onChange={(e) => setSingleUse(e.target.value === "single")}
          >
            <option value="single">Single use</option>
            <option value="multi">Multi use</option>
          </select>
        </label>
      </div>

      <button className="btn btn-block mt-6 disabled:opacity-60" disabled={isLoading}>
        {isLoading ? "Creating codes..." : "Create codes"}
      </button>
    </form>
  )
}
