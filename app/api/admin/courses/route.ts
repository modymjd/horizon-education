import { NextResponse } from "next/server"
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
        et.id AS education_type_id,
        et.name AS education_type_name,
        es.name AS stage_name,
        g.name AS grade_name,
        COUNT(DISTINCT ch.id) AS chapters_count,
        COUNT(DISTINCT l.id) AS lessons_count
      FROM courses c
      JOIN teachers t ON t.id = c.teacher_id
      JOIN users u ON u.id = t.user_id
      LEFT JOIN education_types et ON et.id = c.education_type_id
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
        et.id,
        et.name,
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
      SELECT id, name, education_type_id
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

  const body = courseSchema.parse(await req.json())
  const slug = makeSlug(body.title)
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
        body.coverImageUrl || null,
        body.teacherId,
        body.educationTypeId || null,
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
            'education_type_id', ?,
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
        body.educationTypeId || null,
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
