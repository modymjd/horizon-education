import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { LessonVideoForm } from "@/components/teacher/LessonVideoForm"
import { LessonAssignmentForm } from "@/components/teacher/LessonAssignmentForm"
import { LessonExamForm } from "@/components/teacher/LessonExamForm"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type LessonRow = {
  id: number
  title: string
  description: string | null
  video_url: string | null
  price: number
  status: string
  course_id: number
  course_title: string
  course_slug: string
  chapter_title: string
  students_count: number
}

type ExamRow = {
  id: number
  title: string
  description: string | null
  pass_score: number
  placement: "before_content" | "after_content"
  questions_count: number
}

type SubmissionRow = {
  id: number
  assignment_title: string
  student_name: string
  submission_url: string
  notes: string | null
  status: string
  submitted_at: string
}

async function getTeacherLesson(id: string, teacherId: number) {
  const rows = await query<LessonRow>(
    `
    SELECT
      l.id,
      l.title,
      l.description,
      l.video_url,
      l.price,
      l.status,
      c.id AS course_id,
      c.title AS course_title,
      c.slug AS course_slug,
      ch.title AS chapter_title,
      COUNT(DISTINCT sla.student_id) AS students_count
    FROM lessons l
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    LEFT JOIN student_lesson_access sla ON sla.lesson_id = l.id
    WHERE c.teacher_id = ?
      AND l.id = ?
      AND l.deleted_at IS NULL
    GROUP BY
      l.id,
      l.title,
      l.description,
      l.video_url,
      l.price,
      l.status,
      c.id,
      c.title,
      c.slug,
      ch.title
    LIMIT 1
    `,
    [teacherId, id]
  )

  return rows[0]
}

async function getLessonExams(id: string, teacherId: number) {
  return query<ExamRow>(
    `
    SELECT
      e.id,
      e.title,
      e.description,
      e.pass_score,
      e.placement,
      COUNT(DISTINCT q.id) AS questions_count
    FROM lesson_exams e
    JOIN lessons l ON l.id = e.lesson_id
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    LEFT JOIN lesson_exam_questions q ON q.exam_id = e.id
    WHERE e.lesson_id = ?
      AND c.teacher_id = ?
    GROUP BY
      e.id,
      e.title,
      e.description,
      e.pass_score,
      e.placement,
      e.sort_order
    ORDER BY e.placement ASC, e.sort_order ASC, e.id ASC
    `,
    [id, teacherId]
  )
}

async function getLessonSubmissions(id: string, teacherId: number) {
  return query<SubmissionRow>(
    `
    SELECT
      s.id,
      a.title AS assignment_title,
      u.full_name AS student_name,
      s.submission_url,
      s.notes,
      s.status,
      DATE_FORMAT(s.submitted_at, '%Y-%m-%d %H:%i') AS submitted_at
    FROM lesson_assignment_submissions s
    JOIN lesson_assignments a ON a.id = s.assignment_id
    JOIN lessons l ON l.id = a.lesson_id
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    JOIN students st ON st.id = s.student_id
    JOIN users u ON u.id = st.user_id
    WHERE a.lesson_id = ?
      AND c.teacher_id = ?
    ORDER BY s.submitted_at DESC
    `,
    [id, teacherId]
  )
}

function money(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("ar-EG")} ج.م`
}

function getPlacementLabel(placement: string) {
  if (placement === "before_content") return "قبل الحصة"
  return "بعد الحصة"
}

function getSubmissionStatusLabel(status: string) {
  if (status === "submitted") return "تم التسليم"
  if (status === "reviewed") return "تمت المراجعة"
  if (status === "accepted") return "مقبول"
  if (status === "rejected") return "مرفوض"
  return status
}

export default async function TeacherLessonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher" || !user.teacher_id) {
    redirect("/403")
  }

  const { id } = await params

  const [lesson, exams, submissions] = await Promise.all([
    getTeacherLesson(id, user.teacher_id),
    getLessonExams(id, user.teacher_id),
    getLessonSubmissions(id, user.teacher_id),
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
            {lesson.description || "إدارة محتوى الحصة، رابط الفيديو، ومتابعة وصول الطلاب."}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={`/teacher/courses/${lesson.course_id}/lessons`} className="btn">
              رجوع لحصص الكورس
            </Link>

            <Link href="/teacher/courses" className="btn btn-outline">
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
              <p>✓ فيديو: {lesson.video_url ? "مضاف" : "غير مضاف"}</p>
              <p>✓ عدد الامتحانات: {exams.length}</p>
              <p>✓ تسليمات الواجبات: {submissions.length}</p>
            </div>
          </aside>

          <div className="grid gap-6">
            <LessonVideoForm
              lessonId={lesson.id}
              initialVideoUrl={lesson.video_url}
            />

            <LessonAssignmentForm lessonId={lesson.id} />

            <LessonExamForm lessonId={lesson.id} />
          </div>
        </div>
      </section>

      <section className="section tint-section">
        <div className="wrap">
          <div className="card p-8 md:p-12">
            <span className="eyebrow">امتحانات الحصة</span>
            <h2 className="h2">إدارة الامتحانات والأسئلة</h2>
            <p className="muted mt-5 max-w-3xl">
              بعد إضافة امتحان، افتح إدارة الأسئلة لإضافة أسئلة الاختيار من متعدد.
            </p>

            <div className="mt-8 grid gap-5">
              {exams.map((exam) => (
                <div
                  className="rounded-2xl border border-[var(--line)] bg-[var(--cream-2)] p-5"
                  key={exam.id}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="badge">{getPlacementLabel(exam.placement)}</span>
                      <h3 className="mt-3 text-2xl font-black">{exam.title}</h3>
                      {exam.description ? (
                        <p className="muted mt-2">{exam.description}</p>
                      ) : null}
                      <p className="muted mt-2 text-sm">
                        درجة النجاح: {exam.pass_score}% — عدد الأسئلة: {exam.questions_count}
                      </p>
                    </div>

                    <Link href={`/teacher/exams/${exam.id}`} className="btn btn-outline">
                      إدارة الأسئلة
                    </Link>
                  </div>
                </div>
              ))}

              {exams.length === 0 ? (
                <p className="muted">
                  لا توجد امتحانات لهذه الحصة بعد. أضف امتحانًا من النموذج بالأعلى.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="card p-8 md:p-12">
            <span className="eyebrow">تسليمات الواجبات</span>
            <h2 className="h2">تسليمات الطلاب</h2>
            <p className="muted mt-5 max-w-3xl">
              راجع الملفات التي رفعها الطلاب كإجابات على واجبات هذه الحصة.
            </p>

            <div className="mt-8 grid gap-4">
              {submissions.map((submission) => (
                <div
                  className="rounded-2xl border border-[var(--line)] bg-[var(--cream-2)] p-5"
                  key={submission.id}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="badge">{getSubmissionStatusLabel(submission.status)}</span>
                      <h3 className="mt-3 text-xl font-black">{submission.assignment_title}</h3>
                      <p className="muted mt-2">الطالب: {submission.student_name}</p>
                      <p className="muted mt-1 text-sm">وقت التسليم: {submission.submitted_at}</p>
                      {submission.notes ? (
                        <p className="muted mt-2">ملاحظات الطالب: {submission.notes}</p>
                      ) : null}
                    </div>

                    <a
                      href={submission.submission_url}
                      className="btn btn-soft"
                      target="_blank"
                    >
                      تحميل التسليم
                    </a>
                  </div>
                </div>
              ))}

              {submissions.length === 0 ? (
                <p className="muted">لا توجد تسليمات واجبات لهذه الحصة بعد.</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="card p-8 md:p-12">
            <span className="eyebrow">معاينة الطالب</span>
            <h2 className="h2">تأكد من شكل الحصة للطالب</h2>
            <p className="muted mt-5 max-w-3xl">
              بعد حفظ رابط الفيديو وإضافة الواجبات والامتحانات، افتح صفحة الحصة كطالب للتأكد من ظهورها بشكل صحيح.
            </p>
            <div className="mt-8">
              <Link href={`/student/lessons/${lesson.id}`} className="btn">
                فتح صفحة الحصة
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
