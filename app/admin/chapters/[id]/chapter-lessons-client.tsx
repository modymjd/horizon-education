"use client"

import Link from "next/link"
import { useState } from "react"

type Chapter = {
  id: number
  title: string
  description: string | null
  status: "draft" | "published" | "hidden"
  sort_order: number
  published_at: string | null
  course_id: number
  course_title: string
  teacher_name: string
}

type Lesson = {
  id: number
  chapter_id: number
  title: string
  description: string | null
  thumbnail_url: string | null
  price: string
  sort_order: number
  status: "draft" | "published" | "hidden"
  available_from: string | null
  available_until: string | null
}

type FormState = {
  title: string
  description: string
  thumbnailUrl: string
  price: string
  sortOrder: string
  status: "draft" | "published" | "hidden"
  availableFrom: string
  availableUntil: string
}

const emptyForm: FormState = {
  title: "",
  description: "",
  thumbnailUrl: "",
  price: "0",
  sortOrder: "0",
  status: "draft",
  availableFrom: "",
  availableUntil: "",
}

const lessonStatusLabel = {
  draft: "مسودة",
  published: "منشور",
  hidden: "مخفي",
}

export default function ChapterLessonsClient({
  chapter,
  initialLessons,
}: {
  chapter: Chapter | null
  initialLessons: Lesson[]
}) {
  const [lessons, setLessons] = useState<Lesson[]>(initialLessons)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  if (!chapter) {
    return (
      <main className="grid min-h-screen place-items-center p-5">
        <div className="card max-w-md p-8 text-center">
          <span className="badge">404</span>
          <h1 className="mt-4 text-3xl font-black">الشابتر غير موجود</h1>
          <Link href="/admin/courses" className="btn btn-primary mt-6 inline-block">
            العودة للكورسات
          </Link>
        </div>
      </main>
    )
  }

  async function reloadLessons() {
    const res = await fetch(`/api/admin/chapters/${chapter.id}/lessons`, {
      cache: "no-store",
    })

    const data = await res.json()
    setLessons(data.lessons || [])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setMessage("")
    setIsLoading(true)

    try {
      const res = await fetch(`/api/admin/chapters/${chapter.id}/lessons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          thumbnailUrl: form.thumbnailUrl,
          price: form.price,
          sortOrder: form.sortOrder,
          status: form.status,
          availableFrom: form.availableFrom || undefined,
          availableUntil: form.availableUntil || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "حدث خطأ أثناء إنشاء الحصة")
        return
      }

      setMessage(data.message || "تم إنشاء الحصة بنجاح")
      setForm(emptyForm)
      setShowForm(false)
      await reloadLessons()
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
          <Link className="rounded-xl px-3 py-3 hover:bg-white/10" href="/admin/teachers">
            المدرسون
          </Link>
          <Link className="rounded-xl bg-white/10 px-3 py-3" href="/admin/courses">
            الكورسات
          </Link>
        </nav>
      </aside>

      <section className="flex-1 p-5 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="badge">لوحة الأدمن / الشابترات / الحصص</span>
            <h1 className="mt-3 text-4xl font-black">{chapter.title}</h1>
            <p className="mt-2 opacity-70">
              الكورس: {chapter.course_title} — المدرس: {chapter.teacher_name}
            </p>
          </div>

          <Link href={`/admin/courses/${chapter.course_id}`} className="btn btn-soft">
            العودة للكورس
          </Link>
        </div>

        <div className="mt-8 grid-auto">
          <div className="card p-5">
            <p className="text-sm opacity-60">عدد الحصص</p>
            <b className="mt-2 block text-xl">{lessons.length}</b>
          </div>

          <div className="card p-5">
            <p className="text-sm opacity-60">ترتيب الشابتر</p>
            <b className="mt-2 block text-xl">{chapter.sort_order}</b>
          </div>

          <div className="card p-5">
            <p className="text-sm opacity-60">الحالة</p>
            <b className="mt-2 block text-xl">{chapter.status}</b>
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
          <h2 className="text-3xl font-black">الحصص</h2>

          <button
            className="btn btn-primary"
            type="button"
            onClick={() => setShowForm((value) => !value)}
          >
            {showForm ? "إغلاق النموذج" : "إضافة حصة"}
          </button>
        </div>

        {showForm ? (
          <form onSubmit={handleSubmit} className="card mt-6 p-6">
            <h3 className="text-2xl font-black">إضافة حصة جديدة</h3>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label>
                اسم الحصة
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
                السعر
                <input
                  className="input mt-2"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.price}
                  onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
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
                حالة النشر
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
                بداية الإتاحة
                <input
                  className="input mt-2"
                  type="datetime-local"
                  value={form.availableFrom}
                  onChange={(e) =>
                    setForm({ ...form, availableFrom: e.target.value })
                  }
                />
              </label>

              <label>
                نهاية الإتاحة
                <input
                  className="input mt-2"
                  type="datetime-local"
                  value={form.availableUntil}
                  onChange={(e) =>
                    setForm({ ...form, availableUntil: e.target.value })
                  }
                />
              </label>

              <label className="md:col-span-2">
                رابط الصورة المصغرة
                <input
                  className="input mt-2"
                  value={form.thumbnailUrl}
                  onChange={(e) =>
                    setForm({ ...form, thumbnailUrl: e.target.value })
                  }
                />
              </label>

              <label className="md:col-span-2">
                وصف الحصة
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
              {isLoading ? "جاري الحفظ..." : "حفظ الحصة"}
            </button>
          </form>
        ) : null}

        <div className="card mt-6 overflow-hidden p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-2xl font-black">قائمة الحصص</h3>
            <span className="badge">{lessons.length} حصة</span>
          </div>

          <div className="mt-5 overflow-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>الحصة</th>
                  <th>السعر</th>
                  <th>الترتيب</th>
                  <th>الحالة</th>
                  <th>بداية الإتاحة</th>
                  <th>نهاية الإتاحة</th>
                </tr>
              </thead>

              <tbody>
                {lessons.map((lesson) => (
                  <tr key={lesson.id}>
                    <td>
                      <b><Link href={`/admin/lessons/${lesson.id}`} className="font-black underline">{lesson.title}</Link></b>
                      <p className="mt-1 text-xs opacity-60">
                        {lesson.description || "بدون وصف"}
                      </p>
                    </td>
                    <td>{lesson.price} ج</td>
                    <td>{lesson.sort_order}</td>
                    <td>
                      <span className="badge">
                        {lessonStatusLabel[lesson.status]}
                      </span>
                    </td>
                    <td>
                      {lesson.available_from
                        ? new Date(lesson.available_from).toLocaleString("ar-EG")
                        : "غير محدد"}
                    </td>
                    <td>
                      {lesson.available_until
                        ? new Date(lesson.available_until).toLocaleString("ar-EG")
                        : "غير محدد"}
                    </td>
                  </tr>
                ))}

                {lessons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center opacity-60">
                      لا توجد حصص بعد.
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