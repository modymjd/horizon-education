import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { StudentExamPageForm } from "@/components/student/StudentExamPageForm"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type ExamRow = {
  id: number
  title: string
  description: string | null
  pass_score: number
  lesson_id: number
  lesson_title: string
  attempted: number
  attempt_id: number | null
  score: number | null
  passed: number | null
}

type ExamQuestionRow = {
  id: number
  exam_id: number
  question_text: string | null
  question_image_url: string | null
  points: number
}

type ExamChoiceRow = {
  id: number
  question_id: number
  choice_text: string
}

type ExistingReviewRow = {
  question_id: number
  question_text: string | null
  question_image_url: string | null
  points: number
  choice_id: number
  selected_choice_text: string | null
  correct_choice_id: number
  correct_choice_text: string | null
  is_correct: number
  points_awarded: number
}

async function getExam(id: string, studentId: number) {
  const rows = await query<ExamRow>(
    `
    SELECT
      e.id,
      e.title,
      e.description,
      e.pass_score,
      e.lesson_id,
      l.title AS lesson_title,
      CASE WHEN a.id IS NULL THEN 0 ELSE 1 END AS attempted,
      a.id AS attempt_id,
      a.score,
      a.passed
    FROM lesson_exams e
    JOIN lessons l ON l.id = e.lesson_id
    JOIN student_lesson_access sla
      ON sla.lesson_id = l.id
      AND sla.student_id = ?
    LEFT JOIN lesson_exam_attempts a
      ON a.exam_id = e.id
      AND a.student_id = sla.student_id
    WHERE e.id = ?
    LIMIT 1
    `,
    [studentId, id]
  )

  return rows[0]
}

async function getQuestions(id: string) {
  return query<ExamQuestionRow>(
    `
    SELECT
      id,
      exam_id,
      question_text,
      question_image_url,
      points
    FROM lesson_exam_questions
    WHERE exam_id = ?
    ORDER BY sort_order ASC, id ASC
    `,
    [id]
  )
}

async function getChoices(id: string) {
  return query<ExamChoiceRow>(
    `
    SELECT
      c.id,
      c.question_id,
      c.choice_text
    FROM lesson_exam_choices c
    JOIN lesson_exam_questions q ON q.id = c.question_id
    WHERE q.exam_id = ?
    ORDER BY c.sort_order ASC, c.id ASC
    `,
    [id]
  )
}

async function getExistingReview(attemptId: number) {
  return query<ExistingReviewRow>(
    `
    SELECT
      q.id AS question_id,
      q.question_text,
      q.question_image_url,
      q.points,
      a.choice_id,
      selected.choice_text AS selected_choice_text,
      correct.id AS correct_choice_id,
      correct.choice_text AS correct_choice_text,
      a.is_correct,
      a.points_awarded
    FROM lesson_exam_answers a
    JOIN lesson_exam_questions q ON q.id = a.question_id
    LEFT JOIN lesson_exam_choices selected ON selected.id = a.choice_id
    LEFT JOIN lesson_exam_choices correct
      ON correct.question_id = q.id
      AND correct.is_correct = 1
    WHERE a.attempt_id = ?
    ORDER BY q.sort_order ASC, q.id ASC
    `,
    [attemptId]
  )
}

export default async function StudentExamPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ showAnswers?: string }>
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "student" || !user.student_id) {
    redirect("/403")
  }

  const { id } = await params
  const showAnswers = searchParams ? (await searchParams).showAnswers === "1" : false

  const [exam, questions, choices] = await Promise.all([
    getExam(id, user.student_id),
    getQuestions(id),
    getChoices(id),
  ])

  if (!exam) {
    notFound()
  }

  const existingReview = exam.attempt_id
    ? await getExistingReview(exam.attempt_id)
    : []

  const earnedPoints = existingReview.reduce(
    (sum, item) => sum + Number(item.points_awarded || 0),
    0
  )

  const totalPoints = questions.reduce(
    (sum, question) => sum + Number(question.points || 0),
    0
  )

  return (
    <main>
      <SiteHeader />

      <section className="section">
        <div className="wrap">
          <div className="card p-6 md:p-10">
            <span className="eyebrow">Lesson Exam</span>
            <h1 className="h2">{exam.title}</h1>

            <p className="muted mt-4">
              Lesson: {exam.lesson_title}
            </p>

            {exam.description ? (
              <p className="muted mt-3">{exam.description}</p>
            ) : null}

            {!exam.attempted ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900">
                <b>Important notice:</b>
                <p className="mt-2">
                  Once you start the exam, leaving the page, refreshing it, or closing the tab will close the exam and record the attempt with a zero score. You will not be able to take it again.
                </p>
              </div>
            ) : null}

            {exam.attempted ? (
              <div className="mt-8 grid gap-5">
                <div className={exam.passed ? "alert-success" : "alert-error"}>
                  <b>{exam.passed ? "Passed" : "Not passed"}</b>
                  <p className="mt-2">
                    Your score: {exam.score}%{" "}
                    ({earnedPoints}/{totalPoints} points)
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href={`/student/exams/${exam.id}?showAnswers=${showAnswers ? "0" : "1"}`}
                    className="btn"
                  >
                    {showAnswers ? "Hide My Answers" : "View My Answers"}
                  </Link>
                </div>

                {showAnswers ? (
                  <>
                    <div className="rounded-2xl border border-[var(--line)] bg-[var(--cream-2)] p-4">
                      <h2 className="text-2xl font-black">My answers</h2>
                      <p className="muted mt-2">
                        Review your answers and compare them with the correct answers.
                      </p>
                    </div>

                    {existingReview.map((item, index) => (
                      <div
                        className="rounded-2xl border border-[var(--line)] bg-[var(--cream-2)] p-4"
                        key={item.question_id}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="text-xl font-black">
                            {index + 1}. {item.question_text || ""}
                          </h3>

                          <span
                            className={
                              item.is_correct
                                ? "rounded-full bg-green-100 px-3 py-1 text-sm font-black text-green-700"
                                : "rounded-full bg-red-100 px-3 py-1 text-sm font-black text-red-700"
                            }
                          >
                            {item.is_correct ? "Correct" : "Wrong"}
                          </span>
                        </div>

                        {item.question_image_url ? (
                          <div className="mt-3">
                            <img
                              src={item.question_image_url}
                              alt={`Question ${index + 1}`}
                              className="max-h-80 w-full rounded-2xl border border-[var(--line)] bg-white object-contain"
                            />
                          </div>
                        ) : null}

                        <p className="muted mt-2 text-sm">
                          Points: {item.points_awarded}/{item.points}
                        </p>

                        <div className="mt-4 grid gap-2">
                          <div
                            className={
                              item.is_correct
                                ? "rounded-xl border border-green-200 bg-green-50 p-3"
                                : "rounded-xl border border-red-200 bg-red-50 p-3"
                            }
                          >
                            <b>Your answer:</b>{" "}
                            {item.selected_choice_text || "No answer selected"}
                          </div>

                          {!item.is_correct ? (
                            <div className="rounded-xl border border-green-200 bg-green-50 p-3">
                              <b>Correct answer:</b>{" "}
                              {item.correct_choice_text || "No correct answer set"}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </>
                ) : null}
              </div>
            ) : (
              <StudentExamPageForm
                examId={exam.id}
                lessonId={exam.lesson_id}
                questions={questions}
                choices={choices}
              />
            )}

            <div className="mt-8">
              <Link href={`/student/lessons/${exam.lesson_id}`} className="btn btn-outline">
                Back to Lesson
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
