import { NextResponse } from "next/server"
import { z } from "zod"
import { query, pool } from "@/lib/db"
import { requireStudent } from "@/lib/session"

const requestSchema = z.object({
  course_id: z.number().int().positive(),
})

type CourseRow = {
  id: number
}

type ExistingRequestRow = {
  id: number
  status: "pending" | "accepted" | "rejected"
}

export async function POST(req: Request) {
  try {
    const { user, response } = await requireStudent()

    if (response || !user) {
      return response
    }

    if (!user.student_id) {
      return NextResponse.json(
        { message: "Student account was not found." },
        { status: 403 }
      )
    }

    const body = requestSchema.parse(await req.json())

    const courseRows = await query<CourseRow>(
      `
      SELECT c.id
      FROM courses c
      JOIN students s ON s.id = ?
      WHERE c.id = ?
        AND c.status = 'published'
        AND c.deleted_at IS NULL
        AND (
          c.education_type_id IS NULL
          OR s.education_type_id IS NULL
          OR c.education_type_id = s.education_type_id
        )
      LIMIT 1
      `,
      [user.student_id, body.course_id]
    )

    if (!courseRows[0]) {
      return NextResponse.json(
        { message: "This course is not available for your current education profile." },
        { status: 403 }
      )
    }

    const existingRows = await query<ExistingRequestRow>(
      `
      SELECT id, status
      FROM student_course_requests
      WHERE student_id = ?
        AND course_id = ?
      LIMIT 1
      `,
      [user.student_id, body.course_id]
    )

    const existing = existingRows[0]

    if (existing) {
      if (existing.status === "rejected") {
        await pool.execute(
          `
          UPDATE student_course_requests
          SET status = 'pending',
              teacher_notes = NULL,
              requested_at = NOW(),
              reviewed_at = NULL,
              reviewed_by_teacher_id = NULL
          WHERE id = ?
          `,
          [existing.id]
        )

        return NextResponse.json({
          success: true,
          status: "pending",
          message: "Join request was sent again.",
        })
      }

      return NextResponse.json({
        success: true,
        status: existing.status,
        message: "Join request already exists.",
      })
    }

    await pool.execute(
      `
      INSERT INTO student_course_requests
        (student_id, course_id, status)
      VALUES
        (?, ?, 'pending')
      `,
      [user.student_id, body.course_id]
    )

    return NextResponse.json({
      success: true,
      status: "pending",
      message: "Join request sent successfully.",
    })
  } catch (error) {
    console.error("CREATE_COURSE_REQUEST_ERROR", error)

    return NextResponse.json(
      { message: "Unable to send the join request." },
      { status: 500 }
    )
  }
}
