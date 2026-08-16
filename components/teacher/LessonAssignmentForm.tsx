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
      setError("Enter the assignment title")
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
        setError(data.message || "Unable to add assignment")
        return
      }

      setSuccess(data.message || "Assignment added successfully")
      setTitle("")
      setDescription("")
      setDueAt("")
      setFile(null)
      router.refresh()
    } catch {
      setError("Unable to connect to the server")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card payment-form">
      <span className="eyebrow">Lesson Assignments</span>
      <h2 className="text-3xl font-black">Add Assignment</h2>
      <p className="muted mt-3">
        Add an assignment linked to this lesson, with an optional file and student instructions.
      </p>

      {error ? <div className="alert-error mt-5">{error}</div> : null}
      {success ? <div className="alert-success mt-5">{success}</div> : null}

      <label className="mt-6 block font-bold">
        Assignment Title
        <input
          className="input mt-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Example: Lesson One Assignment"
          required
        />
      </label>

      <label className="mt-4 block font-bold">
        Assignment Instructions
        <textarea
          className="input mt-2 min-h-28"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write what the student needs to do..."
        />
      </label>

      <label className="mt-4 block font-bold">
        Due Date
        <input
          className="input mt-2"
          type="datetime-local"
          value={dueAt}
          onChange={(e) => setDueAt(e.target.value)}
        />
      </label>

      <label className="mt-4 block font-bold">
        Optional Attachment
        <input
          className="input mt-2"
          type="file"
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>

      {file ? (
        <p className="muted mt-3 text-sm">
          Selected file: {file.name}
        </p>
      ) : null}

      <button className="btn btn-block mt-6 disabled:opacity-60" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add assignment"}
      </button>
    </form>
  )
}
