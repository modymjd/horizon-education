import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireTeacher } from "@/lib/session"

type TeacherLessonRow = {
  id: number
}

type ExamPlacement = "before_content" | "after_content"

async function verifyTeacherLesson(lessonId: number, teacherId: number) {
  const rows = await query<TeacherLessonRow>(
    `
    SELECT l.id
    FROM lessons l
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    WHERE c.teacher_id = ?
      AND l.id = ?
    LIMIT 1
    `,
    [teacherId, lessonId]
  )

  return rows[0]
}

function normalizePlacement(value: unknown): ExamPlacement {
  if (value === "before_content") {
    return "before_content"
  }

  return "after_content"
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

    const lessonId = Number(body.lesson_id)
    const title = String(body.title || "")
    const description = String(body.description || "")
    const passScore = Number(body.pass_score || 60)
    const isRequiredToUnlockNext = Boolean(body.is_required_to_unlock_next)
    const placement = normalizePlacement(body.placement)

    if (!lessonId || Number.isNaN(lessonId)) {
      return NextResponse.json(
        { message: "Invalid lesson ID." },
        { status: 400 }
      )
    }

    if (!title.trim()) {
      return NextResponse.json(
        { message: "Exam title is required." },
        { status: 400 }
      )
    }

    if (passScore < 0 || passScore > 100) {
      return NextResponse.json(
        { message: "Pass score must be between 0 and 100." },
        { status: 400 }
      )
    }

    const lesson = await verifyTeacherLesson(lessonId, user.teacher_id)

    if (!lesson) {
      return NextResponse.json(
        { message: "Lesson not found or does not belong to this teacher." },
        { status: 403 }
      )
    }

    await query(
      `
      INSERT INTO lesson_exams
        (
          lesson_id,
          title,
          description,
          pass_score,
          is_required_to_unlock_next,
          placement,
          sort_order
        )
      VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        COALESCE(
          (
            SELECT next_order
            FROM (
              SELECT MAX(sort_order) + 1 AS next_order
              FROM lesson_exams
              WHERE lesson_id = ?
                AND placement = ?
            ) AS x
          ),
          1
        )
      )
      `,
      [
        lessonId,
        title.trim(),
        description.trim() || null,
        passScore,
        isRequiredToUnlockNext ? 1 : 0,
        placement,
        lessonId,
        placement,
      ]
    )

    return NextResponse.json({
      success: true,
      message: "Exam added successfully.",
    })
  } catch (error) {
    console.error("CREATE_EXAM_ERROR", error)

    return NextResponse.json(
      { message: "Unable to add the exam." },
      { status: 500 }
    )
  }
}
