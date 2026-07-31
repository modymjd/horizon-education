"use client"

import Link from "next/link"
import { useState } from "react"

type Teacher = {
  id: number
  full_name: string
  email: string
  phone: string
  status: "active" | "suspended" | "banned"
  bio: string | null
  address: string | null
  platform_commission_pct: string
  courses_count: number
}

type FormState = {
  fullName: string
  email: string
  phone: string
  password: string
  address: string
  bio: string
  commission: string
  status: "active" | "suspended" | "banned"
}

const emptyForm: FormState = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  address: "",
  bio: "",
  commission: "20",
  status: "active",
}

const statusLabel = {
  active: "نشط",
  suspended: "موقوف مؤقتًا",
  banned: "محظور",
}

export default function TeachersClient({
  initialTeachers,
}: {
  initialTeachers: Teacher[]
}) {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [showForm, setShowForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  async function reloadTeachers() {
    const res = await fetch("/api/admin/teachers", {
      cache: "no-store",
    })

    const data = await res.json()
    setTeachers(data.teachers || [])
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setMessage("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/admin/teachers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          address: form.address,
          bio: form.bio,
          commission: form.commission,
          status: form.status,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "حدث خطأ أثناء إنشاء المدرس")
        return
      }

      setMessage(data.message || "تم إنشاء المدرس بنجاح")
      setForm(emptyForm)
      setShowForm(false)
      await reloadTeachers()
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
            className="rounded-xl bg-white/10 px-3 py-3"
            href="/admin/teachers"
          >
            المدرسون
          </Link>
          <Link className="rounded-xl px-3 py-3 hover:bg-white/10" href="/admin">
            الطلاب
          </Link>
          <Link className="rounded-xl px-3 py-3 hover:bg-white/10" href="/admin">
            الكورسات
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
            <span className="badge">لوحة الأدمن / المدرسون</span>
            <h1 className="mt-3 text-4xl font-black">إدارة المدرسين</h1>
            <p className="mt-2 opacity-70">
              إنشاء حسابات المدرسين ومتابعة حالتهم ونسبة المنصة وعدد الكورسات.
            </p>
          </div>

          <button
            className="btn btn-primary"
            type="button"
            onClick={() => setShowForm((value) => !value)}
          >
            {showForm ? "إغلاق النموذج" : "إضافة مدرس"}
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
            <h2 className="text-2xl font-black">إضافة مدرس جديد</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label>
                الاسم الكامل
                <input
                  className="input mt-2"
                  value={form.fullName}
                  onChange={(e) =>
                    setForm({ ...form, fullName: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                البريد الإلكتروني
                <input
                  className="input mt-2"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                رقم الهاتف
                <input
                  className="input mt-2"
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                كلمة المرور
                <input
                  className="input mt-2"
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                العنوان
                <input
                  className="input mt-2"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </label>

              <label>
                نسبة المنصة %
                <input
                  className="input mt-2"
                  type="number"
                  min="0"
                  max="100"
                  value={form.commission}
                  onChange={(e) =>
                    setForm({ ...form, commission: e.target.value })
                  }
                  required
                />
              </label>

              <label>
                حالة الحساب
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
                  <option value="active">نشط</option>
                  <option value="suspended">موقوف مؤقتًا</option>
                  <option value="banned">محظور</option>
                </select>
              </label>

              <label className="md:col-span-2">
                نبذة عن المدرس
                <textarea
                  className="input mt-2 min-h-28"
                  value={form.bio}
                  onChange={(e) =>
                    setForm({ ...form, bio: e.target.value })
                  }
                />
              </label>
            </div>

            <button
              className="btn btn-primary mt-6 disabled:opacity-60"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? "جاري الحفظ..." : "حفظ المدرس"}
            </button>
          </form>
        ) : null}

        <div className="card mt-8 overflow-hidden p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black">قائمة المدرسين</h2>
            <span className="badge">{teachers.length} مدرس</span>
          </div>

          <div className="mt-5 overflow-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>البريد</th>
                  <th>الهاتف</th>
                  <th>الحالة</th>
                  <th>نسبة المنصة</th>
                  <th>الكورسات</th>
                </tr>
              </thead>

              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>
                      <b>{teacher.full_name}</b>
                      <p className="mt-1 text-xs opacity-60">
                        {teacher.address || "بدون عنوان"}
                      </p>
                    </td>
                    <td>{teacher.email}</td>
                    <td>{teacher.phone}</td>
                    <td>
                      <span className="badge">
                        {statusLabel[teacher.status]}
                      </span>
                    </td>
                    <td>{teacher.platform_commission_pct}%</td>
                    <td>{teacher.courses_count}</td>
                  </tr>
                ))}

                {teachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center opacity-60">
                      لا يوجد مدرسون بعد.
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