"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
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

const lessonStatusLabel: Record<Lesson["status"], string> = {
  draft: "Draft",
  published: "Published",
  hidden: "Hidden",
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
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isChapterLoading, setIsChapterLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [chapterOrder, setChapterOrder] = useState(String(chapter?.sort_order ?? 0))
  const [chapterStatus, setChapterStatus] = useState<Chapter["status"]>(
    chapter?.status ?? "draft"
  )

  if (!chapter) {
    return (
      <main className="grid min-h-screen place-items-center p-5">
        <div className="card max-w-md p-8 text-center">
          <span className="badge">404</span>
          <h1 className="mt-4 text-3xl font-black">Chapter not found</h1>
          <Link href="/admin/courses" className="btn btn-primary mt-6 inline-block">
            Back to Courses
          </Link>
        </div>
      </main>
    )
  }

  const chapterId = chapter.id

  async function reloadLessons() {
    const res = await fetch(`/api/admin/chapters/${chapterId}/lessons`, {
      cache: "no-store",
    })

    const data = await res.json()
    setLessons(data.lessons || [])
  }

  async function handleChapterSettingsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setMessage("")
    setIsChapterLoading(true)

    try {
      const res = await fetch(`/api/admin/chapters/${chapterId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sort_order: Number(chapterOrder),
          status: chapterStatus,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Unable to update chapter")
        return
      }

      setMessage(data.message || "Chapter updated successfully")
      router.refresh()
    } catch {
      setError("Unable to connect to the server")
    } finally {
      setIsChapterLoading(false)
    }
  }

  async function handleDeleteChapter() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this chapter? Its lessons will be hidden as well."
    )

    if (!confirmed) {
      return
    }

    setError("")
    setMessage("")
    setIsChapterLoading(true)

    try {
      const res = await fetch(`/api/admin/chapters/${chapterId}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Unable to delete chapter")
        return
      }

      router.push(`/admin/courses/${chapter!.course_id}`)
      router.refresh()
    } catch {
      setError("Unable to connect to the server")
    } finally {
      setIsChapterLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setMessage("")
    setIsLoading(true)

    try {
      const res = await fetch(`/api/admin/chapters/${chapterId}/lessons`, {
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
        setError(data.message || "Unable to create lesson")
        return
      }

      setMessage(data.message || "Lesson created successfully")
      setForm(emptyForm)
      setShowForm(false)
      await reloadLessons()
    } catch {
      setError("Unable to connect to the server")
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
          <Link className="rounded-xl px-3 py-3 hover:bg-white/10" href="/admin/teachers">
            Teachers
          </Link>
          <Link className="rounded-xl bg-white/10 px-3 py-3" href="/admin/courses">
            Courses
          </Link>
        </nav>
      </aside>

      <section className="flex-1 p-5 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="badge">Admin / Chapters / Lessons</span>
            <h1 className="mt-3 text-4xl font-black">{chapter.title}</h1>
            <p className="mt-2 opacity-70">
              Course: {chapter.course_title} — Teacher: {chapter.teacher_name}
            </p>
          </div>

          <Link href={`/admin/courses/${chapter.course_id}`} className="btn btn-soft">
            Back to Course
          </Link>
        </div>

        <div className="mt-8 grid-auto">
          <div className="card p-5">
            <p className="text-sm opacity-60">Lessons Count</p>
            <b className="mt-2 block text-xl">{lessons.length}</b>
          </div>

          <div className="card p-5">
            <p className="text-sm opacity-60">Chapter Order</p>
            <b className="mt-2 block text-xl">{chapterOrder}</b>
          </div>

          <div className="card p-5">
            <p className="text-sm opacity-60">Status</p>
            <b className="mt-2 block text-xl">{lessonStatusLabel[chapterStatus]}</b>
          </div>
        </div>

        <form onSubmit={handleChapterSettingsSubmit} className="card mt-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <span className="badge">Chapter Settings</span>
              <h2 className="mt-3 text-2xl font-black">Order and visibility</h2>
              <p className="mt-2 opacity-70">
                Update the chapter order inside the course or delete it from the admin panel.
              </p>
            </div>

            <button
              className="btn btn-outline disabled:opacity-60"
              disabled={isChapterLoading}
              type="button"
              onClick={handleDeleteChapter}
            >
              Delete Chapter
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <label>
              Chapter Order
              <input
                className="input mt-2"
                type="number"
                min="0"
                value={chapterOrder}
                onChange={(e) => setChapterOrder(e.target.value)}
                required
              />
            </label>

            <label>
              Chapter Status
              <select
                className="input mt-2"
                value={chapterStatus}
                onChange={(e) => setChapterStatus(e.target.value as Chapter["status"])}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="hidden">Hidden</option>
              </select>
            </label>
          </div>

          <button
            className="btn btn-primary mt-6 disabled:opacity-60"
            disabled={isChapterLoading}
            type="submit"
          >
            {isChapterLoading ? "Saving..." : "Save Chapter Settings"}
          </button>
        </form>

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
          <h2 className="text-3xl font-black">Lessons</h2>

          <button
            className="btn btn-primary"
            type="button"
            onClick={() => setShowForm((value) => !value)}
          >
            {showForm ? "Close Form" : "Add Lesson"}
          </button>
        </div>

        {showForm ? (
          <form onSubmit={handleSubmit} className="card mt-6 p-6">
            <h3 className="text-2xl font-black">Add New Lesson</h3>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label>
                Lesson Name
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
                Price
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
                Order
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
                Publishing Status
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
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="hidden">Hidden</option>
                </select>
              </label>

              <label>
                Available From
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
                Available Until
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
                Thumbnail URL
                <input
                  className="input mt-2"
                  value={form.thumbnailUrl}
                  onChange={(e) =>
                    setForm({ ...form, thumbnailUrl: e.target.value })
                  }
                />
              </label>

              <label className="md:col-span-2">
                Lesson Description
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
              {isLoading ? "Saving..." : "Save Lesson"}
            </button>
          </form>
        ) : null}

        <div className="card mt-6 overflow-hidden p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-2xl font-black">Lessons List</h3>
            <span className="badge">{lessons.length} lessons</span>
          </div>

          <div className="mt-5 overflow-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Lesson</th>
                  <th>Price</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Available From</th>
                  <th>Available Until</th>
                </tr>
              </thead>

              <tbody>
                {lessons.map((lesson) => (
                  <tr key={lesson.id}>
                    <td>
                      <b>
                        <Link href={`/admin/lessons/${lesson.id}`} className="font-black underline">
                          {lesson.title}
                        </Link>
                      </b>
                      <p className="mt-1 text-xs opacity-60">
                        {lesson.description || "No description"}
                      </p>
                    </td>
                    <td>{lesson.price} EGP</td>
                    <td>{lesson.sort_order}</td>
                    <td>
                      <span className="badge">
                        {lessonStatusLabel[lesson.status]}
                      </span>
                    </td>
                    <td>
                      {lesson.available_from
                        ? new Date(lesson.available_from).toLocaleString("en-US")
                        : "Not specified"}
                    </td>
                    <td>
                      {lesson.available_until
                        ? new Date(lesson.available_until).toLocaleString("en-US")
                        : "Not specified"}
                    </td>
                  </tr>
                ))}

                {lessons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center opacity-60">
                      No lessons yet.
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
