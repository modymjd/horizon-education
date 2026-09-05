"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"

type Props = {
  lessonId: number
  initialVideoUrl: string | null
}

const CHUNK_SIZE = 4 * 1024 * 1024
const CONCURRENT_UPLOADS = 2
const MAX_RETRIES = 5

export function LessonVideoForm({ lessonId, initialVideoUrl }: Props) {
  const router = useRouter()
  const stopUploadRef = useRef(false)

  const [title, setTitle] = useState("Lesson Video")
  const [file, setFile] = useState<File | null>(null)
  const [currentVideoUrl, setCurrentVideoUrl] = useState(initialVideoUrl)
  const [isLoading, setIsLoading] = useState(false)
  const [isWaitingForConnection, setIsWaitingForConnection] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedChunks, setUploadedChunks] = useState(0)
  const [totalChunks, setTotalChunks] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const uploadStorageKey = useMemo(() => {
    if (!file) return ""

    return [
      "lesson-video-upload",
      lessonId,
      file.name,
      file.size,
      file.lastModified,
    ].join(":")
  }, [file, lessonId])

  useEffect(() => {
    function handleOnline() {
      setIsWaitingForConnection(false)
    }

    function handleOffline() {
      setIsWaitingForConnection(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  function formatFileSize(size: number) {
    if (size >= 1024 * 1024 * 1024) {
      return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`
    }

    if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`
    }

    return `${(size / 1024).toFixed(2)} KB`
  }

  function wait(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async function waitForConnection() {
    while (!navigator.onLine) {
      setIsWaitingForConnection(true)
      await wait(1500)
    }

    setIsWaitingForConnection(false)
  }

  async function getUploadedChunks(uploadId: string) {
    const params = new URLSearchParams({
      lesson_id: String(lessonId),
      upload_id: uploadId,
    })

    const res = await fetch(`/api/teacher/lesson-video-chunks?${params.toString()}`, {
      method: "GET",
      cache: "no-store",
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new Error(data.message || "Unable to get upload status.")
    }

    return Array.isArray(data.uploadedChunks)
      ? data.uploadedChunks.map(Number)
      : []
  }

  function uploadChunk(args: {
    uploadId: string
    index: number
    chunksCount: number
    chunk: Blob
  }) {
    const { uploadId, index, chunksCount, chunk } = args

    return new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      const formData = new FormData()

      formData.append("action", "chunk")
      formData.append("lesson_id", String(lessonId))
      formData.append("title", title || "New Video")
      formData.append("upload_id", uploadId)
      formData.append("file_name", file?.name || "")
      formData.append("chunk_index", String(index))
      formData.append("total_chunks", String(chunksCount))
      formData.append("chunk", chunk)

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
        reject(new Error("Connection lost while uploading."))
      }

      xhr.ontimeout = () => {
        reject(new Error("Upload timed out."))
      }

      xhr.send(formData)
    })
  }

  async function uploadChunkWithRetry(args: {
    uploadId: string
    index: number
    chunksCount: number
  }) {
    const { uploadId, index, chunksCount } = args

    if (!file) {
      throw new Error("Choose a video file first")
    }

    const start = index * CHUNK_SIZE
    const end = Math.min(file.size, start + CHUNK_SIZE)
    const chunk = file.slice(start, end)

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      if (stopUploadRef.current) {
        throw new Error("Upload stopped.")
      }

      await waitForConnection()

      try {
        return await uploadChunk({
          uploadId,
          index,
          chunksCount,
          chunk,
        })
      } catch (error) {
        if (attempt === MAX_RETRIES) {
          throw error
        }

        setIsWaitingForConnection(true)
        await wait(1500 * attempt)
        setIsWaitingForConnection(false)
      }
    }
  }

  async function completeUpload(uploadId: string, chunksCount: number) {
    if (!file) {
      throw new Error("Choose a video file first")
    }

    const formData = new FormData()
    formData.append("action", "complete")
    formData.append("lesson_id", String(lessonId))
    formData.append("title", title || "New Video")
    formData.append("upload_id", uploadId)
    formData.append("file_name", file.name)
    formData.append("total_chunks", String(chunksCount))

    const res = await fetch("/api/teacher/lesson-video-chunks", {
      method: "POST",
      body: formData,
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      throw new Error(data.message || "Unable to finalize video upload.")
    }

    return data
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setSuccess("")
    setUploadProgress(0)
    setUploadedChunks(0)
    setTotalChunks(0)
    stopUploadRef.current = false

    if (!file) {
      setError("Choose a video file first")
      return
    }

    setIsLoading(true)

    try {
      const chunksCount = Math.ceil(file.size / CHUNK_SIZE)
      const savedUploadId = uploadStorageKey
        ? window.localStorage.getItem(uploadStorageKey)
        : null

      const uploadId =
        savedUploadId || `${lessonId}-${Date.now()}-${Math.random().toString(36).slice(2)}`

      if (uploadStorageKey) {
        window.localStorage.setItem(uploadStorageKey, uploadId)
      }

      setTotalChunks(chunksCount)

      const uploadedSet = new Set<number>(await getUploadedChunks(uploadId))
      setUploadedChunks(uploadedSet.size)
      setUploadProgress(Math.round((uploadedSet.size / chunksCount) * 100))

      const missingChunks = Array.from(
        { length: chunksCount },
        (_, index) => index
      ).filter((index) => !uploadedSet.has(index))

      let pointer = 0

      async function worker() {
        while (pointer < missingChunks.length) {
          const index = missingChunks[pointer]
          pointer += 1

          await uploadChunkWithRetry({
            uploadId,
            index,
            chunksCount,
          })

          uploadedSet.add(index)
          setUploadedChunks(uploadedSet.size)
          setUploadProgress(Math.round((uploadedSet.size / chunksCount) * 100))
        }
      }

      await Promise.all(
        Array.from(
          { length: Math.min(CONCURRENT_UPLOADS, missingChunks.length) },
          () => worker()
        )
      )

      setSuccess("Finalizing video... Please do not close this page.")

      const finalResponse = await completeUpload(uploadId, chunksCount)

      setUploadProgress(100)
      setSuccess(finalResponse?.message || "Video uploaded successfully")
      setCurrentVideoUrl(finalResponse?.video_url || null)
      setFile(null)

      if (uploadStorageKey) {
        window.localStorage.removeItem(uploadStorageKey)
      }

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to upload video")
    } finally {
      setIsLoading(false)
      setIsWaitingForConnection(false)
    }
  }

  function handleStopUpload() {
    stopUploadRef.current = true
    setIsLoading(false)
    setIsWaitingForConnection(false)
    setError("Upload paused. Choose the same file and click Upload video again to resume.")
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
          <video controls controlsList="nodownload" className="w-full rounded-2xl" src={currentVideoUrl}>
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
            {isWaitingForConnection
              ? "Waiting for connection..."
              : `Uploading video... ${uploadProgress}%`}
            {totalChunks ? ` (${uploadedChunks}/${totalChunks} parts)` : ""}
          </p>

          <button
            className="btn btn-outline mt-4"
            type="button"
            onClick={handleStopUpload}
          >
            Pause upload
          </button>
        </div>
      ) : null}

      <button className="btn btn-block mt-6 disabled:opacity-60" disabled={isLoading}>
        {isLoading ? `Uploading... ${uploadProgress}%` : "Upload video"}
      </button>
    </form>
  )
}
