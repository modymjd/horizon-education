"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  lessonId: number
  initialVideoUrl: string | null
}

export function LessonVideoForm({ lessonId, initialVideoUrl }: Props) {
  const router = useRouter()

  const [title, setTitle] = useState("فيديو الدرس")
  const [file, setFile] = useState<File | null>(null)
  const [currentVideoUrl, setCurrentVideoUrl] = useState(initialVideoUrl)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (!file) {
      setError("اختار ملف فيديو أولًا")
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("lesson_id", String(lessonId))
      formData.append("title", title || "فيديو جديد")
      formData.append("video", file)

      const res = await fetch("/api/teacher/lessons", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "تعذر رفع الفيديو")
        return
      }

      setSuccess(data.message || "تم رفع الفيديو بنجاح")
      setCurrentVideoUrl(data.video_url || null)
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
      <span className="eyebrow">فيديوهات الحصة</span>
      <h2 className="text-3xl font-black">رفع فيديو جديد</h2>
      <p className="muted mt-3">
        يمكنك رفع أكثر من فيديو داخل نفس الحصة، وسيظهروا للطالب بالترتيب.
      </p>

      {error ? <div className="alert-error mt-5">{error}</div> : null}
      {success ? <div className="alert-success mt-5">{success}</div> : null}

      {currentVideoUrl ? (
        <div className="mt-6">
          <p className="mb-2 font-bold">آخر فيديو تم رفعه</p>
          <video controls className="w-full rounded-2xl" src={currentVideoUrl}>
            المتصفح لا يدعم تشغيل الفيديو.
          </video>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-[var(--cream-2)] p-4 text-sm font-bold">
          لا يوجد فيديو مرفوع لهذه الحصة حتى الآن.
        </div>
      )}

      <label className="mt-6 block font-bold">
        عنوان الفيديو
        <input
          className="input mt-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="مثال: شرح الجزء الأول"
          required
        />
      </label>

      <label className="mt-4 block font-bold">
        اختر فيديو من جهازك
        <input
          className="input mt-2"
          type="file"
          accept="video/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
      </label>

      {file ? (
        <p className="muted mt-3 text-sm">
          الملف المختار: {file.name}
        </p>
      ) : null}

      <button className="btn btn-block mt-6 disabled:opacity-60" disabled={isLoading}>
        {isLoading ? "جاري رفع الفيديو..." : "رفع الفيديو"}
      </button>
    </form>
  )
}
