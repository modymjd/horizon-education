import { NextResponse } from "next/server"
import { query } from "@/lib/db"

type TeacherExamRow = {
  id: number
}

type ChoiceInput = {
  text: string
  is_correct: boolean
}

async function verifyTeacherExam(examId: number) {
  const rows = await query<TeacherExamRow>(
    `
    SELECT e.id
    FROM lesson_exams e
    JOIN lessons l ON l.id = e.lesson_id
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    JOIN teachers t ON t.id = c.teacher_id
    JOIN users u ON u.id = t.user_id
    WHERE u.email = 'teacher@horizon.test'
      AND e.id = ?
    LIMIT 1
    `,
    [examId]
  )

  return rows[0]
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const examId = Number(body.exam_id)
    const questionText = String(body.question_text || "")
    const points = Number(body.points || 1)
    const choices = Array.isArray(body.choices)
      ? (body.choices as ChoiceInput[])
      : []

    if (!examId || Number.isNaN(examId)) {
      return NextResponse.json(
        { message: "رقم الامتحان غير صحيح" },
        { status: 400 }
      )
    }

    if (!questionText.trim()) {
      return NextResponse.json(
        { message: "نص السؤال مطلوب" },
        { status: 400 }
      )
    }

    if (points <= 0) {
      return NextResponse.json(
        { message: "درجة السؤال يجب أن تكون أكبر من صفر" },
        { status: 400 }
      )
    }

    const validChoices = choices.filter((choice) => choice.text?.trim())

    if (validChoices.length < 2) {
      return NextResponse.json(
        { message: "يجب إضافة اختيارين على الأقل" },
        { status: 400 }
      )
    }

    const correctChoices = validChoices.filter((choice) => choice.is_correct)

    if (correctChoices.length !== 1) {
      return NextResponse.json(
        { message: "يجب تحديد إجابة صحيحة واحدة فقط" },
        { status: 400 }
      )
    }

    const exam = await verifyTeacherExam(examId)

    if (!exam) {
      return NextResponse.json(
        { message: "الامتحان غير موجود أو غير تابع لهذا المدرس" },
        { status: 403 }
      )
    }

    const questionRows = await query<{ id: number }>(
      `
      INSERT INTO lesson_exam_questions
        (exam_id, question_text, points, sort_order)
      VALUES (
        ?,
        ?,
        ?,
        COALESCE(
          (
            SELECT next_order
            FROM (
              SELECT MAX(sort_order) + 1 AS next_order
              FROM lesson_exam_questions
              WHERE exam_id = ?
            ) AS x
          ),
          1
        )
      )
      `,
      [examId, questionText.trim(), points, examId]
    )

    const questionId = (questionRows as any).insertId

    for (let i = 0; i < validChoices.length; i++) {
      const choice = validChoices[i]

      await query(
        `
        INSERT INTO lesson_exam_choices
          (question_id, choice_text, is_correct, sort_order)
        VALUES (?, ?, ?, ?)
        `,
        [
          questionId,
          choice.text.trim(),
          choice.is_correct ? 1 : 0,
          i + 1,
        ]
      )
    }

    return NextResponse.json({
      success: true,
      message: "تم إضافة السؤال بنجاح",
    })
  } catch (error) {
    console.error("CREATE_EXAM_QUESTION_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء إضافة السؤال" },
      { status: 500 }
    )
  }
}