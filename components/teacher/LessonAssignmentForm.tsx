"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  lessonId: number
}

export function LessonAssignmentForm({ lessonId }: Props) {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [dueAt, setDueAt] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (!title.trim()) {
      setError("اكتب عنوان الواجب")
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("lesson_id", String(lessonId))
      formData.append("title", title)
      formData.append("description", description)
      formData.append("due_at", dueAt)

      if (file) {
        formData.append("attachment", file)
      }

      const res = await fetch("/api/teacher/assignments", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "تعذر إضافة الواجب")
        return
      }

      setSuccess(data.message || "تم إضافة الواجب بنجاح")
      setTitle("")
      setDescription("")
      setDueAt("")
      setFile(null)
      router.refresh()
    } catch {
      setError("تعذر الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card payment-form">
      <span className="eyebrow">واجبات الحصة</span>
      <h2 className="text-3xl font-black">إضافة واجب</h2>
      <p className="muted mt-3">
        أضف واجبًا مرتبطًا بهذه الحصة، مع ملف اختياري وتعليمات للطالب.
      </p>

      {error ? <div className="alert-error mt-5">{error}</div> : null}
      {success ? <div className="alert-success mt-5">{success}</div> : null}

      <label className="mt-6 block font-bold">
        عنوان الواجب
        <input
          className="input mt-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: واجب الدرس الأول"
          required
        />
      </label>

      <label className="mt-4 block font-bold">
        تعليمات الواجب
        <textarea
          className="input mt-2 min-h-28"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="اكتب المطلوب من الطالب..."
        />
      </label>

      <label className="mt-4 block font-bold">
        موعد التسليم
        <input
          className="input mt-2"
          type="datetime-local"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
        />
      </label>

      <label className="mt-4 block font-bold">
        ملف مرفق اختياري
        <input
          className="input mt-2"
          type="file"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>

      {file ? (
        <p className="muted mt-3 text-sm">
          الملف المختار: {file.name}
        </p>
      ) : null}

      <button className="btn btn-block mt-6 disabled:opacity-60" disabled={isLoading}>
        {isLoading ? "جاري الإضافة..." : "إضافة الواجب"}
      </button>
    </form>
  )
}