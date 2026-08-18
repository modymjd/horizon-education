import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { requireTeacher } from "@/lib/session"

type TeacherExamRow = {
  id: number
}

type ChoiceInput = {
  text: string
  is_correct: boolean
}

async function verifyTeacherExam(examId: number, teacherId: number) {
  const rows = await query<TeacherExamRow>(
    `
    SELECT e.id
    FROM lesson_exams e
    JOIN lessons l ON l.id = e.lesson_id
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    WHERE c.teacher_id = ?
      AND e.id = ?
    LIMIT 1
    `,
    [teacherId, examId]
  )

  return rows[0]
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

    const examId = Number(body.exam_id)
    const questionText = String(body.question_text || "")
    const points = Number(body.points || 1)
    const choices = Array.isArray(body.choices)
      ? (body.choices as ChoiceInput[])
      : []

    if (!examId || Number.isNaN(examId)) {
      return NextResponse.json(
        { message: "Invalid exam ID." },
        { status: 400 }
      )
    }

    if (!questionText.trim()) {
      return NextResponse.json(
        { message: "Question text is required." },
        { status: 400 }
      )
    }

    if (points <= 0) {
      return NextResponse.json(
        { message: "Question points must be greater than zero." },
        { status: 400 }
      )
    }

    const validChoices = choices.filter((choice) => choice.text?.trim())

    if (validChoices.length < 2) {
      return NextResponse.json(
        { message: "Please add at least two choices." },
        { status: 400 }
      )
    }

    const correctChoices = validChoices.filter((choice) => choice.is_correct)

    if (correctChoices.length !== 1) {
      return NextResponse.json(
        { message: "Please select exactly one correct answer." },
        { status: 400 }
      )
    }

    const exam = await verifyTeacherExam(examId, user.teacher_id)

    if (!exam) {
      return NextResponse.json(
        { message: "Exam not found or does not belong to this teacher." },
        { status: 403 }
      )
    }

    const questionRows = await query(
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
      message: "Question added successfully.",
    })
  } catch (error) {
    console.error("CREATE_EXAM_QUESTION_ERROR", error)

    return NextResponse.json(
      { message: "Unable to add the question." },
      { status: 500 }
    )
  }
}
