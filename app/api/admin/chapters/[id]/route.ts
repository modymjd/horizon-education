import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { requireAdmin } from "@/lib/session"

type Params = {
  params: Promise<{
    id: string
  }>
}

function normalizeStatus(value: unknown) {
  if (value === "draft" || value === "published" || value === "hidden") {
    return value
  }

  return null
}

export async function PATCH(req: Request, context: Params) {
  const { user, response } = await requireAdmin()

  if (response || !user) {
    return response
  }

  const { id } = await context.params
  const chapterId = Number(id)

  if (!chapterId || Number.isNaN(chapterId)) {
    return NextResponse.json(
      { message: "Invalid chapter ID." },
      { status: 400 }
    )
  }

  const body = await req.json()
  const sortOrder = Number(body.sort_order ?? body.sortOrder)
  const status = normalizeStatus(body.status)

  if (Number.isNaN(sortOrder) || sortOrder < 0) {
    return NextResponse.json(
      { message: "Chapter order must be zero or greater." },
      { status: 400 }
    )
  }

  if (!status) {
    return NextResponse.json(
      { message: "Invalid chapter status." },
      { status: 400 }
    )
  }

  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [result] = await conn.execute<any>(
      `
      UPDATE chapters
      SET
        sort_order = ?,
        status = ?,
        published_at = CASE
          WHEN ? = 'published' AND published_at IS NULL THEN NOW()
          WHEN ? <> 'published' THEN NULL
          ELSE published_at
        END
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [sortOrder, status, status, status, chapterId]
    )

    if (result.affectedRows === 0) {
      await conn.rollback()

      return NextResponse.json(
        { message: "Chapter not found." },
        { status: 404 }
      )
    }

    await conn.execute(
      `
      INSERT INTO audit_logs
        (user_id, action, entity_type, entity_id, new_values)
      VALUES
        (?, 'update_chapter', 'chapter', ?, JSON_OBJECT('sort_order', ?, 'status', ?))
      `,
      [user.id, chapterId, sortOrder, status]
    )

    await conn.commit()

    return NextResponse.json({
      message: "Chapter updated successfully.",
    })
  } catch (error) {
    await conn.rollback()

    console.error("UPDATE_CHAPTER_ERROR", error)

    return NextResponse.json(
      { message: "Unable to update the chapter." },
      { status: 500 }
    )
  } finally {
    conn.release()
  }
}

export async function DELETE(_req: Request, context: Params) {
  const { user, response } = await requireAdmin()

  if (response || !user) {
    return response
  }

  const { id } = await context.params
  const chapterId = Number(id)

  if (!chapterId || Number.isNaN(chapterId)) {
    return NextResponse.json(
      { message: "Invalid chapter ID." },
      { status: 400 }
    )
  }

  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [chapterRows] = await conn.execute<any[]>(
      "SELECT id, course_id FROM chapters WHERE id = ? AND deleted_at IS NULL LIMIT 1",
      [chapterId]
    )

    const chapter = chapterRows[0]

    if (!chapter) {
      await conn.rollback()

      return NextResponse.json(
        { message: "Chapter not found." },
        { status: 404 }
      )
    }

    await conn.execute(
      "UPDATE lessons SET deleted_at = NOW() WHERE chapter_id = ? AND deleted_at IS NULL",
      [chapterId]
    )

    await conn.execute(
      "UPDATE chapters SET deleted_at = NOW() WHERE id = ? AND deleted_at IS NULL",
      [chapterId]
    )

    await conn.execute(
      `
      INSERT INTO audit_logs
        (user_id, action, entity_type, entity_id, new_values)
      VALUES
        (?, 'delete_chapter', 'chapter', ?, JSON_OBJECT('course_id', ?))
      `,
      [user.id, chapterId, chapter.course_id]
    )

    await conn.commit()

    return NextResponse.json({
      message: "Chapter deleted successfully.",
      course_id: chapter.course_id,
    })
  } catch (error) {
    await conn.rollback()

    console.error("DELETE_CHAPTER_ERROR", error)

    return NextResponse.json(
      { message: "Unable to delete the chapter." },
      { status: 500 }
    )
  } finally {
    conn.release()
  }
}
