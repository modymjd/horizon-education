"use client"

import Link from "next/link"
import { useState } from "react"

type Lesson = {
  id: number
  title: string
  description: string | null
  thumbnail_url: string | null
  price: string
  sort_order: number
  status: "draft" | "published" | "hidden"
  available_from: string | null
  available_until: string | null
  chapter_id: number
  chapter_title: string
  course_id: number
  course_title: string
  teacher_name: string
}

type Video = {
  id: number
  lesson_id: number
  title: string
  video_url: string | null
  storage_path: string | null
  duration_seconds: number
  sort_order: number
  available_from: string | null
  available_until: string | null
}

type Attachment = {
  id: number
  lesson_id: number
  title: string
  description: string | null
  file_url: string
  file_type: "pdf" | "word" | "image" | "video" | "other"
  file_size_kb: number | null
  allow_download: 0 | 1 | boolean
  available_until: string | null
}

type VideoFormState = {
  title: string
  videoUrl: string
  storagePath: string
  durationSeconds: string
  sortOrder: string
  availableFrom: string
  availableUntil: string
  file: File | null
}

type AttachmentFormState = {
  title: string
  description: string
  fileUrl: string
  fileType: "pdf" | "word" | "image" | "video" | "other"
  fileSizeKb: string
  allowDownload: boolean
  availableUntil: string
}

const emptyVideoForm: VideoFormState = {
  title: "",
  videoUrl: "",
  storagePath: "",
  durationSeconds: "0",
  sortOrder: "0",
  availableFrom: "",
  availableUntil: "",
  file: null,
}

const emptyAttachmentForm: AttachmentFormState = {
  title: "",
  description: "",
  fileUrl: "",
  fileType: "pdf",
  fileSizeKb: "0",
  allowDownload: false,
  availableUntil: "",
}

const lessonStatusLabel = {
  draft: "Draft",
  published: "Published",
  hidden: "Hidden",
}

const fileTypeLabel = {
  pdf: "PDF",
  word: "Word",
  image: "Image",
  video: "Video",
  other: "Other",
}

function formatDate(value: string | null) {
  if (!value) return "Not specified"
  return new Date(value).toLocaleString("en-US")
}

function formatDuration(seconds: number) {
  const total = Number(seconds || 0)
  const minutes = Math.floor(total / 60)
  const remain = total % 60

  if (minutes === 0) return `${remain} sec`
  return `${minutes} min ${remain} sec`
}

export default function LessonDetailsClient({
  lesson,
  initialVideos,
  initialAttachments,
}: {
  lesson: Lesson | null
  initialVideos: Video[]
  initialAttachments: Attachment[]
}) {
  const [videos, setVideos] = useState<Video[]>(initialVideos)
  const [attachments, setAttachments] = useState<Attachment[]>(
    initialAttachments
  )

  const [videoForm, setVideoForm] = useState<VideoFormState>(emptyVideoForm)
  const [attachmentForm, setAttachmentForm] =
    useState<AttachmentFormState>(emptyAttachmentForm)

  const [showVideoForm, setShowVideoForm] = useState(false)
  const [showAttachmentForm, setShowAttachmentForm] = useState(false)

  const [videoLoading, setVideoLoading] = useState(false)
  const [attachmentLoading, setAttachmentLoading] = useState(false)

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  if (!lesson) {
    return (
      <main className="grid min-h-screen place-items-center p-5">
        <div className="card max-w-md p-8 text-center">
          <span className="badge">404</span>
          <h1 className="mt-4 text-3xl font-black">Lesson not found</h1>
          <p className="mt-3 opacity-70">
            We could not find the details for this lesson.
          </p>
          <Link
            href="/admin/courses"
            className="btn btn-primary mt-6 inline-block"
          >
            Back to Courses
          </Link>
        </div>
      </main>
    )
  }

  const lessonId = lesson.id

  async function reloadVideos() {
    const res = await fetch(`/api/admin/lessons/${lessonId}/videos`, {
      cache: "no-store",
    })

    const data = await res.json()
    setVideos(data.videos || [])
  }

  async function reloadAttachments() {
    const res = await fetch(`/api/admin/lessons/${lessonId}/attachments`, {
      cache: "no-store",
    })

    const data = await res.json()
    setAttachments(data.attachments || [])
  }

  async function handleVideoSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setMessage("")
    setVideoLoading(true)

    try {
      let uploadedStoragePath = videoForm.storagePath
      let uploadedVideoUrl = videoForm.videoUrl

      if (videoForm.file) {
        const uploadFormData = new FormData()
        uploadFormData.append("file", videoForm.file)

        const uploadRes = await fetch("/api/admin/uploads/videos", {
          method: "POST",
          body: uploadFormData,
        })

        const uploadData = await uploadRes.json()

        if (!uploadRes.ok) {
          setError(uploadData.message || "Unable to upload the video.")
          return
        }

        uploadedStoragePath = uploadData.storagePath
        uploadedVideoUrl = uploadData.fileUrl
      }

      if (!uploadedStoragePath && !uploadedVideoUrl) {
        setError("Please upload a video file or enter a video URL.")
        return
      }

      const res = await fetch(`/api/admin/lessons/${lessonId}/videos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: videoForm.title,
          videoUrl: uploadedVideoUrl,
          storagePath: uploadedStoragePath,
          durationSeconds: videoForm.durationSeconds,
          sortOrder: videoForm.sortOrder,
          availableFrom: videoForm.availableFrom || undefined,
          availableUntil: videoForm.availableUntil || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Unable to add the video.")
        return
      }

      setMessage(data.message || "Video added successfully.")
      setVideoForm(emptyVideoForm)
      setShowVideoForm(false)
      await reloadVideos()
    } catch {
      setError("Unable to connect to the server.")
    } finally {
      setVideoLoading(false)
    }
  }

  async function handleAttachmentSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    setError("")
    setMessage("")
    setAttachmentLoading(true)

    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}/attachments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: attachmentForm.title,
          description: attachmentForm.description,
          fileUrl: attachmentForm.fileUrl,
          fileType: attachmentForm.fileType,
          fileSizeKb: attachmentForm.fileSizeKb,
          allowDownload: attachmentForm.allowDownload,
          availableUntil: attachmentForm.availableUntil || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || "Unable to add the attachment.")
        return
      }

      setMessage(data.message || "Attachment added successfully.")
      setAttachmentForm(emptyAttachmentForm)
      setShowAttachmentForm(false)
      await reloadAttachments()
    } catch {
      setError("Unable to connect to the server.")
    } finally {
      setAttachmentLoading(false)
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
          <Link
            className="rounded-xl px-3 py-3 hover:bg-white/10"
            href="/admin"
          >
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
        </nav>
      </aside>

      <section className="flex-1 p-5 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="badge">Admin Dashboard / Lessons / Lesson Details</span>
            <h1 className="mt-3 text-4xl font-black">{lesson.title}</h1>
            <p className="mt-2 opacity-70">
              Course: {lesson.course_title} — Chapter: {lesson.chapter_title} —
              Teacher: {lesson.teacher_name}
            </p>
          </div>

          <Link
            href={`/admin/chapters/${lesson.chapter_id}`}
            className="btn btn-soft"
          >
            Back to Chapter
          </Link>
        </div>

        <div className="mt-8 grid-auto">
          <div className="card p-5">
            <p className="text-sm opacity-60">Price</p>
            <b className="mt-2 block text-xl">{lesson.price} EGP</b>
          </div>

          <div className="card p-5">
            <p className="text-sm opacity-60">Status</p>
            <b className="mt-2 block text-xl">
              {lessonStatusLabel[lesson.status]}
            </b>
          </div>

          <div className="card p-5">
            <p className="text-sm opacity-60">Available From</p>
            <b className="mt-2 block text-xl">
              {formatDate(lesson.available_from)}
            </b>
          </div>

          <div className="card p-5">
            <p className="text-sm opacity-60">Available Until</p>
            <b className="mt-2 block text-xl">
              {formatDate(lesson.available_until)}
            </b>
          </div>
        </div>

        {lesson.description ? (
          <div className="card mt-6 p-5">
            <h2 className="text-2xl font-black">Lesson Description</h2>
            <p className="mt-3 leading-8 opacity-80">{lesson.description}</p>
          </div>
        ) : null}

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

        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl font-black">Lesson Videos</h2>

            <button
              className="btn btn-primary"
              type="button"
              onClick={() => setShowVideoForm((value) => !value)}
            >
              {showVideoForm ? "Close Form" : "Add Video"}
            </button>
          </div>

          {showVideoForm ? (
            <form onSubmit={handleVideoSubmit} className="card mt-6 p-6">
              <h3 className="text-2xl font-black">Add New Video</h3>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="md:col-span-2">
                  Upload Video File
                  <input
                    className="input mt-2"
                    type="file"
                    accept="video/*"
                    onChange={(e) =>
                      setVideoForm({
                        ...videoForm,
                        file: e.target.files?.[0] || null,
                      })
                    }
                  />
                  <p className="mt-1 text-xs opacity-60">
                    You can upload MP4 or any supported video format. Current limit: 500MB.
                  </p>
                </label>

                <label>
                  Video Name
                  <input
                    className="input mt-2"
                    value={videoForm.title}
                    onChange={(e) =>
                      setVideoForm({
                        ...videoForm,
                        title: e.target.value,
                      })
                    }
                    required
                    dir="ltr"
                  />
                </label>

                <label>
                  Video Duration in Seconds
                  <input
                    className="input mt-2"
                    type="number"
                    min="0"
                    value={videoForm.durationSeconds}
                    onChange={(e) =>
                      setVideoForm({
                        ...videoForm,
                        durationSeconds: e.target.value,
                      })
                    }
                    dir="ltr"
                  />
                </label>

                <label>
                  Order
                  <input
                    className="input mt-2"
                    type="number"
                    min="0"
                    value={videoForm.sortOrder}
                    onChange={(e) =>
                      setVideoForm({
                        ...videoForm,
                        sortOrder: e.target.value,
                      })
                    }
                    dir="ltr"
                  />
                </label>

                <label>
                  Optional Video URL
                  <input
                    className="input mt-2"
                    value={videoForm.videoUrl}
                    onChange={(e) =>
                      setVideoForm({
                        ...videoForm,
                        videoUrl: e.target.value,
                      })
                    }
                    placeholder="Optional: https://..."
                    dir="ltr"
                  />
                </label>

                <label>
                  Optional Storage Path
                  <input
                    className="input mt-2"
                    value={videoForm.storagePath}
                    onChange={(e) =>
                      setVideoForm({
                        ...videoForm,
                        storagePath: e.target.value,
                      })
                    }
                    placeholder="Filled automatically after upload"
                    dir="ltr"
                  />
                </label>

                <label>
                  Available From
                  <input
                    className="input mt-2"
                    type="datetime-local"
                    value={videoForm.availableFrom}
                    onChange={(e) =>
                      setVideoForm({
                        ...videoForm,
                        availableFrom: e.target.value,
                      })
                    }
                    dir="ltr"
                  />
                </label>

                <label>
                  Available Until
                  <input
                    className="input mt-2"
                    type="datetime-local"
                    value={videoForm.availableUntil}
                    onChange={(e) =>
                      setVideoForm({
                        ...videoForm,
                        availableUntil: e.target.value,
                      })
                    }
                    dir="ltr"
                  />
                </label>
              </div>

              <button
                className="btn btn-primary mt-6 disabled:opacity-60"
                disabled={videoLoading}
                type="submit"
              >
                {videoLoading ? "Uploading and saving video..." : "Save Video"}
              </button>
            </form>
          ) : null}

          <div className="card mt-6 overflow-hidden p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-2xl font-black">Video List</h3>
              <span className="badge">{videos.length} videos</span>
            </div>

            <div className="mt-5 overflow-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Video</th>
                    <th>Duration</th>
                    <th>Order</th>
                    <th>Available From</th>
                    <th>Available Until</th>
                  </tr>
                </thead>

                <tbody>
                  {videos.map((video) => (
                    <tr key={video.id}>
                      <td>
                        <b>{video.title}</b>
                        <p className="mt-1 text-xs opacity-60">
                          {video.video_url || video.storage_path || "No link"}
                        </p>
                      </td>
                      <td>{formatDuration(video.duration_seconds)}</td>
                      <td>{video.sort_order}</td>
                      <td>{formatDate(video.available_from)}</td>
                      <td>{formatDate(video.available_until)}</td>
                    </tr>
                  ))}

                  {videos.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center opacity-60">
                        No videos yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-3xl font-black">Lesson Attachments</h2>

            <button
              className="btn btn-primary"
              type="button"
              onClick={() => setShowAttachmentForm((value) => !value)}
            >
              {showAttachmentForm ? "Close Form" : "Add Attachment"}
            </button>
          </div>

          {showAttachmentForm ? (
            <form onSubmit={handleAttachmentSubmit} className="card mt-6 p-6">
              <h3 className="text-2xl font-black">Add New Attachment</h3>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label>
                  File Name
                  <input
                    className="input mt-2"
                    value={attachmentForm.title}
                    onChange={(e) =>
                      setAttachmentForm({
                        ...attachmentForm,
                        title: e.target.value,
                      })
                    }
                    required
                    dir="ltr"
                  />
                </label>

                <label>
                  File URL
                  <input
                    className="input mt-2"
                    value={attachmentForm.fileUrl}
                    onChange={(e) =>
                      setAttachmentForm({
                        ...attachmentForm,
                        fileUrl: e.target.value,
                      })
                    }
                    placeholder="https://..."
                    required
                    dir="ltr"
                  />
                </label>

                <label>
                  File Type
                  <select
                    className="input mt-2"
                    value={attachmentForm.fileType}
                    onChange={(e) =>
                      setAttachmentForm({
                        ...attachmentForm,
                        fileType: e.target
                          .value as AttachmentFormState["fileType"],
                      })
                    }
                    dir="ltr"
                  >
                    <option value="pdf">PDF</option>
                    <option value="word">Word</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="other">Other</option>
                  </select>
                </label>

                <label>
                  File Size KB
                  <input
                    className="input mt-2"
                    type="number"
                    min="0"
                    value={attachmentForm.fileSizeKb}
                    onChange={(e) =>
                      setAttachmentForm({
                        ...attachmentForm,
                        fileSizeKb: e.target.value,
                      })
                    }
                    dir="ltr"
                  />
                </label>

                <label>
                  Available Until
                  <input
                    className="input mt-2"
                    type="datetime-local"
                    value={attachmentForm.availableUntil}
                    onChange={(e) =>
                      setAttachmentForm({
                        ...attachmentForm,
                        availableUntil: e.target.value,
                      })
                    }
                    dir="ltr"
                  />
                </label>

                <label className="flex items-center gap-3 pt-8">
                  <input
                    type="checkbox"
                    checked={attachmentForm.allowDownload}
                    onChange={(e) =>
                      setAttachmentForm({
                        ...attachmentForm,
                        allowDownload: e.target.checked,
                      })
                    }
                  />
                  Allow Download
                </label>

                <label className="md:col-span-2">
                  Short Description
                  <textarea
                    className="input mt-2 min-h-24"
                    value={attachmentForm.description}
                    onChange={(e) =>
                      setAttachmentForm({
                        ...attachmentForm,
                        description: e.target.value,
                      })
                    }
                    dir="ltr"
                  />
                </label>
              </div>

              <button
                className="btn btn-primary mt-6 disabled:opacity-60"
                disabled={attachmentLoading}
                type="submit"
              >
                {attachmentLoading ? "Saving..." : "Save Attachment"}
              </button>
            </form>
          ) : null}

          <div className="card mt-6 overflow-hidden p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-2xl font-black">Attachment List</h3>
              <span className="badge">{attachments.length} attachments</span>
            </div>

            <div className="mt-5 overflow-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>File</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>Download</th>
                    <th>Available Until</th>
                  </tr>
                </thead>

                <tbody>
                  {attachments.map((attachment) => (
                    <tr key={attachment.id}>
                      <td>
                        <b>{attachment.title}</b>
                        <p className="mt-1 text-xs opacity-60">
                          {attachment.description || attachment.file_url}
                        </p>
                      </td>
                      <td>{fileTypeLabel[attachment.file_type]}</td>
                      <td>
                        {attachment.file_size_kb
                          ? `${attachment.file_size_kb} KB`
                          : "Not specified"}
                      </td>
                      <td>
                        {attachment.allow_download ? "Allowed" : "View only"}
                      </td>
                      <td>{formatDate(attachment.available_until)}</td>
                    </tr>
                  ))}

                  {attachments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center opacity-60">
                        No attachments yet.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}
