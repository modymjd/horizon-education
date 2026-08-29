import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { query, pool } from "@/lib/db"
import { courseSchema } from "@/lib/validators"
import { requireAdmin } from "@/lib/session"

function makeSlug(title: string) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^\u0600-\u06FFa-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "") +
    "-" +
    Date.now()
  )
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

export async function GET() {
  try {
    const { response } = await requireAdmin()

    if (response) {
      return response
    }

    const courses = await query<any>(
      `
      SELECT
        c.id,
        c.slug,
        c.title,
        c.short_description,
        c.description,
        c.cover_image_url,
        c.status,
        c.stage_id,
        c.grade_id,
        c.starts_at,
        c.ends_at,
        c.access_duration_days,
        c.created_at,
        t.id AS teacher_id,
        u.full_name AS teacher_name,
        (
          SELECT GROUP_CONCAT(et2.name ORDER BY et2.id SEPARATOR ', ')
          FROM course_education_types cet2
          JOIN education_types et2 ON et2.id = cet2.education_type_id
          WHERE cet2.course_id = c.id
        ) AS education_type_name,
        es.name AS stage_name,
        g.name AS grade_name,
        COUNT(DISTINCT ch.id) AS chapters_count,
        COUNT(DISTINCT l.id) AS lessons_count
      FROM courses c
      JOIN teachers t ON t.id = c.teacher_id
      JOIN users u ON u.id = t.user_id
      LEFT JOIN educational_stages es ON es.id = c.stage_id
      LEFT JOIN grades g ON g.id = c.grade_id
      LEFT JOIN chapters ch ON ch.course_id = c.id AND ch.deleted_at IS NULL
      LEFT JOIN lessons l ON l.chapter_id = ch.id AND l.deleted_at IS NULL
      WHERE c.deleted_at IS NULL
      GROUP BY
        c.id,
        c.slug,
        c.title,
        c.short_description,
        c.description,
        c.cover_image_url,
        c.status,
        c.stage_id,
        c.grade_id,
        c.starts_at,
        c.ends_at,
        c.access_duration_days,
        c.created_at,
        t.id,
        u.full_name,
        es.name,
        g.name
      ORDER BY c.id DESC
      `
    )

    const teachers = await query<any>(
      `
      SELECT
        t.id,
        u.full_name
      FROM teachers t
      JOIN users u ON u.id = t.user_id
      WHERE u.deleted_at IS NULL
        AND u.status = 'active'
      ORDER BY u.full_name ASC
      `
    )

    const educationTypes = await query<any>(
      `
      SELECT id, name, slug
      FROM education_types
      ORDER BY id ASC
      `
    )

    const stages = await query<any>(
      `
      SELECT id, name
      FROM educational_stages
      ORDER BY sort_order ASC, id ASC
      `
    )

    const grades = await query<any>(
      `
      SELECT id, name, stage_id
      FROM grades
      ORDER BY sort_order ASC, id ASC
      `
    )

    return NextResponse.json({
      courses,
      teachers,
      educationTypes,
      stages,
      grades,
    })
  } catch (error) {
    console.error("GET_COURSES_ERROR", error)

    return NextResponse.json(
      { message: "Unable to load courses." },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const { user, response } = await requireAdmin()

  if (response || !user) {
    return response
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

  const slug = makeSlug(body.title)
  const educationTypeIds = Array.from(new Set(body.educationTypeIds || []))

  let coverImageUrl: string | null = null
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
      INSERT INTO courses
        (
          slug,
          title,
          short_description,
          description,
          cover_image_url,
          teacher_id,
          education_type_id,
          stage_id,
          grade_id,
          status,
          starts_at,
          ends_at,
          access_duration_days,
          created_by
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        slug,
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
        user.id,
      ]
    )

    const courseId = result.insertId

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
      INSERT INTO chapters
        (course_id, title, description, sort_order, status, published_at)
      VALUES
        (?, 'Chapter 1', 'Default chapter for adding lessons', 1, 'published', NOW())
      `,
      [courseId]
    )

    await conn.execute(
      `
      INSERT INTO audit_logs
        (user_id, action, entity_type, entity_id, new_values)
      VALUES
        (
          ?,
          'create_course',
          'course',
          ?,
          JSON_OBJECT(
            'title', ?,
            'teacher_id', ?,
            'education_type_ids', ?,
            'stage_id', ?,
            'grade_id', ?
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
      ]
    )

    await conn.commit()

    return NextResponse.json({
      message: "Course created successfully.",
      course_id: courseId,
      slug,
    })
  } catch (error) {
    await conn.rollback()

    console.error("CREATE_COURSE_ERROR", error)

    return NextResponse.json(
      { message: "Unable to create the course." },
      { status: 500 }
    )
  } finally {
    conn.release()
  }
}

