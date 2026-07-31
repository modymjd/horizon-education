"use client"

import Link from "next/link"
import { useState } from "react"

type Course = {
  id: number
  title: string
  short_description: string | null
  description: string | null
  status: "draft" | "published" | "paused" | "ended"
  starts_at: string | null
  ends_at: string | null
  access_duration_days: number | null
  teacher_name: string
  education_type_name: string | null
}

type Chapter = {
  id: number
  course_id: number
  title: string
  description: string | null
  cover_image_url: string | null
  sort_order: number
  status: "draft" | "published" | "hidden"
  published_at: string | null
  lessons_count: number
}

type FormState = {
  title: string
  description: string
  coverImageUrl: string
  sortOrder: string
  status: "draft" | "published" | "hidden"
  publishedAt: string
}

const emptyForm: FormState = {
  title: "",
  description: "",
  coverImageUrl: "",
  sortOrder: "0",
  status: "draft",
  publishedAt: "",
}

const courseStatusLabel = {
  draft: "مسودة",
  published: "منشور",
  paused: "متوقف",
  ended: "منتهي",
}

const chapterStatusLabel = {
  draft: "مسودة",
  published: "منشور",
  hidden: "مخفي",
}

export default function CourseDetailsClient({
  course,
  initialChapters,
}: {
  course: Course | null
  initialChapters: Chapter[]
}) {
  const [chapters, setChapters] = useState<Chapter[]>(initialChapters)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  if (!course) {
    return (
      <main className="grid min-h-screen place-items-center p-5">
        <div className="card max-w-md p-8 text-center">
          <span className="badge">404</span>
          <h1 className="mt-4 text-3xl font-black">الكورس غير موجود</h1>
          <Link href="/admin/courses" className="btn btn-primary mt-6 inline-block">
            العودة للكورسات
          </Link>
        </div>
      </main>
    )
  }

  async function reloadChapters() {
    const res = await fetch(`/api/admin/courses/${course.id}/chapters`, {
      cache: "no-store",
    })

    const data = await res.json()
    setChapters(data.chapters || [])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setMessage("")
    setIsLoading(true)

    try {
      const res = await fetch(`/api/admin/courses/${course.id}/chapters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          coverImageUrl: form.coverImageUrl,
          sortOrder: form.sortOrder,
          status: form.status,
          publishedAt: form.publishedAt || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "حدث خطأ أثناء إنشاء الشابتر")
        return
      }

      setMessage(data.message || "تم إنشاء الشابتر بنجاح")
      setForm(emptyForm)
      setShowForm(false)
      await reloadChapters()
    } catch {
      setError("تعذر الاتصال بالخادم")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen md:flex">
      <aside className="sidebar p-5 md:min-h-screen md:w-72">
        <Link href="/admin" className="text-2xl font-black">
          Horizon
        </Link>

        <p className="mt-1 text-sm opacity-70">لوحة الأدمن</p>

        <nav className="mt-8 grid gap-2">
          <Link className="rounded-xl px-3 py-3 hover:bg-white/10" href="/admin">
            الرئيسية
          </Link>
          <Link
            className="rounded-xl px-3 py-3 hover:bg-white/10"
            href="/admin/teachers"
          >
            المدرسون
          </Link>
          <Link
            className="rounded-xl bg-white/10 px-3 py-3"
            href="/admin/courses"
          >
            الكورسات
          </Link>
        </nav>
      </aside>

      <section className="flex-1 p-5 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="badge">لوحة الأدمن / الكورسات / تفاصيل الكورس</span>
            <h1 className="mt-3 text-4xl font-black">{course.title}</h1>
            <p className="mt-2 opacity-70">
              {course.short_description || "إدارة بيانات الكورس والشابترات التابعة له."}
            </p>
          </div>

          <Link href="/admin/courses" className="btn btn-soft">
            العودة للكورسات
          </Link>
        </div>

        <div className="mt-8 grid-auto">
          <div className="card p-5">
            <p className="text-sm opacity-60">المدرس</p>
            <b className="mt-2 block text-xl">{course.teacher_name}</b>
          </div>

          <div className="card p-5">
            <p className="text-sm opacity-60">نوع التعليم</p>
            <b className="mt-2 block text-xl">
              {course.education_type_name || "غير محدد"}
            </b>
          </div>

          <div className="card p-5">
            <p className="text-sm opacity-60">حالة الكورس</p>
            <b className="mt-2 block text-xl">
              {courseStatusLabel[course.status]}
            </b>
          </div>

          <div className="card p-5">
            <p className="text-sm opacity-60">مدة إتاحة الحصة</p>
            <b className="mt-2 block text-xl">
              {course.access_duration_days || 30} يوم
            </b>
          </div>
        </div>

        {message ? (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-green-700">
            {message}
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        ) : null}

        <div className="mt-8 flex items-center justify-between gap-3">
          <h2 className="text-3xl font-black">الشابترات</h2>

          <button
            className="btn btn-primary"
            type="button"
            onClick={() => setShowForm((value) => !value)}
          >
            {showForm ? "إغلاق النموذج" : "إضافة شابتر"}
          </button>
        </div>

        {showForm ? (
          <form onSubmit={handleSubmit} className="card mt-6 p-6">
            <h3 className="text-2xl font-black">إضافة شابتر جديد</h3>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label>
                اسم الشابتر
                <input
                  className="input mt-2"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                الترتيب
                <input
                  className="input mt-2"
                  type="number"
                  min="0"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm({ ...form, sortOrder: e.target.value })
                  }
                />
              </label>

              <label>
                حالة الشابتر
                <select
                  className="input mt-2"
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as FormState["status"],
                    })
                  }
                >
                  <option value="draft">مسودة</option>
                  <option value="published">منشور</option>
                  <option value="hidden">مخفي</option>
                </select>
              </label>

              <label>
                تاريخ النشر الاختياري
                <input
                  className="input mt-2"
                  type="datetime-local"
                  value={form.publishedAt}
                  onChange={(e) =>
                    setForm({ ...form, publishedAt: e.target.value })
                  }
                />
              </label>

              <label className="md:col-span-2">
                رابط صورة الشابتر
                <input
                  className="input mt-2"
                  value={form.coverImageUrl}
                  onChange={(e) =>
                    setForm({ ...form, coverImageUrl: e.target.value })
                  }
                />
              </label>

              <label className="md:col-span-2">
                وصف الشابتر
                <textarea
                  className="input mt-2 min-h-28"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>
            </div>

            <button
              className="btn btn-primary mt-6 disabled:opacity-60"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? "جاري الحفظ..." : "حفظ الشابتر"}
            </button>
          </form>
        ) : null}

        <div className="card mt-6 overflow-hidden p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-2xl font-black">قائمة الشابترات</h3>
            <span className="badge">{chapters.length} شابتر</span>
          </div>

          <div className="mt-5 overflow-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>الشابتر</th>
                  <th>الترتيب</th>
                  <th>الحالة</th>
                  <th>الحصص</th>
                  <th>تاريخ النشر</th>
                </tr>
              </thead>

              <tbody>
                {chapters.map((chapter) => (
                  <tr key={chapter.id}>
                    <td>
                      <b><Link href={`/admin/chapters/${chapter.id}`} className="font-black underline">
  #{chapter.id} - {chapter.title}
</Link></b>
                      <p className="mt-1 text-xs opacity-60">
                        {chapter.description || "بدون وصف"}
                      </p>
                    </td>
                    <td>{chapter.sort_order}</td>
                    <td>
                      <span className="badge">
                        {chapterStatusLabel[chapter.status]}
                      </span>
                    </td>
                    <td>{chapter.lessons_count}</td>
                    <td>
                      {chapter.published_at
                        ? new Date(chapter.published_at).toLocaleString("ar-EG")
                        : "غير محدد"}
                    </td>
                  </tr>
                ))}

                {chapters.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center opacity-60">
                      لا توجد شابترات بعد.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  )
}