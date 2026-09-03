"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  lessonId: number
  initialVideoUrl: string | null
}

const CHUNK_SIZE = 8 * 1024 * 1024

export function LessonVideoForm({ lessonId, initialVideoUrl }: Props) {
  const router = useRouter()

  const [title, setTitle] = useState("Lesson Video")
  const [file, setFile] = useState<File | null>(null)
  const [currentVideoUrl, setCurrentVideoUrl] = useState(initialVideoUrl)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedChunks, setUploadedChunks] = useState(0)
  const [totalChunks, setTotalChunks] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  function formatFileSize(size: number) {
    if (size >= 1024 * 1024 * 1024) {
      return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
    }

    if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`
    }

    return `${(size / 1024).toFixed(2)} KB`
  }

  function uploadChunk(formData: FormData) {
    return new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      xhr.open("POST", "/api/teacher/lesson-video-chunks")
      xhr.timeout = 0

      xhr.onload = () => {
        let data: any = {}

        try {
          data = JSON.parse(xhr.responseText || "{}")
        } catch {
          data = {}
        }

        if (xhr.status < 200 || xhr.status >= 300) {
          reject(new Error(data.message || "Unable to upload video chunk"))
          return
        }

        resolve(data)
      }

      xhr.onerror = () => {
        reject(new Error("Unable to connect to the server"))
      }

      xhr.ontimeout = () => {
        reject(new Error("Upload timed out. Please try again with a stable connection."))
      }

      xhr.send(formData)
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")
    setUploadProgress(0)
    setUploadedChunks(0)
    setTotalChunks(0)

    if (!file) {
      setError("Choose a video file first")
      return
    }

    setIsLoading(true)

    try {
      const chunksCount = Math.ceil(file.size / CHUNK_SIZE)
      const uploadId =
        `${lessonId}-${Date.now()}-${Math.random().toString(36).slice(2)}`

      setTotalChunks(chunksCount)

      let finalResponse: any = null

      for (let index = 0; index < chunksCount; index++) {
        const start = index * CHUNK_SIZE
        const end = Math.min(file.size, start + CHUNK_SIZE)
        const chunk = file.slice(start, end)

        const formData = new FormData()
        formData.append("lesson_id", String(lessonId))
        formData.append("title", title || "New Video")
        formData.append("upload_id", uploadId)
        formData.append("file_name", file.name)
        formData.append("chunk_index", String(index))
        formData.append("total_chunks", String(chunksCount))
        formData.append("chunk", chunk)

        finalResponse = await uploadChunk(formData)

        const completedChunks = index + 1
        setUploadedChunks(completedChunks)
        setUploadProgress(Math.round((completedChunks / chunksCount) * 100))
      }

      setUploadProgress(100)
      setSuccess(finalResponse?.message || "Video uploaded successfully")
      setCurrentVideoUrl(finalResponse?.video_url || null)
      setFile(null)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload video")
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
          onChange={(e) => {
            setFile(e.target.files?.[0] || null)
            setUploadProgress(0)
            setUploadedChunks(0)
            setTotalChunks(0)
            setError("")
            setSuccess("")
          }}
          required
        />
      </label>

      {file ? (
        <p className="muted mt-3 text-sm">
          Selected file: {file.name} ({formatFileSize(file.size)})
        </p>
      ) : null}

      {isLoading ? (
        <div className="mt-5">
          <div className="h-3 overflow-hidden rounded-full bg-[var(--cream-2)]">
            <div
              className="h-full rounded-full bg-[var(--red)] transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>

          <p className="muted mt-2 text-sm">
            Uploading video... {uploadProgress}%
            {totalChunks ? ` (${uploadedChunks}/${totalChunks} parts)` : ""}
          </p>
        </div>
      ) : null}

      <button className="btn btn-block mt-6 disabled:opacity-60" disabled={isLoading}>
        {isLoading ? `Uploading... ${uploadProgress}%` : "Upload video"}
      </button>
    </form>
  )
}
