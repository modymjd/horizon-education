import { NextResponse } from "next/server"
import { pool } from "@/lib/db"
import { courseSchema } from "@/lib/validators"
import { requireAdmin } from "@/lib/session"

type Params = {
  params: Promise<{
    id: string
  }>
}

export async function PATCH(req: Request, context: Params) {
  const { user, response } = await requireAdmin()

  if (response || !user) {
    return response
  }

  const { id } = await context.params
  const courseId = Number(id)

  if (!courseId || Number.isNaN(courseId)) {
    return NextResponse.json(
      { message: "Invalid course ID." },
      { status: 400 }
    )
  }

  const body = courseSchema.parse(await req.json())
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [result] = await conn.execute<any>(
      `
      UPDATE courses
      SET
        title = ?,
        short_description = ?,
        description = ?,
        cover_image_url = ?,
        teacher_id = ?,
        education_type_id = ?,
        stage_id = ?,
        grade_id = ?,
        status = ?,
        starts_at = ?,
        ends_at = ?,
        access_duration_days = ?
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [
        body.title,
        body.shortDescription || null,
        body.description || null,
        body.coverImageUrl || null,
        body.teacherId,
        body.educationTypeId || null,
        body.stageId || null,
        body.gradeId || null,
        body.status,
        body.startsAt || null,
        body.endsAt || null,
        body.accessDurationDays || 30,
        courseId,
      ]
    )

    if (result.affectedRows === 0) {
      await conn.rollback()

      return NextResponse.json(
        { message: "Course not found." },
        { status: 404 }
      )
    }

    await conn.execute(
      `
      INSERT INTO audit_logs
        (user_id, action, entity_type, entity_id, new_values)
      VALUES
        (
          ?,
          'update_course',
          'course',
          ?,
          JSON_OBJECT(
            'title', ?,
            'teacher_id', ?,
            'education_type_id', ?,
            'stage_id', ?,
            'grade_id', ?,
            'status', ?
          )
        )
      `,
      [
        user.id,
        courseId,
        body.title,
        body.teacherId,
        body.educationTypeId || null,
        body.stageId || null,
        body.gradeId || null,
        body.status,
      ]
    )

    await conn.commit()

    return NextResponse.json({
      message: "Course updated successfully.",
    })
  } catch (error) {
    await conn.rollback()

    console.error("UPDATE_COURSE_ERROR", error)

    return NextResponse.json(
      { message: "Unable to update the course." },
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
  const courseId = Number(id)

  if (!courseId || Number.isNaN(courseId)) {
    return NextResponse.json(
      { message: "Invalid course ID." },
      { status: 400 }
    )
  }

  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [result] = await conn.execute<any>(
      `
      UPDATE courses
      SET deleted_at = NOW()
      WHERE id = ?
        AND deleted_at IS NULL
      `,
      [courseId]
    )

    if (result.affectedRows === 0) {
      await conn.rollback()

      return NextResponse.json(
        { message: "Course not found." },
        { status: 404 }
      )
    }

    await conn.execute(
      `
      INSERT INTO audit_logs
        (user_id, action, entity_type, entity_id, new_values)
      VALUES
        (?, 'delete_course', 'course', ?, JSON_OBJECT('deleted', true))
      `,
      [user.id, courseId]
    )

    await conn.commit()

    return NextResponse.json({
      message: "Course deleted successfully.",
    })
  } catch (error) {
    await conn.rollback()

    console.error("DELETE_COURSE_ERROR", error)

    return NextResponse.json(
      { message: "Unable to delete the course." },
      { status: 500 }
    )
  } finally {
    conn.release()
  }
}
