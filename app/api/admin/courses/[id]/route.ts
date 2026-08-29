import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { pool } from "@/lib/db"
import { courseSchema } from "@/lib/validators"
import { requireAdmin } from "@/lib/session"

type Params = {
  params: Promise<{
    id: string
  }>
}

async function saveCoverImage(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("The cover image must be an image file.")
  }

  const maxSizeMb = 10
  const maxSizeBytes = maxSizeMb * 1024 * 1024

  if (file.size > maxSizeBytes) {
    throw new Error(`Cover image size must not exceed ${maxSizeMb}MB.`)
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const ext = path.extname(file.name) || ".jpg"
  const safeName = `course-${Date.now()}${ext}`

  const uploadDir = path.join(process.cwd(), "public", "uploads", "courses")
  await mkdir(uploadDir, { recursive: true })

  const filePath = path.join(uploadDir, safeName)
  await writeFile(filePath, buffer)

  return `/uploads/courses/${safeName}`
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

  const formData = await req.formData()

  let educationTypeIdsRaw: number[] = []
  try {
    educationTypeIdsRaw = JSON.parse(String(formData.get("educationTypeIds") || "[]"))
  } catch {
    educationTypeIdsRaw = []
  }

  const body = courseSchema.parse({
    title: formData.get("title"),
    shortDescription: formData.get("shortDescription") || undefined,
    description: formData.get("description") || undefined,
    teacherId: formData.get("teacherId"),
    educationTypeIds: educationTypeIdsRaw,
    stageId: formData.get("stageId") || undefined,
    gradeId: formData.get("gradeId") || undefined,
    status: formData.get("status"),
    accessDurationDays: formData.get("accessDurationDays") || undefined,
  })

  const educationTypeIds = Array.from(new Set(body.educationTypeIds || []))

  const existingCoverImageUrl = String(formData.get("existingCoverImageUrl") || "") || null
  let coverImageUrl = existingCoverImageUrl
  const coverImageField = formData.get("coverImage")

  if (coverImageField instanceof File && coverImageField.size > 0) {
    try {
      coverImageUrl = await saveCoverImage(coverImageField)
    } catch (uploadError: any) {
      return NextResponse.json(
        { message: uploadError.message || "Unable to upload the cover image." },
        { status: 400 }
      )
    }
  }

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
        coverImageUrl,
        body.teacherId,
        educationTypeIds[0] || null,
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
      `DELETE FROM course_education_types WHERE course_id = ?`,
      [courseId]
    )

    if (educationTypeIds.length > 0) {
      const values = educationTypeIds.map(() => "(?, ?)").join(", ")
      const params = educationTypeIds.flatMap((typeId) => [courseId, typeId])

      await conn.execute(
        `INSERT INTO course_education_types (course_id, education_type_id) VALUES ${values}`,
        params
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
            'education_type_ids', ?,
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
        JSON.stringify(educationTypeIds),
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

