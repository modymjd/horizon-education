import { NextResponse } from "next/server"
import { pool, query } from "@/lib/db"
import { requireStudent } from "@/lib/session"

type ExamRow = {
  id: number
  pass_score: number
}

type QuestionRow = {
  id: number
  question_text: string | null
  question_image_url: string | null
  points: number
}

type ChoiceRow = {
  id: number
  question_id: number
  choice_text: string
  is_correct: number
}

type ExistingAttemptRow = {
  id: number
}

type AnswerInput = {
  question_id: number
  choice_id: number
}

export async function POST(req: Request) {
  try {
    const { user, response } = await requireStudent()

    if (response || !user) {
      return response
    }

    if (!user.student_id) {
      return NextResponse.json(
        { message: "Student account was not found." },
        { status: 403 }
      )
    }

    const body = await req.json()

    const examId = Number(body.exam_id)
    const answers = Array.isArray(body.answers)
      ? (body.answers as AnswerInput[])
      : []
    const autoClosed = Boolean(body.auto_closed)

    if (!examId || Number.isNaN(examId)) {
      return NextResponse.json(
        { message: "Invalid exam ID." },
        { status: 400 }
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
      [examId, user.student_id]
    )

    if (existingAttempts.length > 0) {
      return NextResponse.json(
        { message: "You cannot attempt this exam more than once." },
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
        { message: "Exam not found." },
        { status: 404 }
      )
    }

    const questions = await query<QuestionRow>(
      `
      SELECT
        id,
        question_text,
        question_image_url,
        points
      FROM lesson_exam_questions
      WHERE exam_id = ?
      ORDER BY sort_order ASC, id ASC
      `,
      [examId]
    )

    if (questions.length === 0) {
      return NextResponse.json(
        { message: "This exam has no questions." },
        { status: 400 }
      )
    }

    const choices = await query<ChoiceRow>(
      `
      SELECT
        c.id,
        c.question_id,
        c.choice_text,
        c.is_correct
      FROM lesson_exam_choices c
      JOIN lesson_exam_questions q ON q.id = c.question_id
      WHERE q.exam_id = ?
      ORDER BY c.sort_order ASC, c.id ASC
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
      const questionChoices = choices.filter(
        (choice) => choice.question_id === question.id
      )
      const selectedChoiceId = answerMap.get(question.id)
      const selectedChoice = questionChoices.find(
        (choice) => choice.id === selectedChoiceId
      )
      const correctChoice = questionChoices.find((choice) => choice.is_correct)

      const isCorrect = selectedChoice?.is_correct ? 1 : 0
      const pointsAwarded = isCorrect ? Number(question.points || 0) : 0

      earnedPoints += pointsAwarded

      return {
        question_id: question.id,
        question_text: question.question_text,
        question_image_url: question.question_image_url,
        points: Number(question.points || 0),
        choice_id: selectedChoiceId || 0,
        selected_choice_text: selectedChoice?.choice_text || null,
        correct_choice_id: correctChoice?.id || 0,
        correct_choice_text: correctChoice?.choice_text || null,
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
        VALUES
          (?, ?, ?, ?)
        `,
        [examId, user.student_id, score, passed]
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
          VALUES
            (?, ?, ?, ?, ?)
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
          review: [],
          message: "The exam was closed because you left the page.",
        })
      }

      return NextResponse.json({
        success: true,
        score,
        earnedPoints,
        totalPoints,
        passed: Boolean(passed),
        review: gradedAnswers,
        message: passed
          ? `You passed the exam with a score of ${score}%.`
          : `You did not pass the exam. Your score is ${score}%.`,
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
      { message: "Unable to submit the exam." },
      { status: 500 }
    )
  }
}
