"use client"

import Link from "next/link"
import { useState } from "react"

type Course = {
  id: number
  slug: string
  title: string
  short_description: string | null
  status: "draft" | "published" | "paused" | "ended"
  starts_at: string | null
  ends_at: string | null
  access_duration_days: number | null
  teacher_id: number
  teacher_name: string
  education_type_id: number | null
  education_type_name: string | null
  chapters_count: number
  lessons_count: number
}

type Teacher = {
  id: number
  full_name: string
}

type EducationType = {
  id: number
  name: string
  slug: string
}

type FormState = {
  title: string
  shortDescription: string
  description: string
  coverImageUrl: string
  teacherId: string
  educationTypeId: string
  status: "draft" | "published" | "paused" | "ended"
  startsAt: string
  endsAt: string
  accessDurationDays: string
}

const emptyForm: FormState = {
  title: "",
  shortDescription: "",
  description: "",
  coverImageUrl: "",
  teacherId: "",
  educationTypeId: "",
  status: "draft",
  startsAt: "",
  endsAt: "",
  accessDurationDays: "30",
}

const statusLabel = {
  draft: "مسودة",
  published: "منشور",
  paused: "متوقف",
  ended: "منتهي",
}

export default function CoursesClient({
  initialCourses,
  teachers,
  educationTypes,
}: {
  initialCourses: Course[]
  teachers: Teacher[]
  educationTypes: EducationType[]
}) {
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function reloadCourses() {
    const res = await fetch("/api/admin/courses", {
      cache: "no-store",
    })

    const data = await res.json()
    setCourses(data.courses || [])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setMessage("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: form.title,
          shortDescription: form.shortDescription,
          description: form.description,
          coverImageUrl: form.coverImageUrl,
          teacherId: form.teacherId,
          educationTypeId: form.educationTypeId || undefined,
          status: form.status,
          startsAt: form.startsAt || undefined,
          endsAt: form.endsAt || undefined,
          accessDurationDays: form.accessDurationDays,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "حدث خطأ أثناء إنشاء الكورس")
        return
      }

      setMessage(data.message || "تم إنشاء الكورس بنجاح")
      setForm(emptyForm)
      setShowForm(false)
      await reloadCourses()
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
          <Link className="rounded-xl px-3 py-3 hover:bg-white/10" href="/admin">
            الطلاب
          </Link>
          <Link className="rounded-xl px-3 py-3 hover:bg-white/10" href="/admin">
            المدفوعات
          </Link>
          <Link className="rounded-xl px-3 py-3 hover:bg-white/10" href="/admin">
            التقارير
          </Link>
        </nav>
      </aside>

      <section className="flex-1 p-5 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="badge">لوحة الأدمن / الكورسات</span>
            <h1 className="mt-3 text-4xl font-black">إدارة الكورسات</h1>
            <p className="mt-2 opacity-70">
              إنشاء الكورسات وربط كل كورس بمدرس واحد ونوع تعليم محدد.
            </p>
          </div>

          <button
            className="btn btn-primary"
            type="button"
            onClick={() => setShowForm((value) => !value)}
          >
            {showForm ? "إغلاق النموذج" : "إضافة كورس"}
          </button>
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

        {showForm ? (
          <form onSubmit={handleSubmit} className="card mt-8 p-6">
            <h2 className="text-2xl font-black">إضافة كورس جديد</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label>
                اسم الكورس
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
                المدرس المسؤول
                <select
                  className="input mt-2"
                  value={form.teacherId}
                  onChange={(e) =>
                    setForm({ ...form, teacherId: e.target.value })
                  }
                  required
                >
                  <option value="">اختر المدرس</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                نوع التعليم
                <select
                  className="input mt-2"
                  value={form.educationTypeId}
                  onChange={(e) =>
                    setForm({ ...form, educationTypeId: e.target.value })
                  }
                >
                  <option value="">بدون تحديد</option>
                  {educationTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
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
                  <option value="paused">متوقف</option>
                  <option value="ended">منتهي</option>
                </select>
              </label>

              <label>
                تاريخ البداية
                <input
                  className="input mt-2"
                  type="date"
                  value={form.startsAt}
                  onChange={(e) =>
                    setForm({ ...form, startsAt: e.target.value })
                  }
                />
              </label>

              <label>
                تاريخ النهاية
                <input
                  className="input mt-2"
                  type="date"
                  value={form.endsAt}
                  onChange={(e) =>
                    setForm({ ...form, endsAt: e.target.value })
                  }
                />
              </label>

              <label>
                مدة الإتاحة بالأيام
                <input
                  className="input mt-2"
                  type="number"
                  min="1"
                  value={form.accessDurationDays}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      accessDurationDays: e.target.value,
                    })
                  }
                />
              </label>

              <label>
                رابط صورة الغلاف
                <input
                  className="input mt-2"
                  value={form.coverImageUrl}
                  onChange={(e) =>
                    setForm({ ...form, coverImageUrl: e.target.value })
                  }
                />
              </label>

              <label className="md:col-span-2">
                وصف مختصر
                <input
                  className="input mt-2"
                  value={form.shortDescription}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      shortDescription: e.target.value,
                    })
                  }
                />
              </label>

              <label className="md:col-span-2">
                وصف تفصيلي
                <textarea
                  className="input mt-2 min-h-32"
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
              {isLoading ? "جاري الحفظ..." : "حفظ الكورس"}
            </button>
          </form>
        ) : null}

        <div className="card mt-8 overflow-hidden p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black">قائمة الكورسات</h2>
            <span className="badge">{courses.length} كورس</span>
          </div>

          <div className="mt-5 overflow-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>الكورس</th>
                  <th>المدرس</th>
                  <th>نوع التعليم</th>
                  <th>الحالة</th>
                  <th>الشابترات</th>
                  <th>الحصص</th>
                  <th>مدة الإتاحة</th>
                </tr>
              </thead>

              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <b><Link href={`/admin/courses/${course.id}`} className="font-black underline">{course.title}</Link></b>
                      <p className="mt-1 text-xs opacity-60">
                        {course.short_description || "بدون وصف مختصر"}
                      </p>
                    </td>
                    <td>{course.teacher_name}</td>
                    <td>{course.education_type_name || "غير محدد"}</td>
                    <td>
                      <span className="badge">
                        {statusLabel[course.status]}
                      </span>
                    </td>
                    <td>{course.chapters_count}</td>
                    <td>{course.lessons_count}</td>
                    <td>{course.access_duration_days || 30} يوم</td>
                  </tr>
                ))}

                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center opacity-60">
                      لا توجد كورسات بعد.
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