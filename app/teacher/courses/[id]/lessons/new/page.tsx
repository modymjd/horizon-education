import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { TeacherLessonCreateForm } from "@/components/teacher/TeacherLessonCreateForm"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type CourseRow = {
  id: number
  title: string
  short_description: string | null
}

type ChapterRow = {
  id: number
  title: string
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
      title,
      short_description
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

async function getCourseChapters(courseId: number) {
  return query<ChapterRow>(
    `
    SELECT
      id,
      title
    FROM chapters
    WHERE course_id = ?
      AND deleted_at IS NULL
    ORDER BY sort_order ASC, id ASC
    `,
    [courseId]
  )
}

export default async function NewTeacherLessonPage({ params }: Params) {
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

  const [course, chapters] = await Promise.all([
    getTeacherCourse(courseId, user.teacher_id),
    getCourseChapters(courseId),
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
          <h1 className="h1">إضافة حصة جديدة</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            أضف حصة جديدة داخل كورس {course.title}.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/teacher/courses" className="btn">
              رجوع للكورسات
            </Link>
          </div>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="card price-card">
            <span className="eyebrow">بيانات الكورس</span>
            <h2 className="text-3xl font-black">{course.title}</h2>

            <div className="mt-5 grid gap-3 text-sm font-bold">
              <p>✓ الكورس تابع لحسابك كمدرس</p>
              <p>✓ عدد الشابترات المتاحة: {chapters.length}</p>
              <p>✓ بعد إضافة الحصة ستتمكن من رفع فيديو وإضافة واجب وامتحان</p>
            </div>

            {chapters.length === 0 ? (
              <div className="alert-error mt-5">
                لا توجد شابترات داخل هذا الكورس. اطلب من الأدمن إضافة شابتر أولًا.
              </div>
            ) : null}
          </aside>

          {chapters.length > 0 ? (
            <TeacherLessonCreateForm courseId={course.id} chapters={chapters} />
          ) : null}
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
