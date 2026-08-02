"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  lessonId: number
}

export function LessonExamForm({ lessonId }: Props) {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [passScore, setPassScore] = useState("60")
  const [required, setRequired] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (!title.trim()) {
      setError("اكتب عنوان الامتحان")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/teacher/exams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lesson_id: lessonId,
          title,
          description,
          pass_score: Number(passScore),
          is_required_to_unlock_next: required,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "تعذر إضافة الامتحان")
        return
      }

      setSuccess(data.message || "تم إضافة الامتحان بنجاح")
      setTitle("")
      setDescription("")
      setPassScore("60")
      setRequired(false)
      router.refresh()
    } catch {
      setError("تعذر الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card payment-form">
      <span className="eyebrow">امتحانات الحصة</span>
      <h2 className="text-3xl font-black">إضافة امتحان</h2>
      <p className="muted mt-3">
        أضف امتحانًا للحصة وحدد هل اجتيازه مطلوب لفتح الحصة التالية.
      </p>

      {error ? <div className="alert-error mt-5">{error}</div> : null}
      {success ? <div className="alert-success mt-5">{success}</div> : null}

      <label className="mt-6 block font-bold">
        عنوان الامتحان
        <input
          className="input mt-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: اختبار سريع بعد الدرس"
          required
        />
      </label>

      <label className="mt-4 block font-bold">
        وصف الامتحان
        <textarea
          className="input mt-2 min-h-28"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="اكتب تعليمات الامتحان..."
        />
      </label>

      <label className="mt-4 block font-bold">
        درجة النجاح
        <input
          className="input mt-2"
          type="number"
          min="0"
          max="100"
          value={passScore}
          onChange={(e) => setPassScore(e.target.value)}
          required
        />
      </label>

      <label className="mt-4 flex items-center gap-3 font-bold">
        <input
          type="checkbox"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
        />
        مطلوب اجتيازه لفتح الحصة التالية
      </label>

      <button className="btn btn-block mt-6 disabled:opacity-60" disabled={isLoading}>
        {isLoading ? "جاري الإضافة..." : "إضافة الامتحان"}
      </button>
    </form>
  )
}