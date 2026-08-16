"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  lessonId: number
  initialVideoUrl: string | null
}

export function LessonVideoForm({ lessonId, initialVideoUrl }: Props) {
  const router = useRouter()

  const [title, setTitle] = useState("Lesson Video")
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
      setError("Choose a video file first")
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("lesson_id", String(lessonId))
      formData.append("title", title || "New Video")
      formData.append("video", file)

      const res = await fetch("/api/teacher/lessons", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Unable to upload video")
        return
      }

      setSuccess(data.message || "Video uploaded successfully")
      setCurrentVideoUrl(data.video_url || null)
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
      <span className="eyebrow">Lesson Videos</span>
      <h2 className="text-3xl font-black">Upload New Video</h2>
      <p className="muted mt-3">
        You can upload more than one video inside the same lesson. Students will see them in order.
      </p>

      {error ? <div className="alert-error mt-5">{error}</div> : null}
      {success ? <div className="alert-success mt-5">{success}</div> : null}

      {currentVideoUrl ? (
        <div className="mt-6">
          <p className="mb-2 font-bold">Latest uploaded video</p>
          <video controls className="w-full rounded-2xl" src={currentVideoUrl}>
            Your browser does not support video playback.
          </video>
        </div>
      ) : (
        <div className="mt-6 rounded-2xl bg-[var(--cream-2)] p-4 text-sm font-bold">
          No video has been uploaded for this lesson yet.
        </div>
      )}

      <label className="mt-6 block font-bold">
        Video Title
        <input
          className="input mt-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Example: Part One Explanation"
          required
        />
      </label>

      <label className="mt-4 block font-bold">
        Choose Video From Your Device
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
          Selected file: {file.name}
        </p>
      ) : null}

      <button className="btn btn-block mt-6 disabled:opacity-60" disabled={isLoading}>
        {isLoading ? "Uploading video..." : "Upload video"}
      </button>
    </form>
  )
}
