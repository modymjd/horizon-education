import { NextResponse } from "next/server"
import { query } from "@/lib/db"

type TeacherLessonRow = {
  id: number
}

async function verifyTeacherLesson(lessonId: number) {
  const rows = await query<TeacherLessonRow>(
    `
    SELECT l.id
    FROM lessons l
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    JOIN teachers t ON t.id = c.teacher_id
    JOIN users u ON u.id = t.user_id
    WHERE u.email = 'teacher@horizon.test'
      AND l.id = ?
    LIMIT 1
    `,
    [lessonId]
  )

  return rows[0]
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const lessonId = Number(body.lesson_id)
    const title = String(body.title || "")
    const description = String(body.description || "")
    const passScore = Number(body.pass_score || 60)
    const isRequiredToUnlockNext = Boolean(body.is_required_to_unlock_next)

    if (!lessonId || Number.isNaN(lessonId)) {
      return NextResponse.json(
        { message: "رقم الحصة غير صحيح" },
        { status: 400 }
      )
    }

    if (!title.trim()) {
      return NextResponse.json(
        { message: "عنوان الامتحان مطلوب" },
        { status: 400 }
      )
    }

    if (passScore < 0 || passScore > 100) {
      return NextResponse.json(
        { message: "درجة النجاح يجب أن تكون بين 0 و 100" },
        { status: 400 }
      )
    }

    const lesson = await verifyTeacherLesson(lessonId)

    if (!lesson) {
      return NextResponse.json(
        { message: "الحصة غير موجودة أو غير تابعة لهذا المدرس" },
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
          sort_order
        )
      VALUES (
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
        lessonId,
      ]
    )

    return NextResponse.json({
      success: true,
      message: "تم إضافة الامتحان بنجاح",
    })
  } catch (error) {
    console.error("CREATE_EXAM_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء إضافة الامتحان" },
      { status: 500 }
    )
  }
}