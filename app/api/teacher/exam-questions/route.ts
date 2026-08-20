import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { query } from "@/lib/db"
import { requireTeacher } from "@/lib/session"
import { IMAGE_RULES, validateFileAgainstRules } from "@/lib/file-security"

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

    const formData = await req.formData()

    const examId = Number(formData.get("exam_id"))
    const questionType = String(formData.get("question_type") || "text")
    const questionTextRaw = formData.get("question_text")
    const questionText = questionTextRaw ? String(questionTextRaw).trim() : ""
    const points = Number(formData.get("points") || 1)
    const image = formData.get("image")

    const choicesRaw = formData.get("choices")
    let choices: ChoiceInput[] = []

    try {
      choices = choicesRaw ? JSON.parse(String(choicesRaw)) : []
    } catch {
      choices = []
    }

    if (!examId || Number.isNaN(examId)) {
      return NextResponse.json(
        { message: "Invalid exam ID." },
        { status: 400 }
      )
    }

    if (questionType !== "text" && questionType !== "image") {
      return NextResponse.json(
        { message: "Invalid question type." },
        { status: 400 }
      )
    }

    if (questionType === "text" && !questionText) {
      return NextResponse.json(
        { message: "Question text is required." },
        { status: 400 }
      )
    }

    if (questionType === "image" && !(image instanceof File)) {
      return NextResponse.json(
        { message: "Please choose a question image." },
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

    let questionImageUrl: string | null = null

    if (questionType === "image" && image instanceof File) {
      const maxSizeMb = 5
      const maxSizeBytes = maxSizeMb * 1024 * 1024

      if (image.size > maxSizeBytes) {
        return NextResponse.json(
          { message: `Image size must not exceed ${maxSizeMb}MB.` },
          { status: 400 }
        )
      }

      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const validation = validateFileAgainstRules(buffer, image.name, IMAGE_RULES)

      if (!validation.ok) {
        return NextResponse.json(
          { message: validation.reason },
          { status: 400 }
        )
      }

      const safeName = `question-${examId}-${Date.now()}${validation.extension}`

      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "exam-questions"
      )
      await mkdir(uploadDir, { recursive: true })

      const filePath = path.join(uploadDir, safeName)
      await writeFile(filePath, buffer)

      questionImageUrl = `/uploads/exam-questions/${safeName}`
    }

    const questionRows = await query(
      `
      INSERT INTO lesson_exam_questions
        (exam_id, question_text, question_image_url, points, sort_order)
      VALUES (
        ?,
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
      [
        examId,
        questionType === "text" ? questionText : null,
        questionImageUrl,
        points,
        examId,
      ]
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
