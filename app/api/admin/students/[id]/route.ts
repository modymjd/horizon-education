import { NextResponse } from "next/server"
import { z } from "zod"
import { pool } from "@/lib/db"
import { requireAdmin } from "@/lib/session"

type Params = {
  params: Promise<{
    id: string
  }>
}

const patchSchema = z.object({
  action: z.enum(["activate", "suspend"]),
})

export async function PATCH(req: Request, context: Params) {
  const { user, response } = await requireAdmin()

  if (response || !user) {
    return response
  }

  const { id } = await context.params
  const userId = Number(id)

  if (!userId || Number.isNaN(userId)) {
    return NextResponse.json(
      { message: "Invalid student ID." },
      { status: 400 }
    )
  }

  const body = patchSchema.parse(await req.json())
  const nextStatus = body.action === "activate" ? "active" : "suspended"
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [result] = await conn.execute<any>(
      `
      UPDATE users u
      JOIN roles r ON r.id = u.role_id
      SET u.status = ?
      WHERE u.id = ?
        AND r.name = 'student'
        AND u.deleted_at IS NULL
      `,
      [nextStatus, userId]
    )

    if (result.affectedRows === 0) {
      await conn.rollback()

      return NextResponse.json(
        { message: "Student not found." },
        { status: 404 }
      )
    }

    await conn.execute(
      `
      INSERT INTO audit_logs
        (user_id, action, entity_type, entity_id, new_values)
      VALUES
        (?, ?, 'student', ?, JSON_OBJECT('status', ?))
      `,
      [
        user.id,
        body.action === "activate" ? "activate_student" : "suspend_student",
        userId,
        nextStatus,
      ]
    )

    await conn.commit()

    return NextResponse.json({
      message:
        body.action === "activate"
          ? "Student activated successfully."
          : "Student suspended successfully.",
      status: nextStatus,
    })
  } catch (error) {
    await conn.rollback()

    console.error("UPDATE_STUDENT_STATUS_ERROR", error)

    return NextResponse.json(
      { message: "Unable to update the student status." },
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
  const userId = Number(id)

  if (!userId || Number.isNaN(userId)) {
    return NextResponse.json(
      { message: "Invalid student ID." },
      { status: 400 }
    )
  }

  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [studentRows] = await conn.execute<any[]>(
      `
      SELECT s.id AS student_id
      FROM users u
      JOIN roles r ON r.id = u.role_id
      JOIN students s ON s.user_id = u.id
      WHERE u.id = ?
        AND r.name = 'student'
      LIMIT 1
      `,
      [userId]
    )

    const student = studentRows[0]

    if (!student) {
      await conn.rollback()

      return NextResponse.json(
        { message: "Student not found." },
        { status: 404 }
      )
    }

    const studentId = Number(student.student_id)

    await conn.execute(
      `
      INSERT INTO audit_logs
        (user_id, action, entity_type, entity_id, new_values)
      VALUES
        (?, 'hard_delete_student', 'student', ?, JSON_OBJECT('student_id', ?, 'permanent', true))
      `,
      [user.id, userId, studentId]
    )

    await conn.execute(
      "UPDATE access_codes SET assigned_student_id = NULL WHERE assigned_student_id = ?",
      [studentId]
    )

    await conn.execute(
      "UPDATE access_codes SET used_by_student_id = NULL, used_at = NULL, status = 'new' WHERE used_by_student_id = ?",
      [studentId]
    )

    await conn.execute(
      `
      DELETE lea
      FROM lesson_exam_answers lea
      JOIN lesson_exam_attempts attempt ON attempt.id = lea.attempt_id
      WHERE attempt.student_id = ?
      `,
      [studentId]
    )

    await conn.execute(
      "DELETE FROM lesson_exam_attempts WHERE student_id = ?",
      [studentId]
    )

    await conn.execute(
      `
      DELETE sa
      FROM student_answers sa
      JOIN exam_attempts attempt ON attempt.id = sa.attempt_id
      WHERE attempt.student_id = ?
      `,
      [studentId]
    )

    await conn.execute(
      "DELETE FROM exam_attempts WHERE student_id = ?",
      [studentId]
    )

    await conn.execute(
      "DELETE FROM lesson_assignment_submissions WHERE student_id = ?",
      [studentId]
    )

    await conn.execute(
      "DELETE FROM assignment_submissions WHERE student_id = ?",
      [studentId]
    )

    await conn.execute(
      "DELETE FROM attendance WHERE student_id = ?",
      [studentId]
    )

    await conn.execute(
      "DELETE FROM student_lesson_access WHERE student_id = ?",
      [studentId]
    )

    await conn.execute(
      "DELETE FROM student_course_requests WHERE student_id = ?",
      [studentId]
    )

    await conn.execute(
      "DELETE FROM payments WHERE student_id = ?",
      [studentId]
    )

    await conn.execute(
      "DELETE FROM account_blocks WHERE user_id = ?",
      [userId]
    )

    await conn.execute(
      "DELETE FROM login_sessions WHERE user_id = ?",
      [userId]
    )

    await conn.execute(
      "DELETE FROM notifications WHERE user_id = ?",
      [userId]
    )

    await conn.execute(
      "DELETE FROM students WHERE id = ?",
      [studentId]
    )

    await conn.execute(
      "DELETE FROM users WHERE id = ?",
      [userId]
    )

    await conn.commit()

    return NextResponse.json({
      message: "Student permanently deleted successfully.",
    })
  } catch (error) {
    await conn.rollback()

    console.error("HARD_DELETE_STUDENT_ERROR", error)

    return NextResponse.json(
      { message: "Unable to permanently delete the student." },
      { status: 500 }
    )
  } finally {
    conn.release()
  }
}

