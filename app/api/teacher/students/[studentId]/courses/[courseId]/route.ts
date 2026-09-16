import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { requireTeacher } from "@/lib/session"

type Params = {
  params: Promise<{
    studentId: string
    courseId: string
  }>
}

export async function DELETE(_req: Request, context: Params) {
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

  const { studentId: studentIdParam, courseId: courseIdParam } = await context.params
  const studentId = Number(studentIdParam)
  const courseId = Number(courseIdParam)

  if (!studentId || Number.isNaN(studentId) || !courseId || Number.isNaN(courseId)) {
    return NextResponse.json(
      { message: "Invalid student or course ID." },
      { status: 400 }
    )
  }

  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [courseRows] = await conn.execute<any[]>(
      `
      SELECT id
      FROM courses
      WHERE id = ?
        AND teacher_id = ?
        AND deleted_at IS NULL
      LIMIT 1
      `,
      [courseId, user.teacher_id]
    )

    if (!courseRows[0]) {
      await conn.rollback()

      return NextResponse.json(
        { message: "Course not found or you do not have permission to manage it." },
        { status: 404 }
      )
    }

    const [studentRows] = await conn.execute<any[]>(
      `
      SELECT s.id
      FROM students s
      JOIN users u ON u.id = s.user_id
      WHERE s.id = ?
        AND u.deleted_at IS NULL
      LIMIT 1
      `,
      [studentId]
    )

    if (!studentRows[0]) {
      await conn.rollback()

      return NextResponse.json(
        { message: "Student not found." },
        { status: 404 }
      )
    }

    await conn.execute(
      `
      DELETE sla
      FROM student_lesson_access sla
      JOIN lessons l ON l.id = sla.lesson_id
      JOIN chapters ch ON ch.id = l.chapter_id
      WHERE sla.student_id = ?
        AND ch.course_id = ?
      `,
      [studentId, courseId]
    )

    await conn.execute(
      `
      DELETE FROM student_course_requests
      WHERE student_id = ?
        AND course_id = ?
      `,
      [studentId, courseId]
    )

    await conn.execute(
      `
      INSERT INTO audit_logs
        (user_id, action, entity_type, entity_id, new_values)
      VALUES
        (?, 'remove_student_from_course', 'student_course', ?, JSON_OBJECT('student_id', ?, 'course_id', ?))
      `,
      [user.id, studentId, studentId, courseId]
    )

    await conn.commit()

    return NextResponse.json({
      message: "Student removed from course successfully.",
    })
  } catch (error) {
    await conn.rollback()

    console.error("REMOVE_STUDENT_FROM_COURSE_ERROR", error)

    return NextResponse.json(
      { message: "Unable to remove the student from this course." },
      { status: 500 }
    )
  } finally {
    conn.release()
  }
}
