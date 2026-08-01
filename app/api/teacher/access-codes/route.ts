import { NextResponse } from "next/server"
import { z } from "zod"
import { nanoid } from "nanoid"
import { createHash } from "crypto"
import { query, pool } from "@/lib/db"

const createCodesSchema = z.object({
  lesson_id: z.number().int().positive(),
  count: z.number().int().min(1).max(500),
  expires_at: z.string().optional(),
  single_use: z.boolean().default(true),
})

type TeacherRow = {
  id: number
  user_id: number
}

type LessonRow = {
  id: number
}

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex")
}

export async function POST(req: Request) {
  try {
    const body = createCodesSchema.parse(await req.json())

    const teacherRows = await query<TeacherRow>(
      `
      SELECT
        t.id,
        t.user_id
      FROM teachers t
      JOIN users u ON u.id = t.user_id
      WHERE u.email = 'teacher@horizon.test'
      LIMIT 1
      `
    )

    const teacher = teacherRows[0]

    if (!teacher) {
      return NextResponse.json(
        { message: "لم يتم العثور على حساب المدرس" },
        { status: 404 }
      )
    }

    const lessonRows = await query<LessonRow>(
      `
      SELECT l.id
      FROM lessons l
      JOIN chapters ch ON ch.id = l.chapter_id
      JOIN courses c ON c.id = ch.course_id
      WHERE l.id = ?
        AND c.teacher_id = ?
      LIMIT 1
      `,
      [body.lesson_id, teacher.id]
    )

    if (!lessonRows.length) {
      return NextResponse.json(
        { message: "الحصة غير موجودة أو غير تابعة لهذا المدرس" },
        { status: 403 }
      )
    }

    const batchId = nanoid()
    const rawCodes: string[] = []

    const conn = await pool.getConnection()

    try {
      await conn.beginTransaction()

      for (let i = 0; i < body.count; i++) {
        const rawCode = `HZ-${nanoid(10).toUpperCase()}`
        rawCodes.push(rawCode)

        await conn.execute(
          `
          INSERT INTO access_codes
            (
              lesson_id,
              code_hash,
              code_prefix,
              expires_at,
              assigned_student_id,
              single_use,
              created_by_teacher_id,
              batch_id
            )
          VALUES (?, ?, ?, ?, NULL, ?, ?, ?)
          `,
          [
            body.lesson_id,
            hashCode(rawCode),
            rawCode.slice(0, 5),
            body.expires_at || null,
            body.single_use ? 1 : 0,
            teacher.user_id,
            batchId,
          ]
        )
      }

      await conn.commit()

      return NextResponse.json({
        success: true,
        batch_id: batchId,
        codes: rawCodes,
        count: rawCodes.length,
      })
    } catch (error) {
      await conn.rollback()
      throw error
    } finally {
      conn.release()
    }
  } catch (error) {
    console.error("CREATE_ACCESS_CODES_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء إنشاء أكواد الوصول" },
      { status: 500 }
    )
  }
}
