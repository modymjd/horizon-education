import { NextResponse } from "next/server"
import { query, pool } from "@/lib/db"
import { chapterSchema } from "@/lib/validators"

type Params = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_req: Request, context: Params) {
  try {
    const { id } = await context.params
    const courseId = Number(id)

    const courseRows = await query<any>(
      `
      SELECT
        c.id,
        c.title,
        c.short_description,
        c.description,
        c.status,
        c.starts_at,
        c.ends_at,
        c.access_duration_days,
        u.full_name AS teacher_name,
        et.name AS education_type_name
      FROM courses c
      JOIN teachers t ON t.id = c.teacher_id
      JOIN users u ON u.id = t.user_id
      LEFT JOIN education_types et ON et.id = c.education_type_id
      WHERE c.id = ?
        AND c.deleted_at IS NULL
      LIMIT 1
      `,
      [courseId]
    )

    const course = courseRows[0]

    if (!course) {
      return NextResponse.json(
        { message: "الكورس غير موجود" },
        { status: 404 }
      )
    }

    const chapters = await query<any>(
      `
      SELECT
        ch.id,
        ch.course_id,
        ch.title,
        ch.description,
        ch.cover_image_url,
        ch.sort_order,
        ch.status,
        ch.published_at,
        COUNT(l.id) AS lessons_count
      FROM chapters ch
      LEFT JOIN lessons l ON l.chapter_id = ch.id AND l.deleted_at IS NULL
      WHERE ch.course_id = ?
        AND ch.deleted_at IS NULL
      GROUP BY
        ch.id,
        ch.course_id,
        ch.title,
        ch.description,
        ch.cover_image_url,
        ch.sort_order,
        ch.status,
        ch.published_at
      ORDER BY ch.sort_order ASC, ch.id ASC
      `,
      [courseId]
    )

    return NextResponse.json({
      course,
      chapters,
    })
  } catch (error) {
    console.error("GET_COURSE_CHAPTERS_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء تحميل الشابترات" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request, context: Params) {
  const { id } = await context.params
  const courseId = Number(id)
  const body = chapterSchema.parse(await req.json())

  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [courseRows] = await conn.execute<any[]>(
      "SELECT id FROM courses WHERE id = ? AND deleted_at IS NULL LIMIT 1",
      [courseId]
    )

    if (!courseRows[0]) {
      await conn.rollback()

      return NextResponse.json(
        { message: "الكورس غير موجود" },
        { status: 404 }
      )
    }

    await conn.execute(
      `
      INSERT INTO chapters
        (
          course_id,
          title,
          description,
          cover_image_url,
          sort_order,
          status,
          published_at
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?)
      `,
      [
        courseId,
        body.title,
        body.description || null,
        body.coverImageUrl || null,
        body.sortOrder || 0,
        body.status,
        body.publishedAt || null,
      ]
    )

    await conn.execute(
      `
      INSERT INTO audit_logs
        (user_id, action, entity_type, entity_id, new_values)
      VALUES
        (1, 'create_chapter', 'chapter', LAST_INSERT_ID(), JSON_OBJECT('title', ?, 'course_id', ?))
      `,
      [body.title, courseId]
    )

    await conn.commit()

    return NextResponse.json({
      message: "تم إنشاء الشابتر بنجاح",
    })
  } catch (error) {
    await conn.rollback()

    console.error("CREATE_CHAPTER_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء إنشاء الشابتر" },
      { status: 500 }
    )
  } finally {
    conn.release()
  }
}