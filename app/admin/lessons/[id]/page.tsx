import { redirect } from "next/navigation"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import LessonDetailsClient from "./lesson-details-client"

async function getLesson(lessonId: number) {
  const rows = await query<any>(
    `
    SELECT
      l.id,
      l.title,
      l.description,
      l.thumbnail_url,
      l.price,
      l.sort_order,
      l.status,
      l.available_from,
      l.available_until,
      ch.id AS chapter_id,
      ch.title AS chapter_title,
      c.id AS course_id,
      c.title AS course_title,
      u.full_name AS teacher_name
    FROM lessons l
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    JOIN teachers t ON t.id = c.teacher_id
    JOIN users u ON u.id = t.user_id
    WHERE l.id = ?
      AND l.deleted_at IS NULL
    LIMIT 1
    `,
    [lessonId]
  )

  return rows[0]
}

async function getVideos(lessonId: number) {
  return query<any>(
    `
    SELECT
      id,
      lesson_id,
      title,
      video_url,
      storage_path,
      duration_seconds,
      sort_order,
      available_from,
      available_until
    FROM lesson_videos
    WHERE lesson_id = ?
    ORDER BY sort_order ASC, id ASC
    `,
    [lessonId]
  )
}

async function getAttachments(lessonId: number) {
  return query<any>(
    `
    SELECT
      id,
      lesson_id,
      title,
      description,
      file_url,
      file_type,
      file_size_kb,
      allow_download,
      available_until
    FROM attachments
    WHERE lesson_id = ?
    ORDER BY id DESC
    `,
    [lessonId]
  )
}

export default async function LessonDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "admin") {
    redirect("/403")
  }

  const { id } = await params
  const lessonId = Number(id)

  const [lesson, videos, attachments] = await Promise.all([
    getLesson(lessonId),
    getVideos(lessonId),
    getAttachments(lessonId),
  ])

  return (
    <LessonDetailsClient
      lesson={lesson || null}
      initialVideos={videos || []}
      initialAttachments={attachments || []}
    />
  )
}

