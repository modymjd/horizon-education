import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { LessonVideoForm } from "@/components/teacher/LessonVideoForm"
import { LessonAssignmentForm } from "@/components/teacher/LessonAssignmentForm"
import { LessonExamForm } from "@/components/teacher/LessonExamForm"
import { query } from "@/lib/db"

type LessonRow = {
  id: number
  title: string
  description: string | null
  video_url: string | null
  price: number
  status: string
  course_title: string
  course_slug: string
  chapter_title: string
  students_count: number
}

type AssignmentRow = {
  id: number
  title: string
  description: string | null
  attachment_url: string | null
  due_at: string | null
}

type ExamRow = {
  id: number
  title: string
  description: string | null
  pass_score: number
  is_required_to_unlock_next: number
}

async function getTeacherLesson() {
  const rows = await query<LessonRow>(
    `
    SELECT
      l.id,
      l.title,
      l.description,
      l.video_url,
      l.price,
      l.status,
      c.title AS course_title,
      c.slug AS course_slug,
      ch.title AS chapter_title,
      COUNT(DISTINCT sla.student_id) AS students_count
    FROM lessons l
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    JOIN teachers t ON t.id = c.teacher_id
    JOIN users u ON u.id = t.user_id
    LEFT JOIN student_lesson_access sla ON sla.lesson_id = l.id
    WHERE u.email = 'teacher@horizon.test'
      AND l.id = 1
    GROUP BY
      l.id,
      l.title,
      l.description,
      l.video_url,
      l.price,
      l.status,
      c.title,
      c.slug,
      ch.title
    LIMIT 1
    `
  )

  return rows[0]
}

async function getAssignments() {
  return query<AssignmentRow>(`
    SELECT
      id,
      title,
      description,
      attachment_url,
      DATE_FORMAT(due_at, '%Y-%m-%d %H:%i') AS due_at
    FROM lesson_assignments
    WHERE lesson_id = 1
    ORDER BY sort_order ASC, id ASC
  `)
}

async function getExams() {
  return query<ExamRow>(`
    SELECT
      id,
      title,
      description,
      pass_score,
      is_required_to_unlock_next
    FROM lesson_exams
    WHERE lesson_id = 1
    ORDER BY sort_order ASC, id ASC
  `)
}

function money(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("ar-EG")} ج.م`
}

export default async function TeacherLessonPage() {
  const [lesson, assignments, exams] = await Promise.all([
    getTeacherLesson(),
    getAssignments(),
    getExams(),
  ])

  if (!lesson) {
    notFound()
  }

  return (
    <main>
      <SiteHeader />

      <section className="teacher-page-hero">
        <div className="wrap">
          <span className="eyebrow">لوحة المدرس</span>
          <h1 className="h1">{lesson.title}</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            {lesson.description ||
              "إدارة محتوى الحصة، الفيديوهات، الواجبات، الامتحانات، ومتابعة وصول الطلاب."}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/teacher/courses" className="btn">
              رجوع للكورسات
            </Link>

            <Link href={`/courses/${lesson.course_slug}`} className="btn btn-outline">
              معاينة الكورس
            </Link>
          </div>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="card price-card">
            <span className="eyebrow">بيانات الحصة</span>
            <h2 className="text-3xl font-black">ملخص سريع</h2>

            <div className="mt-5 grid gap-3 text-sm font-bold">
              <p>✓ الكورس: {lesson.course_title}</p>
              <p>✓ الباب: {lesson.chapter_title}</p>
              <p>✓ السعر: {money(lesson.price)}</p>
              <p>✓ الحالة: {lesson.status}</p>
              <p>✓ طلاب لديهم وصول: {lesson.students_count}</p>
              <p>✓ فيديو أساسي: {lesson.video_url ? "مضاف" : "غير مضاف"}</p>
              <p>✓ عدد الواجبات: {assignments.length}</p>
              <p>✓ عدد الامتحانات: {exams.length}</p>
            </div>
          </aside>

          <div className="grid gap-7">
            <LessonVideoForm
              lessonId={lesson.id}
              initialVideoUrl={lesson.video_url}
            />

            <LessonAssignmentForm lessonId={lesson.id} />

            <LessonExamForm lessonId={lesson.id} />

            <div className="card payment-form">
              <span className="eyebrow">الواجبات الحالية</span>
              <h2 className="text-3xl font-black">قائمة الواجبات</h2>

              <div className="mt-6 grid gap-4">
                {assignments.map((assignment) => (
                  <div
                    className="rounded-2xl border border-[var(--line)] bg-[var(--cream-2)] p-4"
                    key={assignment.id}
                  >
                    <h3 className="text-xl font-black">{assignment.title}</h3>

                    {assignment.description ? (
                      <p className="muted mt-2">{assignment.description}</p>
                    ) : null}

                    <p className="muted mt-2 text-sm">
                      موعد التسليم: {assignment.due_at || "غير محدد"}
                    </p>

                    {assignment.attachment_url ? (
                      <a
                        href={assignment.attachment_url}
                        className="btn btn-soft mt-4"
                        target="_blank"
                      >
                        تحميل الملف
                      </a>
                    ) : null}
                  </div>
                ))}

                {assignments.length === 0 ? (
                  <p className="muted">لا توجد واجبات مضافة لهذه الحصة بعد.</p>
                ) : null}
              </div>
            </div>

            <div className="card payment-form">
              <span className="eyebrow">الامتحانات الحالية</span>
              <h2 className="text-3xl font-black">قائمة الامتحانات</h2>

              <div className="mt-6 grid gap-4">
                {exams.map((exam) => (
                  <div
                    className="rounded-2xl border border-[var(--line)] bg-[var(--cream-2)] p-4"
                    key={exam.id}
                  >
                    <h3 className="text-xl font-black">{exam.title}</h3>

                    {exam.description ? (
                      <p className="muted mt-2">{exam.description}</p>
                    ) : null}

                    <p className="muted mt-2 text-sm">
                      درجة النجاح: {exam.pass_score}%
                    </p>

                    <p className="muted mt-1 text-sm">
                      شرط فتح التالي:{" "}
                      {exam.is_required_to_unlock_next ? "نعم" : "لا"}
                    </p>
                  </div>
                ))}

                {exams.length === 0 ? (
                  <p className="muted">لا توجد امتحانات مضافة لهذه الحصة بعد.</p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section tint-section">
        <div className="wrap">
          <div className="card p-8 md:p-12">
            <span className="eyebrow">معاينة الطالب</span>
            <h2 className="h2">تأكد من شكل الحصة للطالب</h2>
            <p className="muted mt-5 max-w-3xl">
              بعد إضافة الفيديوهات أو الواجبات أو الامتحانات، افتح صفحة الحصة كطالب للتأكد من ظهور المحتوى بشكل صحيح.
            </p>

            <div className="mt-8">
              <Link href="/student/lessons/1" className="btn">
                فتح صفحة الطالب
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}