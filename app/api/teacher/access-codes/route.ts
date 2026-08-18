import { NextResponse } from "next/server"
import { z } from "zod"
import { nanoid } from "nanoid"
import { createHash } from "crypto"
import { query, pool } from "@/lib/db"
import { requireTeacher } from "@/lib/session"

const createCodesSchema = z.object({
  lesson_id: z.number().int().positive(),
  count: z.number().int().min(1).max(500),
  expires_at: z.string().optional(),
  single_use: z.boolean().default(true),
})

type LessonRow = {
  id: number
}

function hashCode(code: string) {
  return createHash("sha256").update(code).digest("hex")
}

export async function POST(req: Request) {
  try {
    const { user, response } = await requireTeacher()

    if (response || !user) {
      return response
    }

    if (!user.teacher_id) {
      return NextResponse.json(
        { message: "Teacher account was not found." },
        { status: 403 }
      )
    }

    const body = createCodesSchema.parse(await req.json())

    const lessonRows = await query<LessonRow>(
      `
      SELECT l.id
      FROM lessons l
      JOIN chapters ch ON ch.id = l.chapter_id
      JOIN courses c ON c.id = ch.course_id
      WHERE l.id = ?
        AND c.teacher_id = ?
        AND l.deleted_at IS NULL
      LIMIT 1
      `,
      [body.lesson_id, user.teacher_id]
    )

    if (!lessonRows.length) {
      return NextResponse.json(
        { message: "Lesson not found or does not belong to this teacher." },
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
            user.teacher_id,
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
      { message: "Unable to create access codes." },
      { status: 500 }
    )
  }
}
