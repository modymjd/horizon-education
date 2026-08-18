import { NextResponse } from "next/server"
import { z } from "zod"
import { pool } from "@/lib/db"
import { requireTeacher } from "@/lib/session"

const updateRequestSchema = z.object({
  request_id: z.number().int().positive(),
  status: z.enum(["accepted", "rejected"]),
})

export async function POST(req: Request) {
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

  const body = updateRequestSchema.parse(await req.json())
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [result] = await conn.execute<any>(
      `
      UPDATE student_course_requests r
      JOIN courses c ON c.id = r.course_id
      SET
        r.status = ?,
        r.reviewed_at = NOW(),
        r.reviewed_by_teacher_id = ?
      WHERE r.id = ?
        AND c.teacher_id = ?
        AND c.deleted_at IS NULL
      `,
      [
        body.status,
        user.teacher_id,
        body.request_id,
        user.teacher_id,
      ]
    )

    if (result.affectedRows === 0) {
      await conn.rollback()

      return NextResponse.json(
        { message: "Request not found or does not belong to this teacher." },
        { status: 404 }
      )
    }

    await conn.execute(
      `
      INSERT INTO audit_logs
        (user_id, action, entity_type, entity_id, new_values)
      VALUES
        (?, 'review_course_request', 'student_course_request', ?, JSON_OBJECT('status', ?))
      `,
      [
        user.id,
        body.request_id,
        body.status,
      ]
    )

    await conn.commit()

    return NextResponse.json({
      success: true,
      message:
        body.status === "accepted"
          ? "Request accepted successfully."
          : "Request rejected successfully.",
      status: body.status,
    })
  } catch (error) {
    await conn.rollback()

    console.error("REVIEW_COURSE_REQUEST_ERROR", error)

    return NextResponse.json(
      { message: "Unable to update the request." },
      { status: 500 }
    )
  } finally {
    conn.release()
  }
}
