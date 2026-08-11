import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { TeacherExamQuestionForm } from "@/components/teacher/TeacherExamQuestionForm"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type ExamRow = {
  id: number
  title: string
  description: string | null
  pass_score: number
  placement: "before_content" | "after_content"
  lesson_id: number
  lesson_title: string
  course_title: string
  chapter_title: string
  questions_count: number
}

type QuestionRow = {
  id: number
  question_text: string
  points: number
  sort_order: number
}

type ChoiceRow = {
  id: number
  question_id: number
  choice_text: string
  is_correct: number
  sort_order: number
}

type Params = {
  params: Promise<{
    id: string
  }>
}

async function getTeacherExam(examId: number, teacherId: number) {
  const rows = await query<ExamRow>(
    `
    SELECT
      e.id,
      e.title,
      e.description,
      e.pass_score,
      e.placement,
      l.id AS lesson_id,
      l.title AS lesson_title,
      c.title AS course_title,
      ch.title AS chapter_title,
      COUNT(DISTINCT q.id) AS questions_count
    FROM lesson_exams e
    JOIN lessons l ON l.id = e.lesson_id
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    LEFT JOIN lesson_exam_questions q ON q.exam_id = e.id
    WHERE e.id = ?
      AND c.teacher_id = ?
    GROUP BY
      e.id,
      e.title,
      e.description,
      e.pass_score,
      e.placement,
      l.id,
      l.title,
      c.title,
      ch.title
    LIMIT 1
    `,
    [examId, teacherId]
  )

  return rows[0]
}

async function getExamQuestions(examId: number) {
  return query<QuestionRow>(
    `
    SELECT
      id,
      question_text,
      points,
      sort_order
    FROM lesson_exam_questions
    WHERE exam_id = ?
    ORDER BY sort_order ASC, id ASC
    `,
    [examId]
  )
}

async function getExamChoices(examId: number) {
  return query<ChoiceRow>(
    `
    SELECT
      ch.id,
      ch.question_id,
      ch.choice_text,
      ch.is_correct,
      ch.sort_order
    FROM lesson_exam_choices ch
    JOIN lesson_exam_questions q ON q.id = ch.question_id
    WHERE q.exam_id = ?
    ORDER BY q.sort_order ASC, ch.sort_order ASC, ch.id ASC
    `,
    [examId]
  )
}

function getPlacementLabel(placement: string) {
  if (placement === "before_content") return "قبل الحصة"
  return "بعد الحصة"
}

export default async function TeacherExamPage({ params }: Params) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher" || !user.teacher_id) {
    redirect("/403")
  }

  const { id } = await params
  const examId = Number(id)

  if (!examId || Number.isNaN(examId)) {
    notFound()
  }

  const [exam, questions, choices] = await Promise.all([
    getTeacherExam(examId, user.teacher_id),
    getExamQuestions(examId),
    getExamChoices(examId),
  ])

  if (!exam) {
    notFound()
  }

  return (
    <main>
      <SiteHeader />

      <section className="teacher-page-hero">
        <div className="wrap">
          <span className="eyebrow">لوحة المدرس</span>
          <h1 className="h1">إدارة أسئلة الامتحان</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            أضف أسئلة واختيارات لامتحان {exam.title}.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={`/teacher/lessons/${exam.lesson_id}`} className="btn">
              رجوع للحصة
            </Link>

            <Link href={`/student/exams/${exam.id}`} className="btn btn-outline">
              معاينة الامتحان
            </Link>
          </div>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="card price-card">
            <span className="eyebrow">بيانات الامتحان</span>
            <h2 className="text-3xl font-black">{exam.title}</h2>

            <div className="mt-5 grid gap-3 text-sm font-bold">
              <p>✓ الكورس: {exam.course_title}</p>
              <p>✓ الباب: {exam.chapter_title}</p>
              <p>✓ الحصة: {exam.lesson_title}</p>
              <p>✓ مكان الظهور: {getPlacementLabel(exam.placement)}</p>
              <p>✓ درجة النجاح: {exam.pass_score}%</p>
              <p>✓ عدد الأسئلة: {questions.length}</p>
            </div>
          </aside>

          <TeacherExamQuestionForm examId={exam.id} />
        </div>
      </section>

      <section className="section tint-section">
        <div className="wrap">
          <div className="card p-8 md:p-12">
            <span className="eyebrow">الأسئلة الحالية</span>
            <h2 className="h2">أسئلة الامتحان</h2>

            <div className="mt-8 grid gap-5">
              {questions.map((question, index) => {
                const questionChoices = choices.filter(
                  (choice) => choice.question_id === question.id
                )

                return (
                  <div
                    className="rounded-2xl border border-[var(--line)] bg-[var(--cream-2)] p-5"
                    key={question.id}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-xl font-black">
                        سؤال {index + 1}: {question.question_text}
                      </h3>

                      <span className="badge">{question.points} درجة</span>
                    </div>

                    <div className="mt-4 grid gap-2">
                      {questionChoices.map((choice) => (
                        <div
                          className="rounded-xl border border-[var(--line)] bg-white/50 p-3 text-sm font-bold"
                          key={choice.id}
                        >
                          {choice.is_correct ? "✓ " : ""}
                          {choice.choice_text}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {questions.length === 0 ? (
                <p className="muted">لا توجد أسئلة في هذا الامتحان بعد.</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
