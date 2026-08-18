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
  draft: "Draft",
  published: "Published",
  paused: "Paused",
  ended: "Ended",
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
        setError(data.message || "Unable to create the course.")
        return
      }

      setMessage(data.message || "Course created successfully.")
      setForm(emptyForm)
      setShowForm(false)
      await reloadCourses()
    } catch {
      setError("Unable to connect to the server.")
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

        <p className="mt-1 text-sm opacity-70">Admin Dashboard</p>

        <nav className="mt-8 grid gap-2">
          <Link className="rounded-xl px-3 py-3 hover:bg-white/10" href="/admin">
            Home
          </Link>
          <Link
            className="rounded-xl px-3 py-3 hover:bg-white/10"
            href="/admin/teachers"
          >
            Teachers
          </Link>
          <Link
            className="rounded-xl bg-white/10 px-3 py-3"
            href="/admin/courses"
          >
            Courses
          </Link>
          <Link className="rounded-xl px-3 py-3 hover:bg-white/10" href="/admin/students">
            Students
          </Link>
          <Link className="rounded-xl px-3 py-3 hover:bg-white/10" href="/admin/payments">
            Payments
          </Link>
          <Link className="rounded-xl px-3 py-3 hover:bg-white/10" href="/admin/reports">
            Reports
          </Link>
        </nav>
      </aside>

      <section className="flex-1 p-5 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="badge">Admin Dashboard / Courses</span>
            <h1 className="mt-3 text-4xl font-black">Course Management</h1>
            <p className="mt-2 opacity-70">
              Create courses and assign each course to one teacher and an optional education type.
            </p>
          </div>

          <button
            className="btn btn-primary"
            type="button"
            onClick={() => setShowForm((value) => !value)}
          >
            {showForm ? "Close Form" : "Add Course"}
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
            <h2 className="text-2xl font-black">Add New Course</h2>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label>
                Course Name
                <input
                  className="input mt-2"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  required
                  dir="ltr"
                />
              </label>

              <label>
                Assigned Teacher
                <select
                  className="input mt-2"
                  value={form.teacherId}
                  onChange={(e) =>
                    setForm({ ...form, teacherId: e.target.value })
                  }
                  required
                  dir="ltr"
                >
                  <option value="">Select teacher</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Education Type
                <select
                  className="input mt-2"
                  value={form.educationTypeId}
                  onChange={(e) =>
                    setForm({ ...form, educationTypeId: e.target.value })
                  }
                  dir="ltr"
                >
                  <option value="">Not specified</option>
                  {educationTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Publish Status
                <select
                  className="input mt-2"
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as FormState["status"],
                    })
                  }
                  dir="ltr"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="paused">Paused</option>
                  <option value="ended">Ended</option>
                </select>
              </label>

              <label>
                Start Date
                <input
                  className="input mt-2"
                  type="date"
                  value={form.startsAt}
                  onChange={(e) =>
                    setForm({ ...form, startsAt: e.target.value })
                  }
                  dir="ltr"
                />
              </label>

              <label>
                End Date
                <input
                  className="input mt-2"
                  type="date"
                  value={form.endsAt}
                  onChange={(e) =>
                    setForm({ ...form, endsAt: e.target.value })
                  }
                  dir="ltr"
                />
              </label>

              <label>
                Access Duration in Days
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
                  dir="ltr"
                />
              </label>

              <label>
                Cover Image URL
                <input
                  className="input mt-2"
                  value={form.coverImageUrl}
                  onChange={(e) =>
                    setForm({ ...form, coverImageUrl: e.target.value })
                  }
                  dir="ltr"
                />
              </label>

              <label className="md:col-span-2">
                Short Description
                <input
                  className="input mt-2"
                  value={form.shortDescription}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      shortDescription: e.target.value,
                    })
                  }
                  dir="ltr"
                />
              </label>

              <label className="md:col-span-2">
                Full Description
                <textarea
                  className="input mt-2 min-h-32"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  dir="ltr"
                />
              </label>
            </div>

            <button
              className="btn btn-primary mt-6 disabled:opacity-60"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? "Saving..." : "Save Course"}
            </button>
          </form>
        ) : null}

        <div className="card mt-8 overflow-hidden p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black">Course List</h2>
            <span className="badge">{courses.length} courses</span>
          </div>

          <div className="mt-5 overflow-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Teacher</th>
                  <th>Education Type</th>
                  <th>Status</th>
                  <th>Chapters</th>
                  <th>Lessons</th>
                  <th>Access Duration</th>
                </tr>
              </thead>

              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <b>
                        <Link href={`/admin/courses/${course.id}`} className="font-black underline">
                          {course.title}
                        </Link>
                      </b>
                      <p className="mt-1 text-xs opacity-60">
                        {course.short_description || "No short description"}
                      </p>
                    </td>
                    <td>{course.teacher_name}</td>
                    <td>{course.education_type_name || "Not specified"}</td>
                    <td>
                      <span className="badge">
                        {statusLabel[course.status]}
                      </span>
                    </td>
                    <td>{course.chapters_count}</td>
                    <td>{course.lessons_count}</td>
                    <td>{course.access_duration_days || 30} days</td>
                  </tr>
                ))}

                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center opacity-60">
                      No courses yet.
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
