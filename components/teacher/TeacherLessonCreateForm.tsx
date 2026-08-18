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
      setError("Please select a chapter first.")
      return
    }

    if (!title.trim()) {
      setError("Please enter the lesson title.")
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
        setError(data.message || "Unable to add the lesson.")
        return
      }

      setSuccess(data.message || "Lesson added successfully.")

      if (data.lesson_id) {
        router.push(`/teacher/lessons/${data.lesson_id}`)
        router.refresh()
      }
    } catch {
      setError("Unable to connect to the server.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card payment-form">
      <span className="eyebrow">Course Lessons</span>
      <h2 className="text-3xl font-black">Add New Lesson</h2>
      <p className="muted mt-3">
        Add a lesson inside an existing chapter. After that, you can upload videos, assignments, and exams.
      </p>

      {error ? <div className="alert-error mt-5">{error}</div> : null}
      {success ? <div className="alert-success mt-5">{success}</div> : null}

      <label className="mt-6 block font-bold">
        Chapter
        <select
          className="input mt-2"
          value={chapterId}
          onChange={(e) => setChapterId(e.target.value)}
          required
          dir="ltr"
        >
          {chapters.map((chapter) => (
            <option key={chapter.id} value={chapter.id}>
              {chapter.title}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-4 block font-bold">
        Lesson Title
        <input
          className="input mt-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Example: Lesson 2"
          required
          dir="ltr"
        />
      </label>

      <label className="mt-4 block font-bold">
        Lesson Description
        <textarea
          className="input mt-2 min-h-28"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write a short lesson description..."
          dir="ltr"
        />
      </label>

      <label className="mt-4 block font-bold">
        Lesson Price
        <input
          className="input mt-2"
          type="number"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          dir="ltr"
        />
      </label>

      <label className="mt-4 block font-bold">
        Lesson Order
        <input
          className="input mt-2"
          type="number"
          min="0"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          dir="ltr"
        />
      </label>

      <label className="mt-4 block font-bold">
        Status
        <select
          className="input mt-2"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          dir="ltr"
        >
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="hidden">Hidden</option>
        </select>
      </label>

      <button className="btn btn-block mt-6 disabled:opacity-60" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Lesson"}
      </button>
    </form>
  )
}
