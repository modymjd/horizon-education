import { NextResponse } from "next/server"
import { query, pool } from "@/lib/db"
import { lessonSchema } from "@/lib/validators"

type Params = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_req: Request, context: Params) {
  try {
    const { id } = await context.params
    const chapterId = Number(id)

    const chapterRows = await query<any>(
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

    const chapter = chapterRows[0]

    if (!chapter) {
      return NextResponse.json(
        { message: "الشابتر غير موجود" },
        { status: 404 }
      )
    }

    const lessons = await query<any>(
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

    return NextResponse.json({
      chapter,
      lessons,
    })
  } catch (error) {
    console.error("GET_CHAPTER_LESSONS_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء تحميل الحصص" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request, context: Params) {
  const { id } = await context.params
  const chapterId = Number(id)
  const body = lessonSchema.parse(await req.json())

  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [chapterRows] = await conn.execute<any[]>(
      "SELECT id FROM chapters WHERE id = ? AND deleted_at IS NULL LIMIT 1",
      [chapterId]
    )

    if (!chapterRows[0]) {
      await conn.rollback()

      return NextResponse.json(
        { message: "الشابتر غير موجود" },
        { status: 404 }
      )
    }

    await conn.execute(
      `
      INSERT INTO lessons
        (
          chapter_id,
          title,
          description,
          thumbnail_url,
          price,
          sort_order,
          status,
          available_from,
          available_until
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        chapterId,
        body.title,
        body.description || null,
        body.thumbnailUrl || null,
        body.price,
        body.sortOrder || 0,
        body.status,
        body.availableFrom || null,
        body.availableUntil || null,
      ]
    )

    await conn.execute(
      `
      INSERT INTO audit_logs
        (user_id, action, entity_type, entity_id, new_values)
      VALUES
        (1, 'create_lesson', 'lesson', LAST_INSERT_ID(), JSON_OBJECT('title', ?, 'chapter_id', ?, 'price', ?))
      `,
      [body.title, chapterId, body.price]
    )

    await conn.commit()

    return NextResponse.json({
      message: "تم إنشاء الحصة بنجاح",
    })
  } catch (error) {
    await conn.rollback()

    console.error("CREATE_LESSON_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء إنشاء الحصة" },
      { status: 500 }
    )
  } finally {
    conn.release()
  }
}