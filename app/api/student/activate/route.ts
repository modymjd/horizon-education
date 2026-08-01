import { NextResponse } from "next/server"
import { z } from "zod"
import { createHash } from "crypto"
import { query, pool } from "@/lib/db"

const activateSchema = z.object({
  code: z.string().min(5).max(80),
})

type StudentRow = {
  id: number
  user_id: number
  status: string
}

type AccessCodeRow = {
  id: number
  lesson_id: number
  status: string
  expires_at: string | null
  assigned_student_id: number | null
  single_use: number
}

function hashCode(code: string) {
  return createHash("sha256")
    .update(code.trim().toUpperCase())
    .digest("hex")
}

export async function POST(req: Request) {
  try {
    const body = activateSchema.parse(await req.json())
    const codeHash = hashCode(body.code)

    const studentRows = await query<StudentRow>(
      `
      SELECT
        s.id,
        s.user_id,
        u.status
      FROM students s
      JOIN users u ON u.id = s.user_id
      WHERE u.email = 'student@horizon.test'
      LIMIT 1
      `
    )

    const student = studentRows[0]

    if (!student || student.status !== "active") {
      return NextResponse.json(
        { message: "حساب الطالب غير نشط أو غير موجود" },
        { status: 403 }
      )
    }

    const codeRows = await query<AccessCodeRow>(
      `
      SELECT
        id,
        lesson_id,
        status,
        expires_at,
        assigned_student_id,
        single_use
      FROM access_codes
      WHERE code_hash = ?
      LIMIT 1
      `,
      [codeHash]
    )

    const accessCode = codeRows[0]

    if (!accessCode) {
      return NextResponse.json(
        { message: "الكود غير صحيح" },
        { status: 400 }
      )
    }

    if (accessCode.status !== "new") {
      return NextResponse.json(
        { message: "الكود مستخدم أو غير متاح" },
        { status: 400 }
      )
    }

    if (accessCode.expires_at && new Date(accessCode.expires_at) < new Date()) {
      return NextResponse.json(
        { message: "انتهت صلاحية الكود" },
        { status: 400 }
      )
    }

    if (
      accessCode.assigned_student_id &&
      accessCode.assigned_student_id !== student.id
    ) {
      return NextResponse.json(
        { message: "هذا الكود مخصص لطالب آخر" },
        { status: 403 }
      )
    }

    const conn = await pool.getConnection()

    try {
      await conn.beginTransaction()

      await conn.execute(
        `
        INSERT IGNORE INTO student_lesson_access
          (student_id, lesson_id, access_code_id)
        VALUES (?, ?, ?)
        `,
        [student.id, accessCode.lesson_id, accessCode.id]
      )

      await conn.execute(
        `
        UPDATE access_codes
        SET
          status = 'used',
          used_by_student_id = ?,
          used_at = NOW()
        WHERE id = ?
        `,
        [student.id, accessCode.id]
      )

      await conn.commit()

      return NextResponse.json({
        success: true,
        message: "تم تفعيل الحصة بنجاح",
        lesson_id: accessCode.lesson_id,
      })
    } catch (error) {
      await conn.rollback()
      throw error
    } finally {
      conn.release()
    }
  } catch (error) {
    console.error("ACTIVATE_CODE_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء تفعيل الكود" },
      { status: 500 }
    )
  }
}
