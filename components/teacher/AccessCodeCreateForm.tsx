"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type LessonOption = {
  id: number
  title: string
  course_title: string | null
}

type Props = {
  lessons: LessonOption[]
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
        setError(data.message || "تعذر إنشاء الأكواد")
        return
      }

      setCodes(data.codes || [])
      router.refresh()
    } catch {
      setError("تعذر الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card code-generator">
      <span className="eyebrow">إنشاء أكواد</span>
      <h2 className="text-3xl font-black">ولّد أكواد جديدة</h2>
      <p className="muted mt-3">
        اختر الحصة وعدد الأكواد، وسيتم عرض الأكواد الخام مرة واحدة فقط.
      </p>

      {error ? <div className="alert-error mt-5">{error}</div> : null}

      {codes.length ? (
        <div className="alert-success mt-5">
          <p className="font-black">تم إنشاء الأكواد بنجاح. انسخها الآن:</p>
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
          الحصة
          <select
            className="input mt-2"
            value={lessonId}
            onChange={(e) => setLessonId(e.target.value)}
            required
          >
            <option value="">اختر الحصة</option>
            {lessons.map((lesson) => (
              <option value={lesson.id} key={lesson.id}>
                {lesson.course_title ? `${lesson.course_title} — ` : ""}
                {lesson.title}
              </option>
            ))}
          </select>
        </label>

        <label className="font-bold">
          عدد الأكواد
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
          تاريخ الانتهاء
          <input
            className="input mt-2"
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
          />
        </label>

        <label className="font-bold">
          نوع الكود
          <select
            className="input mt-2"
            value={singleUse ? "single" : "multi"}
            onChange={(e) => setSingleUse(e.target.value === "single")}
          >
            <option value="single">استخدام مرة واحدة</option>
            <option value="multi">متعدد الاستخدام</option>
          </select>
        </label>
      </div>

      <button className="btn btn-block mt-6 disabled:opacity-60" disabled={isLoading}>
        {isLoading ? "جاري إنشاء الأكواد..." : "إنشاء الأكواد"}
      </button>
    </form>
  )
}
