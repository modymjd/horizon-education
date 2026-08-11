"use client"

import { useState } from "react"

type Props = {
  lessonId: number
}

type ExamPlacement = "before_content" | "after_content"

export function LessonExamForm({ lessonId }: Props) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [passScore, setPassScore] = useState("60")
  const [required, setRequired] = useState(false)
  const [placement, setPlacement] = useState<ExamPlacement>("after_content")
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
          placement,
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
      setPlacement("after_content")
    } catch {
      setError("تعذر الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 md:p-8">
      <span className="eyebrow">امتحانات الحصة</span>
      <h2 className="text-3xl font-black">إضافة امتحان</h2>
      <p className="muted mt-2">
        أضف امتحانًا للحصة وحدد مكان ظهوره للطالب قبل محتوى الحصة أو بعده.
      </p>

      {error ? (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="alert-success mt-5">
          {success}
        </div>
      ) : null}

      <label className="mt-5 block">
        عنوان الامتحان
        <input
          className="input mt-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: امتحان تمهيدي على الحصة"
        />
      </label>

      <label className="mt-4 block">
        وصف الامتحان
        <textarea
          className="input mt-2 min-h-28"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="اكتب تعليمات الامتحان..."
        />
      </label>

      <label className="mt-4 block">
        مكان ظهور الامتحان
        <select
          className="input mt-2"
          value={placement}
          onChange={(e) => setPlacement(e.target.value as ExamPlacement)}
        >
          <option value="before_content">قبل الحصة</option>
          <option value="after_content">بعد الحصة</option>
        </select>
      </label>

      <label className="mt-4 block">
        درجة النجاح
        <input
          className="input mt-2"
          type="number"
          min="0"
          max="100"
          value={passScore}
          onChange={(e) => setPassScore(e.target.value)}
        />
      </label>

      <label className="mt-5 flex items-center gap-3 font-bold">
        <input
          type="checkbox"
          checked={required}
          onChange={(e) => setRequired(e.target.checked)}
        />
        مطلوب اجتيازه لفتح الحصة التالية
      </label>

      <button className="btn mt-6 w-full" type="submit" disabled={isLoading}>
        {isLoading ? "جاري الإضافة..." : "إضافة الامتحان"}
      </button>
    </form>
  )
}
