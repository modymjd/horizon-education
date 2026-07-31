import { NextResponse } from "next/server"
import { query, pool } from "@/lib/db"
import { lessonVideoSchema } from "@/lib/validators"

type Params = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_req: Request, context: Params) {
  try {
    const { id } = await context.params
    const lessonId = Number(id)

    const lessonRows = await query<any>(
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

    const lesson = lessonRows[0]

    if (!lesson) {
      return NextResponse.json(
        { message: "الحصة غير موجودة" },
        { status: 404 }
      )
    }

    const videos = await query<any>(
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

    return NextResponse.json({
      lesson,
      videos,
    })
  } catch (error) {
    console.error("GET_LESSON_VIDEOS_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء تحميل فيديوهات الحصة" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request, context: Params) {
  const { id } = await context.params
  const lessonId = Number(id)
  const body = lessonVideoSchema.parse(await req.json())

  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [lessonRows] = await conn.execute<any[]>(
      "SELECT id FROM lessons WHERE id = ? AND deleted_at IS NULL LIMIT 1",
      [lessonId]
    )

    if (!lessonRows[0]) {
      await conn.rollback()

      return NextResponse.json(
        { message: "الحصة غير موجودة" },
        { status: 404 }
      )
    }

    await conn.execute(
      `
      INSERT INTO lesson_videos
        (
          lesson_id,
          title,
          video_url,
          storage_path,
          duration_seconds,
          sort_order,
          available_from,
          available_until
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        lessonId,
        body.title,
        body.videoUrl || null,
        body.storagePath || null,
        body.durationSeconds || 0,
        body.sortOrder || 0,
        body.availableFrom || null,
        body.availableUntil || null,
      ]
    )

    await conn.execute(
      `
      INSERT INTO audit_logs
        (user_id, action, entity_type, entity_id, new_values)
      VALUES
        (1, 'create_lesson_video', 'lesson_video', LAST_INSERT_ID(), JSON_OBJECT('title', ?, 'lesson_id', ?))
      `,
      [body.title, lessonId]
    )

    await conn.commit()

    return NextResponse.json({
      message: "تم إضافة الفيديو بنجاح",
    })
  } catch (error) {
    await conn.rollback()

    console.error("CREATE_LESSON_VIDEO_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء إضافة الفيديو" },
      { status: 500 }
    )
  } finally {
    conn.release()
  }
}