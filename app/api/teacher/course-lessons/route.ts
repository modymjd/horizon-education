import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireTeacher } from "@/lib/session"

type CourseRow = {
  id: number
}

type ChapterRow = {
  id: number
}

export async function POST(req: Request) {
  try {
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

    const body = await req.json()

    const courseId = Number(body.course_id)
    const chapterId = Number(body.chapter_id)
    const title = String(body.title || "").trim()
    const description = String(body.description || "").trim()
    const price = Number(body.price || 0)
    const status = String(body.status || "published")
    const sortOrder = Number(body.sort_order || 0)

    if (!courseId || Number.isNaN(courseId)) {
      return NextResponse.json(
        { message: "Invalid course ID." },
        { status: 400 }
      )
    }

    if (!chapterId || Number.isNaN(chapterId)) {
      return NextResponse.json(
        { message: "Invalid chapter ID." },
        { status: 400 }
      )
    }

    if (!title) {
      return NextResponse.json(
        { message: "Lesson title is required." },
        { status: 400 }
      )
    }

    if (price < 0) {
      return NextResponse.json(
        { message: "Price cannot be less than zero." },
        { status: 400 }
      )
    }

    const courseRows = await query<CourseRow>(
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
      return NextResponse.json(
        { message: "Course not found or does not belong to this teacher." },
        { status: 403 }
      )
    }

    const chapterRows = await query<ChapterRow>(
      `
      SELECT id
      FROM chapters
      WHERE id = ?
        AND course_id = ?
        AND deleted_at IS NULL
      LIMIT 1
      `,
      [chapterId, courseId]
    )

    if (!chapterRows[0]) {
      return NextResponse.json(
        { message: "Chapter not found in this course." },
        { status: 404 }
      )
    }

    const result = await query<any>(
      `
      INSERT INTO lessons
        (
          chapter_id,
          title,
          description,
          price,
          sort_order,
          status,
          available_from
        )
      VALUES
        (?, ?, ?, ?, ?, ?, NOW())
      `,
      [
        chapterId,
        title,
        description || null,
        price,
        sortOrder,
        status,
      ]
    )

    const lessonId =
      Array.isArray(result) && result[0]?.insertId
        ? result[0].insertId
        : (result as any).insertId

    return NextResponse.json({
      success: true,
      message: "Lesson added successfully.",
      lesson_id: lessonId,
    })
  } catch (error) {
    console.error("CREATE_TEACHER_LESSON_ERROR", error)

    return NextResponse.json(
      { message: "Unable to add the lesson." },
      { status: 500 }
    )
  }
}
