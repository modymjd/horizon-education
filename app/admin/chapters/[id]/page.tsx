import { redirect } from "next/navigation"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import ChapterLessonsClient from "./chapter-lessons-client"

async function getChapter(chapterId: number) {
  const rows = await query<any>(
    `
    SELECT
      ch.id,
      ch.title,
      ch.description,
      ch.status,
      ch.sort_order,
      ch.published_at,
      c.id AS course_id,
      c.title AS course_title,
      u.full_name AS teacher_name
    FROM chapters ch
    JOIN courses c ON c.id = ch.course_id
    JOIN teachers t ON t.id = c.teacher_id
    JOIN users u ON u.id = t.user_id
    WHERE ch.id = ?
      AND ch.deleted_at IS NULL
    LIMIT 1
    `,
    [chapterId]
  )

  return rows[0]
}

async function getLessons(chapterId: number) {
  return query<any>(
    `
    SELECT
      id,
      chapter_id,
      title,
      description,
      thumbnail_url,
      price,
      sort_order,
      status,
      available_from,
      available_until
    FROM lessons
    WHERE chapter_id = ?
      AND deleted_at IS NULL
    ORDER BY sort_order ASC, id ASC
    `,
    [chapterId]
  )
}

export default async function ChapterLessonsPage({
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
  const chapterId = Number(id)

  const chapter = await getChapter(chapterId)
  const lessons = chapter ? await getLessons(chapterId) : []

  return (
    <ChapterLessonsClient
      chapter={chapter || null}
      initialLessons={lessons || []}
    />
  )
}

