"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type ChapterOption = {
  id: number
  title: string
}

type Props = {
  courseId: number
  chapters: ChapterOption[]
}

export function TeacherLessonCreateForm({ courseId, chapters }: Props) {
  const router = useRouter()

  const [chapterId, setChapterId] = useState(chapters[0]?.id ? String(chapters[0].id) : "")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("0")
  const [status, setStatus] = useState("published")
  const [sortOrder, setSortOrder] = useState("0")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (!chapterId) {
      setError("اختار الشابتر أولًا")
      return
    }

    if (!title.trim()) {
      setError("اكتب عنوان الحصة")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/teacher/course-lessons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: courseId,
          chapter_id: Number(chapterId),
          title,
          description,
          price: Number(price || 0),
          status,
          sort_order: Number(sortOrder || 0),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "تعذر إضافة الحصة")
        return
      }

      setSuccess(data.message || "تم إضافة الحصة بنجاح")

      if (data.lesson_id) {
        router.push(`/teacher/lessons/${data.lesson_id}`)
        router.refresh()
      }
    } catch {
      setError("تعذر الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card payment-form">
      <span className="eyebrow">حصص الكورس</span>
      <h2 className="text-3xl font-black">إضافة حصة جديدة</h2>
      <p className="muted mt-3">
        أضف حصة داخل شابتر موجود، وبعدها يمكنك رفع الفيديوهات والواجبات والامتحانات.
      </p>

      {error ? <div className="alert-error mt-5">{error}</div> : null}
      {success ? <div className="alert-success mt-5">{success}</div> : null}

      <label className="mt-6 block font-bold">
        الشابتر
        <select
          className="input mt-2"
          value={chapterId}
          onChange={(e) => setChapterId(e.target.value)}
          required
        >
          {chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.title}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block font-bold">
        عنوان الحصة
        <input
          className="input mt-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: الحصة الثانية"
          required
        />
      </label>

      <label className="mt-4 block font-bold">
        وصف الحصة
        <textarea
          className="input mt-2 min-h-28"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="اكتب وصف مختصر للحصة..."
        />
      </label>

      <label className="mt-4 block font-bold">
        سعر الحصة
        <input
          className="input mt-2"
          type="number"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />
      </label>

      <label className="mt-4 block font-bold">
        ترتيب الحصة
        <input
          className="input mt-2"
          type="number"
          min="0"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        />
      </label>

      <label className="mt-4 block font-bold">
        الحالة
        <select
          className="input mt-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="published">منشورة</option>
          <option value="draft">مسودة</option>
          <option value="hidden">مخفية</option>
        </select>
      </label>

      <button className="btn btn-block mt-6 disabled:opacity-60" disabled={isLoading}>
        {isLoading ? "جاري الإضافة..." : "إضافة الحصة"}
      </button>
    </form>
  )
}
