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
  score: number | null
  passed: number | null
}

type ExamQuestionRow = {
  id: number
  exam_id: number
  question_text: string
  points: number
}

type ExamChoiceRow = {
  id: number
  question_id: number
  choice_text: string
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

export default async function StudentExamPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "student" || !user.student_id) {
    redirect("/403")
  }

  const { id } = await params

  const [exam, questions, choices] = await Promise.all([
    getExam(id, user.student_id),
    getQuestions(id),
    getChoices(id),
  ])

  if (!exam) {
    notFound()
  }

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

            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-900">
              <b>Important notice:</b>
              <p className="mt-2">
                Once you start the exam, leaving the page, refreshing it, or closing the tab will close the exam and record the attempt with a zero score. You will not be able to take it again.
              </p>
            </div>

            {exam.attempted ? (
              <div className="alert-success mt-6">
                You have already taken this exam — score: {exam.score}% —{" "}
                {exam.passed ? "Passed" : "Not passed"}
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
