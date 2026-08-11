import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type LessonRow = {
  lesson_id: number
  lesson_title: string
  lesson_description: string | null
  price: number
  course_title: string
  course_slug: string
  chapter_title: string
  access_until: string | null
  activated_at: string | null
}

type LessonVideoRow = {
  id: number
  title: string
  video_url: string
  sort_order: number
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
  attempted: number
  score: number | null
  passed: number | null
  questions_count: number
}

async function getLesson(id: string, studentId: number) {
  const rows = await query<LessonRow>(
    `
    SELECT
      l.id AS lesson_id,
      l.title AS lesson_title,
      l.description AS lesson_description,
      l.price,
      c.title AS course_title,
      c.slug AS course_slug,
      ch.title AS chapter_title,
      DATE_FORMAT(sla.access_until, '%Y-%m-%d') AS access_until,
      DATE_FORMAT(sla.created_at, '%Y-%m-%d') AS activated_at
    FROM student_lesson_access sla
    JOIN lessons l ON l.id = sla.lesson_id
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    WHERE sla.student_id = ?
      AND l.id = ?
    LIMIT 1
    `,
    [studentId, id]
  )

  return rows[0]
}

async function getLessonVideos(id: string) {
  return query<LessonVideoRow>(
    `
    SELECT
      id,
      title,
      video_url,
      sort_order
    FROM lesson_videos
    WHERE lesson_id = ?
    ORDER BY sort_order ASC, id ASC
    `,
    [id]
  )
}

async function getAssignments(id: string) {
  return query<AssignmentRow>(
    `
    SELECT
      id,
      title,
      description,
      attachment_url,
      DATE_FORMAT(due_at, '%Y-%m-%d %H:%i') AS due_at
    FROM lesson_assignments
    WHERE lesson_id = ?
    ORDER BY sort_order ASC, id ASC
    `,
    [id]
  )
}

async function getExams(id: string, studentId: number) {
  return query<ExamRow>(
    `
    SELECT
      e.id,
      e.title,
      e.description,
      e.pass_score,
      e.is_required_to_unlock_next,
      CASE WHEN a.id IS NULL THEN 0 ELSE 1 END AS attempted,
      a.score,
      a.passed,
      COUNT(DISTINCT q.id) AS questions_count
    FROM lesson_exams e
    JOIN lessons l ON l.id = e.lesson_id
    JOIN student_lesson_access sla
      ON sla.lesson_id = l.id
      AND sla.student_id = ?
    LEFT JOIN lesson_exam_attempts a
      ON a.exam_id = e.id
      AND a.student_id = sla.student_id
    LEFT JOIN lesson_exam_questions q ON q.exam_id = e.id
    WHERE e.lesson_id = ?
    GROUP BY
      e.id,
      e.title,
      e.description,
      e.pass_score,
      e.is_required_to_unlock_next,
      attempted,
      a.score,
      a.passed
    ORDER BY e.sort_order ASC, e.id ASC
    `,
    [studentId, id]
  )
}

export default async function StudentLessonPage({
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

  const [lesson, videos, assignments, exams] = await Promise.all([
    getLesson(id, user.student_id),
    getLessonVideos(id),
    getAssignments(id),
    getExams(id, user.student_id),
  ])

  if (!lesson) {
    notFound()
  }

  const firstVideo = videos[0]

  return (
    <main>
      <SiteHeader />

      <section className="course-hero">
        <div className="wrap course-hero-grid">
          <div className="card course-panel">
            <div className="course-meta">
              <span className="badge">{lesson.course_title}</span>
              <span className="badge">{lesson.chapter_title}</span>
              <span className="badge">تم التفعيل: {lesson.activated_at || "غير محدد"}</span>
              <span className="badge">{videos.length} فيديو</span>
              <span className="badge">{assignments.length} واجب</span>
              <span className="badge">{exams.length} امتحان</span>
            </div>

            <h1 className="h1 mt-6">{lesson.lesson_title}</h1>

            <p className="muted mt-6 text-lg">
              {lesson.lesson_description ||
                "هذه الحصة متاحة لك الآن. شاهد فيديوهات الدرس بالترتيب، ثم راجع الواجبات والامتحانات."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/student" className="btn">
                رجوع للوحة الطالب
              </Link>

              <Link href={`/courses/${lesson.course_slug}`} className="btn btn-outline">
                فتح صفحة الكورس
              </Link>
            </div>
          </div>

          <aside className="course-preview">
            <span className="lesson-pill">حصة مفعّلة</span>
            <h2 className="mt-5 font-[var(--display)] text-6xl font-bold leading-none">
              {videos.length > 1 ? "فيديوهات الدرس" : "جاهز تبدأ؟"}
            </h2>
            <p className="mt-4 max-w-sm opacity-80">
              شاهد الفيديوهات بالترتيب، وبعدها حل الواجبات والامتحانات المطلوبة.
            </p>
          </aside>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap grid gap-7 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-6">
            {videos.map((video, index) => (
              <div
                className="card p-6 md:p-8"
                key={video.id}
                id={`video-${video.id}`}
              >
                <span className="eyebrow">الفيديو {index + 1}</span>
                <h2 className="text-3xl font-black">{video.title}</h2>

                <div className="mt-6 overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--ember)]">
                  <video controls className="w-full" src={video.video_url}>
                    المتصفح لا يدعم تشغيل الفيديو.
                  </video>
                </div>
              </div>
            ))}

            {videos.length === 0 ? (
              <div className="card p-6 md:p-8">
                <span className="eyebrow">مشاهدة الحصة</span>
                <h2 className="text-3xl font-black">فيديو الدرس</h2>

                <div className="mt-6 overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--ember)]">
                  <div className="grid min-h-[320px] place-items-center p-8 text-center text-[var(--cream)]">
                    <div>
                      <div className="mx-auto mb-5 h-24 w-24 rounded-full border-[18px] border-[var(--orange)] border-b-0" />
                      <h3 className="text-3xl font-black">لا توجد فيديوهات بعد</h3>
                      <p className="mt-3 opacity-80">
                        لم يتم رفع فيديوهات لهذه الحصة بعد. ستظهر هنا بعد إضافتها من لوحة المدرس.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="card p-6 md:p-8">
              <span className="eyebrow">واجبات الحصة</span>
              <h2 className="text-3xl font-black">المطلوب منك</h2>

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
                        تحميل ملف الواجب
                      </a>
                    ) : null}
                  </div>
                ))}

                {assignments.length === 0 ? (
                  <p className="muted">لا توجد واجبات لهذه الحصة بعد.</p>
                ) : null}
              </div>
            </div>

            <div className="card p-6 md:p-8">
              <span className="eyebrow">امتحانات الحصة</span>
              <h2 className="text-3xl font-black">اختبر فهمك</h2>

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
                      عدد الأسئلة: {exam.questions_count}
                    </p>

                    <p className="muted mt-1 text-sm">
                      شرط فتح التالي: {exam.is_required_to_unlock_next ? "نعم" : "لا"}
                    </p>

                    {exam.attempted ? (
                      <div className="alert-success mt-4">
                        تم تسليم الامتحان — الدرجة: {exam.score}% —{" "}
                        {exam.passed ? "ناجح" : "غير ناجح"}
                      </div>
                    ) : (
                      <Link href={`/student/exams/${exam.id}`} className="btn mt-4">
                        بدء الامتحان
                      </Link>
                    )}
                  </div>
                ))}

                {exams.length === 0 ? (
                  <p className="muted">لا توجد امتحانات لهذه الحصة بعد.</p>
                ) : null}
              </div>
            </div>
          </div>

          <aside className="card price-card">
            <span className="eyebrow">بيانات الوصول</span>
            <h2 className="text-3xl font-black">الحصة متاحة</h2>

            <div className="mt-5 grid gap-3 text-sm font-bold">
              <p>✓ تم تفعيل الوصول لهذه الحصة</p>
              <p>✓ الكورس: {lesson.course_title}</p>
              <p>✓ الباب: {lesson.chapter_title}</p>
              <p>✓ عدد الفيديوهات: {videos.length}</p>
              <p>✓ عدد الواجبات: {assignments.length}</p>
              <p>✓ عدد الامتحانات: {exams.length}</p>
              <p>
                ✓ متاح حتى: {lesson.access_until ? lesson.access_until : "بدون تاريخ انتهاء"}
              </p>
            </div>

            {firstVideo ? (
              <a href={`#video-${firstVideo.id}`} className="btn btn-block mt-6">
                بدء المشاهدة
              </a>
            ) : (
              <Link href="/student/activate" className="btn btn-block mt-6">
                تفعيل كود آخر
              </Link>
            )}
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
