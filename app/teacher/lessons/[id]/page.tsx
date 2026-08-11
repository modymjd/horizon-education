import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { LessonVideoForm } from "@/components/teacher/LessonVideoForm"
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

async function getTeacherLesson(id: string)  {
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
      AND l.id = ?
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
    `,
    [id]
  )

  return rows[0]
}

function money(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("ar-EG")} ج.م`
}

export default async function TeacherLessonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const lesson = await getTeacherLesson(id)

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
              <p>✓ فيديو: {lesson.video_url ? "مضاف" : "غير مضاف"}</p>
            </div>
          </aside>

          <LessonVideoForm
            lessonId={lesson.id}
            initialVideoUrl={lesson.video_url}
          />
        </div>
      </section>

      <section className="section tint-section">
        <div className="wrap">
          <div className="card p-8 md:p-12">
            <span className="eyebrow">معاينة الطالب</span>
            <h2 className="h2">تأكد من شكل الحصة للطالب</h2>
            <p className="muted mt-5 max-w-3xl">
              بعد حفظ رابط الفيديو، افتح صفحة الحصة كطالب للتأكد من ظهوره بشكل صحيح.
            </p>
            <div className="mt-8">
            <Link href={`/student/lessons/${lesson.id}`} className="btn"></Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
