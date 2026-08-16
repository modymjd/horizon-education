"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  courseId: number
}

export function AdminChapterCreateForm({ courseId }: Props) {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [coverImageUrl, setCoverImageUrl] = useState("")
  const [sortOrder, setSortOrder] = useState("1")
  const [status, setStatus] = useState("published")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")

    if (!title.trim()) {
      setError("Enter the chapter name")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch(`/api/admin/courses/${courseId}/chapters`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          coverImageUrl,
          sortOrder: Number(sortOrder || 1),
          status,
          publishedAt: undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Unable to create chapter")
        return
      }

      setSuccess(data.message || "Chapter created successfully")
      setTitle("")
      setDescription("")
      setCoverImageUrl("")
      setSortOrder("1")
      setStatus("published")
      router.refresh()
    } catch {
      setError("Unable to connect to the server")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card payment-form">
      <span className="eyebrow">Add Chapter</span>
      <h2 className="text-3xl font-black">New Chapter</h2>
      <p className="muted mt-3">
        Add a chapter inside this course, then add lessons under it.
      </p>

      {error ? <div className="alert-error mt-5">{error}</div> : null}
      {success ? <div className="alert-success mt-5">{success}</div> : null}

      <label className="mt-6 block font-bold">
        Chapter Name
        <input
          className="input mt-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Example: Unit One"
          required
        />
      </label>

      <label className="mt-4 block font-bold">
        Chapter Description
        <textarea
          className="input mt-2 min-h-24"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description"
        />
      </label>

      <div className="form-grid mt-4">
        <label className="font-bold">
          Chapter Order
          <input
            className="input mt-2"
            type="number"
            min="0"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          />
        </label>

        <label className="font-bold">
          Status
          <select
            className="input mt-2"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="hidden">Hidden</option>
          </select>
        </label>
      </div>

      <label className="mt-4 block font-bold">
        Cover Image URL
        <input
          className="input mt-2"
          value={coverImageUrl}
          onChange={(e) => setCoverImageUrl(e.target.value)}
          placeholder="Optional"
        />
      </label>

      <button className="btn btn-block mt-6 disabled:opacity-60" disabled={isLoading}>
        {isLoading ? "Creating chapter..." : "Create chapter"}
      </button>
    </form>
  )
}
