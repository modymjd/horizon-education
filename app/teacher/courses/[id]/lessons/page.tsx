import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type CourseRow = {
  id: number
  slug: string
  title: string
  short_description: string | null
  status: string
}

type LessonRow = {
  id: number
  title: string
  description: string | null
  price: number
  status: string
  chapter_title: string
  videos_count: number
  assignments_count: number
  exams_count: number
  students_count: number
}

type Params = {
  params: Promise<{
    id: string
  }>
}

async function getTeacherCourse(courseId: number, teacherId: number) {
  const rows = await query<CourseRow>(
    `
    SELECT
      id,
      slug,
      title,
      short_description,
      status
    FROM courses
    WHERE id = ?
      AND teacher_id = ?
      AND deleted_at IS NULL
    LIMIT 1
    `,
    [courseId, teacherId]
  )

  return rows[0]
}

async function getCourseLessons(courseId: number) {
  return query<LessonRow>(
    `
    SELECT
      l.id,
      l.title,
      l.description,
      l.price,
      l.status,
      ch.title AS chapter_title,
      COUNT(DISTINCT lv.id) AS videos_count,
      COUNT(DISTINCT la.id) AS assignments_count,
      COUNT(DISTINCT le.id) AS exams_count,
      COUNT(DISTINCT sla.student_id) AS students_count
    FROM lessons l
    JOIN chapters ch ON ch.id = l.chapter_id
    LEFT JOIN lesson_videos lv ON lv.lesson_id = l.id
    LEFT JOIN lesson_assignments la ON la.lesson_id = l.id
    LEFT JOIN lesson_exams le ON le.lesson_id = l.id
    LEFT JOIN student_lesson_access sla ON sla.lesson_id = l.id
    WHERE ch.course_id = ?
      AND l.deleted_at IS NULL
    GROUP BY
      l.id,
      l.title,
      l.description,
      l.price,
      l.status,
      ch.title,
      l.sort_order
    ORDER BY l.sort_order ASC, l.id ASC
    `,
    [courseId]
  )
}

function getStatusLabel(status: string) {
  if (status === "published") return "منشور"
  if (status === "draft") return "مسودة"
  if (status === "hidden") return "مخفي"
  if (status === "archived") return "مؤرشف"
  return status
}

function money(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("ar-EG")} ج.م`
}

export default async function TeacherCourseLessonsPage({ params }: Params) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher" || !user.teacher_id) {
    redirect("/403")
  }

  const { id } = await params
  const courseId = Number(id)

  if (!courseId || Number.isNaN(courseId)) {
    notFound()
  }

  const [course, lessons] = await Promise.all([
    getTeacherCourse(courseId, user.teacher_id),
    getCourseLessons(courseId),
  ])

  if (!course) {
    notFound()
  }

  return (
    <main>
      <SiteHeader />

      <section className="teacher-page-hero">
        <div className="wrap">
          <span className="eyebrow">لوحة المدرس</span>
          <h1 className="h1">حصص الكورس</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            إدارة كل حصص كورس {course.title}: الفيديوهات، الواجبات، والامتحانات.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/teacher/courses" className="btn">
              رجوع للكورسات
            </Link>

            <Link href={`/teacher/courses/${course.id}/lessons/new`} className="btn btn-outline">
              إضافة حصة جديدة
            </Link>

            <Link href={`/courses/${course.slug}`} className="btn btn-outline">
              معاينة الكورس
            </Link>
          </div>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap">
          <div className="teacher-stat-grid mb-6">
            <div className="card teacher-stat-card">
              <b>{lessons.length}</b>
              <span className="muted font-bold">حصة</span>
            </div>

            <div className="card teacher-stat-card">
              <b>{lessons.reduce((sum, lesson) => sum + Number(lesson.videos_count || 0), 0)}</b>
              <span className="muted font-bold">فيديو</span>
            </div>

            <div className="card teacher-stat-card">
              <b>{lessons.reduce((sum, lesson) => sum + Number(lesson.assignments_count || 0), 0)}</b>
              <span className="muted font-bold">واجب</span>
            </div>

            <div className="card teacher-stat-card">
              <b>{lessons.reduce((sum, lesson) => sum + Number(lesson.exams_count || 0), 0)}</b>
              <span className="muted font-bold">امتحان</span>
            </div>
          </div>

          <div className="grid gap-5">
            {lessons.map((lesson) => (
              <div className="card course-management-card" key={lesson.id}>
                <div className="course-management-head">
                  <div>
                    <span className="status-pill status-published">
                      {getStatusLabel(lesson.status)}
                    </span>

                    <div className="mt-4">
                      <h2 className="text-3xl font-black">{lesson.title}</h2>
                      <p className="muted mt-1">
                        {lesson.description || "لا يوجد وصف لهذه الحصة بعد."}
                      </p>
                      <p className="muted mt-2 text-sm">
                        الشابتر: {lesson.chapter_title} — السعر: {money(lesson.price)}
                      </p>
                    </div>
                  </div>

                  <div className="course-actions">
                    <Link href={`/teacher/lessons/${lesson.id}`} className="btn btn-outline">
                      إدارة الحصة
                    </Link>

                    <Link href={`/student/lessons/${lesson.id}`} className="btn btn-soft">
                      معاينة الطالب
                    </Link>
                  </div>
                </div>

                <div className="course-metrics">
                  <div className="metric-mini">
                    <b>{lesson.videos_count}</b>
                    <span className="muted">فيديو</span>
                  </div>

                  <div className="metric-mini">
                    <b>{lesson.assignments_count}</b>
                    <span className="muted">واجب</span>
                  </div>

                  <div className="metric-mini">
                    <b>{lesson.exams_count}</b>
                    <span className="muted">امتحان</span>
                  </div>

                  <div className="metric-mini">
                    <b>{lesson.students_count}</b>
                    <span className="muted">طالب</span>
                  </div>
                </div>
              </div>
            ))}

            {lessons.length === 0 ? (
              <div className="card course-management-card">
                <h2 className="text-2xl font-black">لا توجد حصص بعد</h2>
                <p className="muted mt-2">
                  ابدأ بإضافة أول حصة داخل هذا الكورس.
                </p>

                <div className="mt-6">
                  <Link href={`/teacher/courses/${course.id}/lessons/new`} className="btn">
                    إضافة أول حصة
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
