import { NextResponse } from "next/server"
import { query, pool } from "@/lib/db"
import { lessonAttachmentSchema } from "@/lib/validators"

type Params = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_req: Request, context: Params) {
  try {
    const { id } = await context.params
    const lessonId = Number(id)

    const attachments = await query<any>(
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

    return NextResponse.json({
      attachments,
    })
  } catch (error) {
    console.error("GET_LESSON_ATTACHMENTS_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء تحميل المرفقات" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request, context: Params) {
  const { id } = await context.params
  const lessonId = Number(id)
  const body = lessonAttachmentSchema.parse(await req.json())

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
      INSERT INTO attachments
        (
          lesson_id,
          title,
          description,
          file_url,
          file_type,
          file_size_kb,
          allow_download,
          available_until
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        lessonId,
        body.title,
        body.description || null,
        body.fileUrl,
        body.fileType,
        body.fileSizeKb || null,
        body.allowDownload || false,
        body.availableUntil || null,
      ]
    )

    await conn.execute(
      `
      INSERT INTO audit_logs
        (user_id, action, entity_type, entity_id, new_values)
      VALUES
        (1, 'create_lesson_attachment', 'attachment', LAST_INSERT_ID(), JSON_OBJECT('title', ?, 'lesson_id', ?))
      `,
      [body.title, lessonId]
    )

    await conn.commit()

    return NextResponse.json({
      message: "تم إضافة المرفق بنجاح",
    })
  } catch (error) {
    await conn.rollback()

    console.error("CREATE_LESSON_ATTACHMENT_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء إضافة المرفق" },
      { status: 500 }
    )
  } finally {
    conn.release()
  }
}