import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { query } from "@/lib/db"

type LessonRow = {
  lesson_id: number
  lesson_title: string
  lesson_description: string | null
  video_url: string | null
  price: number
  course_title: string
  course_slug: string
  chapter_title: string
  access_until: string | null
  activated_at: string
}

async function getLesson(id: string) {
  const rows = await query<LessonRow>(
    `
    SELECT
      l.id AS lesson_id,
      l.title AS lesson_title,
      l.description AS lesson_description,
      l.video_url,
      l.price,
      c.title AS course_title,
      c.slug AS course_slug,
      ch.title AS chapter_title,
      DATE_FORMAT(sla.access_until, '%Y-%m-%d') AS access_until,
      DATE_FORMAT(sla.created_at, '%Y-%m-%d') AS activated_at
    FROM student_lesson_access sla
    JOIN students s ON s.id = sla.student_id
    JOIN users u ON u.id = s.user_id
    JOIN lessons l ON l.id = sla.lesson_id
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    WHERE u.email = 'student@horizon.test'
      AND l.id = ?
    LIMIT 1
    `,
    [id]
  )

  return rows[0]
}

export default async function StudentLessonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const lesson = await getLesson(id)

  if (!lesson) {
    notFound()
  }

  return (
    <main>
      <SiteHeader />

      <section className="course-hero">
        <div className="wrap course-hero-grid">
          <div className="card course-panel">
            <div className="course-meta">
              <span className="badge">{lesson.course_title}</span>
              <span className="badge">{lesson.chapter_title}</span>
              <span className="badge">تم التفعيل: {lesson.activated_at}</span>
            </div>

            <h1 className="h1 mt-6">{lesson.lesson_title}</h1>

            <p className="muted mt-6 text-lg">
              {lesson.lesson_description ||
                "هذه الحصة متاحة لك الآن. ابدأ المشاهدة ثم ارجع للوحة الطالب لمتابعة تقدمك."}
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
              جاهز تبدأ؟
            </h2>
            <p className="mt-4 max-w-sm opacity-80">
              ركّز في الفيديو، وبعده حل التدريب القصير لتثبيت الفكرة.
            </p>
          </aside>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap grid gap-7 lg:grid-cols-[1fr_340px]">
          <div className="card p-6 md:p-8">
            <span className="eyebrow">مشاهدة الحصة</span>
            <h2 className="text-3xl font-black">فيديو الدرس</h2>

            <div className="mt-6 overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--ember)]">
              {lesson.video_url ? (
                <video controls className="w-full" src={lesson.video_url}>
                  المتصفح لا يدعم تشغيل الفيديو.
                </video>
              ) : (
                <div className="grid min-h-[320px] place-items-center p-8 text-center text-[var(--cream)]">
                  <div>
                    <div className="mx-auto mb-5 h-24 w-24 rounded-full border-[18px] border-[var(--orange)] border-b-0" />
                    <h3 className="text-3xl font-black">مكان فيديو الحصة</h3>
                    <p className="mt-3 opacity-80">
                      لم يتم رفع فيديو لهذه الحصة بعد. سيتم ظهوره هنا بعد إضافته من لوحة المدرس.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="card price-card">
            <span className="eyebrow">بيانات الوصول</span>
            <h2 className="text-3xl font-black">الحصة متاحة</h2>

            <div className="mt-5 grid gap-3 text-sm font-bold">
              <p>✓ تم تفعيل الوصول لهذه الحصة</p>
              <p>✓ الكورس: {lesson.course_title}</p>
              <p>✓ الباب: {lesson.chapter_title}</p>
              <p>
                ✓ متاح حتى:{" "}
                {lesson.access_until ? lesson.access_until : "بدون تاريخ انتهاء"}
              </p>
            </div>

            <Link href="/student/activate" className="btn btn-block mt-6">
              تفعيل كود آخر
            </Link>
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}