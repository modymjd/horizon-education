import { NextResponse } from "next/server"
import { pool, query } from "@/lib/db"

type StudentRow = {
  id: number
}

type ExamRow = {
  id: number
  pass_score: number
}

type QuestionRow = {
  id: number
  points: number
}

type ChoiceRow = {
  id: number
  question_id: number
  is_correct: number
}

type ExistingAttemptRow = {
  id: number
}

type AnswerInput = {
  question_id: number
  choice_id: number
}

async function getStudent() {
  const rows = await query<StudentRow>(
    `
    SELECT s.id
    FROM students s
    JOIN users u ON u.id = s.user_id
    WHERE u.email = 'student@horizon.test'
    LIMIT 1
    `
  )

  return rows[0]
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const examId = Number(body.exam_id)
    const answers = Array.isArray(body.answers)
      ? (body.answers as AnswerInput[])
      : []
    const autoClosed = Boolean(body.auto_closed)

    if (!examId || Number.isNaN(examId)) {
      return NextResponse.json(
        { message: "رقم الامتحان غير صحيح" },
        { status: 400 }
      )
    }

    const student = await getStudent()

    if (!student) {
      return NextResponse.json(
        { message: "حساب الطالب غير موجود" },
        { status: 403 }
      )
    }

    const existingAttempts = await query<ExistingAttemptRow>(
      `
      SELECT id
      FROM lesson_exam_attempts
      WHERE exam_id = ?
        AND student_id = ?
      LIMIT 1
      `,
      [examId, student.id]
    )

    if (existingAttempts.length > 0) {
      return NextResponse.json(
        { message: "لا يمكنك دخول هذا الامتحان أكثر من مرة" },
        { status: 400 }
      )
    }

    const examRows = await query<ExamRow>(
      `
      SELECT id, pass_score
      FROM lesson_exams
      WHERE id = ?
      LIMIT 1
      `,
      [examId]
    )

    const exam = examRows[0]

    if (!exam) {
      return NextResponse.json(
        { message: "الامتحان غير موجود" },
        { status: 404 }
      )
    }

    const questions = await query<QuestionRow>(
      `
      SELECT id, points
      FROM lesson_exam_questions
      WHERE exam_id = ?
      ORDER BY sort_order ASC, id ASC
      `,
      [examId]
    )

    if (questions.length === 0) {
      return NextResponse.json(
        { message: "لا توجد أسئلة في هذا الامتحان" },
        { status: 400 }
      )
    }

    const choices = await query<ChoiceRow>(
      `
      SELECT c.id, c.question_id, c.is_correct
      FROM lesson_exam_choices c
      JOIN lesson_exam_questions q ON q.id = c.question_id
      WHERE q.exam_id = ?
      `,
      [examId]
    )

    const totalPoints = questions.reduce(
      (sum, question) => sum + Number(question.points || 0),
      0
    )

    let earnedPoints = 0

    const answerMap = new Map<number, number>()

    if (!autoClosed) {
      for (const answer of answers) {
        answerMap.set(Number(answer.question_id), Number(answer.choice_id))
      }
    }

    const gradedAnswers = questions.map((question) => {
      const selectedChoiceId = answerMap.get(question.id)
      const selectedChoice = choices.find(
        (choice) =>
          choice.id === selectedChoiceId && choice.question_id === question.id
      )

      const isCorrect = selectedChoice?.is_correct ? 1 : 0
      const pointsAwarded = isCorrect ? Number(question.points || 0) : 0

      earnedPoints += pointsAwarded

      return {
        question_id: question.id,
        choice_id: selectedChoiceId || 0,
        is_correct: isCorrect,
        points_awarded: pointsAwarded,
      }
    })

    const score = autoClosed
      ? 0
      : totalPoints > 0
        ? Math.round((earnedPoints / totalPoints) * 100)
        : 0

    const passed = score >= Number(exam.pass_score) ? 1 : 0

    const conn = await pool.getConnection()

    try {
      await conn.beginTransaction()

      const [result] = await conn.execute(
        `
        INSERT INTO lesson_exam_attempts
          (exam_id, student_id, score, passed)
        VALUES (?, ?, ?, ?)
        `,
        [examId, student.id, score, passed]
      )

      const attemptId = (result as any).insertId

      for (const answer of gradedAnswers) {
        await conn.execute(
          `
          INSERT INTO lesson_exam_answers
            (
              attempt_id,
              question_id,
              choice_id,
              is_correct,
              points_awarded
            )
          VALUES (?, ?, ?, ?, ?)
          `,
          [
            attemptId,
            answer.question_id,
            answer.choice_id,
            answer.is_correct,
            answer.points_awarded,
          ]
        )
      }

      await conn.commit()

      if (autoClosed) {
        return NextResponse.json({
          success: true,
          score: 0,
          passed: false,
          message: "تم إغلاق الامتحان بسبب الخروج من الصفحة",
        })
      }

      return NextResponse.json({
        success: true,
        score,
        passed: Boolean(passed),
        message: passed
          ? `نجحت في الامتحان بدرجة ${score}%`
          : `لم تجتز الامتحان. درجتك ${score}%`,
      })
    } catch (error) {
      await conn.rollback()
      throw error
    } finally {
      conn.release()
    }
  } catch (error) {
    console.error("SUBMIT_EXAM_ATTEMPT_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء تسليم الامتحان" },
      { status: 500 }
    )
  }
}