import { NextResponse } from "next/server"
import { query, pool } from "@/lib/db"
import { courseSchema } from "@/lib/validators"

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
        c.starts_at,
        c.ends_at,
        c.access_duration_days,
        c.created_at,
        t.id AS teacher_id,
        u.full_name AS teacher_name,
        et.id AS education_type_id,
        et.name AS education_type_name,
        COUNT(DISTINCT ch.id) AS chapters_count,
        COUNT(DISTINCT l.id) AS lessons_count
      FROM courses c
      JOIN teachers t ON t.id = c.teacher_id
      JOIN users u ON u.id = t.user_id
      LEFT JOIN education_types et ON et.id = c.education_type_id
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
        c.starts_at,
        c.ends_at,
        c.access_duration_days,
        c.created_at,
        t.id,
        u.full_name,
        et.id,
        et.name
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

    return NextResponse.json({
      courses,
      teachers,
      educationTypes,
    })
  } catch (error) {
    console.error("GET_COURSES_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء تحميل الكورسات" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const body = courseSchema.parse(await req.json())

  const slug = makeSlug(body.title)

  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    await conn.execute(
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
          status,
          starts_at,
          ends_at,
          access_duration_days,
          created_by
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
      `,
      [
        slug,
        body.title,
        body.shortDescription || null,
        body.description || null,
        body.coverImageUrl || null,
        body.teacherId,
        body.educationTypeId || null,
        body.status,
        body.startsAt || null,
        body.endsAt || null,
        body.accessDurationDays || 30,
      ]
    )

    await conn.execute(
      `
      INSERT INTO audit_logs
        (user_id, action, entity_type, entity_id, new_values)
      VALUES
        (1, 'create_course', 'course', LAST_INSERT_ID(), JSON_OBJECT('title', ?, 'teacher_id', ?))
      `,
      [body.title, body.teacherId]
    )

    await conn.commit()

    return NextResponse.json({
      message: "تم إنشاء الكورس بنجاح",
    })
  } catch (error: any) {
    await conn.rollback()

    console.error("CREATE_COURSE_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء إنشاء الكورس" },
      { status: 500 }
    )
  } finally {
    conn.release()
  }
}