import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { StudentCourseRequestButton } from "@/components/student/StudentCourseRequestButton"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type CourseRow = {
  id: number
  slug: string
  title: string
  short_description: string | null
  description: string | null
  cover_image_url: string | null
  teacher_id: number
  teacher_name: string
  teacher_bio: string | null
  education_type_name: string | null
  stage_name: string | null
  grade_name: string | null
  lessons_count: number
  chapters_count: number
  students_count: number
  request_status: "pending" | "accepted" | "rejected" | null
}

type ChapterRow = {
  id: number
  title: string
  description: string | null
  sort_order: number
}

type LessonRow = {
  id: number
  chapter_id: number
  title: string
  description: string | null
  price: number
  sort_order: number
  has_access: number
}

type Params = {
  params: Promise<{
    slug: string
  }>
}

function getCourseIdFromSlug(slug: string) {
  const match = slug.match(/-(\d+)$/)
  if (!match) return null

  const value = Number(match[1])
  return Number.isNaN(value) ? null : value
}

async function getCourse(slug: string, studentId?: number) {
  const decodedSlug = decodeURIComponent(slug)
  const possibleCourseId = getCourseIdFromSlug(decodedSlug)

  const rows = await query<CourseRow>(
    `
    SELECT
      c.id,
      c.slug,
      c.title,
      c.short_description,
      c.description,
      c.cover_image_url,
      c.teacher_id,
      u.full_name AS teacher_name,
      t.bio AS teacher_bio,
      et.name AS education_type_name,
      es.name AS stage_name,
      g.name AS grade_name,
      COUNT(DISTINCT ch.id) AS chapters_count,
      COUNT(DISTINCT l.id) AS lessons_count,
      COUNT(DISTINCT sla_all.student_id) AS students_count,
      r.status AS request_status
    FROM courses c
    JOIN teachers t ON t.id = c.teacher_id
    JOIN users u ON u.id = t.user_id
    LEFT JOIN education_types et ON et.id = c.education_type_id
    LEFT JOIN educational_stages es ON es.id = c.stage_id
    LEFT JOIN grades g ON g.id = c.grade_id
    LEFT JOIN chapters ch
      ON ch.course_id = c.id
      AND ch.deleted_at IS NULL
      AND ch.status = 'published'
    LEFT JOIN lessons l
      ON l.chapter_id = ch.id
      AND l.deleted_at IS NULL
      AND l.status = 'published'
    LEFT JOIN student_lesson_access sla_all ON sla_all.lesson_id = l.id
    LEFT JOIN student_course_requests r
      ON r.course_id = c.id
      AND r.student_id = ?
    WHERE (
        c.slug = ?
        OR c.slug = ?
        OR (? IS NOT NULL AND c.id = ?)
      )
      AND c.deleted_at IS NULL
      AND c.status = 'published'
    GROUP BY
      c.id,
      c.slug,
      c.title,
      c.short_description,
      c.description,
      c.cover_image_url,
      c.teacher_id,
      u.full_name,
      t.bio,
      et.name,
      es.name,
      g.name,
      r.status
    LIMIT 1
    `,
    [studentId || 0, slug, decodedSlug, possibleCourseId, possibleCourseId]
  )

  return rows[0]
}

async function getChapters(courseId: number) {
  return query<ChapterRow>(
    `
    SELECT
      id,
      title,
      description,
      sort_order
    FROM chapters
    WHERE course_id = ?
      AND deleted_at IS NULL
      AND status = 'published'
    ORDER BY sort_order ASC, id ASC
    `,
    [courseId]
  )
}

async function getLessons(courseId: number, studentId?: number) {
  return query<LessonRow>(
    `
    SELECT
      l.id,
      l.chapter_id,
      l.title,
      l.description,
      l.price,
      l.sort_order,
      CASE WHEN sla.id IS NULL THEN 0 ELSE 1 END AS has_access
    FROM lessons l
    JOIN chapters ch ON ch.id = l.chapter_id
    LEFT JOIN student_lesson_access sla
      ON sla.lesson_id = l.id
      AND sla.student_id = ?
    WHERE ch.course_id = ?
      AND ch.deleted_at IS NULL
      AND ch.status = 'published'
      AND l.deleted_at IS NULL
      AND l.status = 'published'
    ORDER BY ch.sort_order ASC, l.sort_order ASC, l.id ASC
    `,
    [studentId || 0, courseId]
  )
}

function money(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("ar-EG")} ج.م`
}

function getRequestText(status: string | null) {
  if (status === "pending") return "طلبك قيد المراجعة لدى المدرس."
  if (status === "accepted") return "تم قبولك في الكورس. تواصل مع المدرس للحصول على كود الوصول."
  if (status === "rejected") return "لم يتم قبول طلبك. يمكنك التواصل مع الإدارة أو طلب كورس آخر."
  return ""
}

export default async function CoursePage({ params }: Params) {
  const { slug } = await params
  const user = await getCurrentUser()
  const isStudent = user?.role === "student" && !!user.student_id
  const studentId = isStudent ? Number(user.student_id) : undefined

  const course = await getCourse(slug, studentId)

  if (!course) {
    notFound()
  }

  const [chapters, lessons] = await Promise.all([
    getChapters(course.id),
    getLessons(course.id, studentId),
  ])

  const unlockedLessons = lessons.filter((lesson) => Number(lesson.has_access) === 1)
  const firstUnlockedLesson = unlockedLessons[0]

  return (
    <main>
      <SiteHeader />

      <section className="course-hero">
        <div className="wrap course-hero-grid">
          <div className="card course-panel">
            <div className="course-meta">
              <span className="badge">{course.education_type_name || "كل الأنواع"}</span>
              <span className="badge">{course.stage_name || "كل المراحل"}</span>
              <span className="badge">{course.grade_name || "كل الصفوف"}</span>
              <span className="badge">{course.lessons_count} حصة</span>
            </div>

            <h1 className="h1 mt-6">{course.title}</h1>

            <p className="muted mt-6 text-lg">
              {course.description || course.short_description || "كورس منشور على منصة حورايزون تعليم."}
            </p>

            <p className="muted mt-4">
              المدرس: {course.teacher_name}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              {firstUnlockedLesson ? (
                <Link href={`/student/lessons/${firstUnlockedLesson.id}`} className="btn">
                  فتح أول حصة مفعّلة
                </Link>
              ) : isStudent ? (
                <Link href="/student/activate" className="btn">
                  تفعيل كود وصول
                </Link>
              ) : (
                <Link href="/register" className="btn">
                  سجل كطالب للانضمام
                </Link>
              )}

              <Link href="/subjects" className="btn btn-outline">
                رجوع للكورسات
              </Link>
            </div>

            {isStudent ? (
              <div className="mt-6">
                {course.request_status ? (
                  <div className="alert-success">
                    {getRequestText(course.request_status)}
                  </div>
                ) : (
                  <StudentCourseRequestButton
                    courseId={course.id}
                    initialStatus={course.request_status}
                  />
                )}
              </div>
            ) : null}
          </div>

          <aside className="course-preview">
            <span className="lesson-pill">كورس منشور</span>
            <h2 className="mt-5 font-[var(--display)] text-6xl font-bold leading-none">
              {course.lessons_count} حصة
            </h2>
            <p className="mt-4 max-w-sm opacity-80">
              {course.short_description || "شاهد محتوى الكورس واطلب الانضمام إذا كان مناسبًا لك."}
            </p>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="wrap grid gap-7 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            <div>
              <div className="section-head">
                <span className="eyebrow">المحتوى</span>
                <h2 className="h2">الشابترات والحصص</h2>
              </div>

              <div className="lesson-list">
                {chapters.map((chapter, chapterIndex) => {
                  const chapterLessons = lessons.filter(
                    (lesson) => lesson.chapter_id === chapter.id
                  )

                  return (
                    <div className="card p-5" key={chapter.id}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="badge">شابتر {chapterIndex + 1}</span>
                          <h3 className="mt-3 text-2xl font-black">{chapter.title}</h3>
                          {chapter.description ? (
                            <p className="muted mt-2">{chapter.description}</p>
                          ) : null}
                        </div>

                        <span className="badge">{chapterLessons.length} حصة</span>
                      </div>

                      <div className="mt-5 grid gap-3">
                        {chapterLessons.map((lesson, index) => (
                          <div className="lesson-row" key={lesson.id}>
                            <div className="lesson-number">{index + 1}</div>
                            <div>
                              <h4 className="text-xl font-black">{lesson.title}</h4>
                              <p className="muted">
                                {lesson.description || "فيديو ومحتوى تعليمي"}
                              </p>
                            </div>

                            {Number(lesson.has_access) === 1 ? (
                              <Link href={`/student/lessons/${lesson.id}`} className="btn btn-soft">
                                فتح
                              </Link>
                            ) : (
                              <span className="badge">{money(lesson.price)}</span>
                            )}
                          </div>
                        ))}

                        {chapterLessons.length === 0 ? (
                          <p className="muted">لا توجد حصص منشورة داخل هذا الشابتر بعد.</p>
                        ) : null}
                      </div>
                    </div>
                  )
                })}

                {chapters.length === 0 ? (
                  <div className="card p-5">
                    <h3 className="text-2xl font-black">لا يوجد محتوى منشور بعد</h3>
                    <p className="muted mt-2">
                      سيتم عرض الشابترات والحصص هنا بعد نشرها.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <aside className="card price-card">
            <span className="eyebrow">معلومات الكورس</span>
            <div className="price">{course.lessons_count}</div>
            <p className="muted mt-3">حصة منشورة داخل هذا الكورس.</p>

            <div className="mt-6 grid gap-3 text-sm font-bold">
              <p>✓ المدرس: {course.teacher_name}</p>
              <p>✓ الشابترات: {course.chapters_count}</p>
              <p>✓ الطلاب المفعّلين: {course.students_count}</p>
              <p>✓ نوع التعليم: {course.education_type_name || "كل الأنواع"}</p>
              <p>✓ المرحلة: {course.stage_name || "كل المراحل"}</p>
              <p>✓ الصف: {course.grade_name || "كل الصفوف"}</p>
            </div>

            {isStudent ? (
              <div className="mt-6">
                <StudentCourseRequestButton
                  courseId={course.id}
                  initialStatus={course.request_status}
                />
              </div>
            ) : (
              <Link href="/register" className="btn btn-block mt-6">
                سجل كطالب للانضمام
              </Link>
            )}
          </aside>
        </div>
      </section>

      <section className="section tint-section">
        <div className="wrap">
          <div className="card p-8 md:p-12">
            <span className="eyebrow">جاهز تبدأ؟</span>
            <h2 className="h2">اطلب الانضمام أو فعّل كود الوصول</h2>
            <p className="muted mt-5 max-w-3xl">
              قبول طلب الانضمام لا يفتح الحصص تلقائيًا. بعد قبول المدرس، استخدم كود الوصول الذي يرسله لك لفتح الحصص.
            </p>
            <div className="mt-8">
              {isStudent ? (
                <Link href="/student/activate" className="btn">
                  تفعيل كود وصول
                </Link>
              ) : (
                <Link href="/register" className="btn">
                  إنشاء حساب طالب
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

