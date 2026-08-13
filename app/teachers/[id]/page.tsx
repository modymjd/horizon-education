import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { query } from "@/lib/db"

type TeacherRow = {
  id: number
  full_name: string
  bio: string | null
  avatar_url: string | null
  courses_count: number
  lessons_count: number
  students_count: number
}

type CourseRow = {
  id: number
  slug: string
  title: string
  short_description: string | null
  education_type_name: string | null
  stage_name: string | null
  grade_name: string | null
  lessons_count: number
}

type Params = {
  params: Promise<{
    id: string
  }>
}

async function getTeacher(teacherId: number) {
  const rows = await query<TeacherRow>(
    `
    SELECT
      t.id,
      u.full_name,
      t.bio,
      u.avatar_url,
      COUNT(DISTINCT c.id) AS courses_count,
      COUNT(DISTINCT l.id) AS lessons_count,
      COUNT(DISTINCT sla.student_id) AS students_count
    FROM teachers t
    JOIN users u ON u.id = t.user_id
    LEFT JOIN courses c
      ON c.teacher_id = t.id
      AND c.deleted_at IS NULL
      AND c.status = 'published'
    LEFT JOIN chapters ch
      ON ch.course_id = c.id
      AND ch.deleted_at IS NULL
    LEFT JOIN lessons l
      ON l.chapter_id = ch.id
      AND l.deleted_at IS NULL
    LEFT JOIN student_lesson_access sla
      ON sla.lesson_id = l.id
    WHERE t.id = ?
      AND u.deleted_at IS NULL
      AND u.status = 'active'
    GROUP BY
      t.id,
      u.full_name,
      t.bio,
      u.avatar_url
    LIMIT 1
    `,
    [teacherId]
  )

  return rows[0]
}

async function getTeacherCourses(teacherId: number) {
  return query<CourseRow>(
    `
    SELECT
      c.id,
      c.slug,
      c.title,
      c.short_description,
      et.name AS education_type_name,
      es.name AS stage_name,
      g.name AS grade_name,
      COUNT(DISTINCT l.id) AS lessons_count
    FROM courses c
    LEFT JOIN education_types et ON et.id = c.education_type_id
    LEFT JOIN educational_stages es ON es.id = c.stage_id
    LEFT JOIN grades g ON g.id = c.grade_id
    LEFT JOIN chapters ch
      ON ch.course_id = c.id
      AND ch.deleted_at IS NULL
    LEFT JOIN lessons l
      ON l.chapter_id = ch.id
      AND l.deleted_at IS NULL
    WHERE c.teacher_id = ?
      AND c.deleted_at IS NULL
      AND c.status = 'published'
    GROUP BY
      c.id,
      c.slug,
      c.title,
      c.short_description,
      et.name,
      es.name,
      g.name
    ORDER BY c.id DESC
    `,
    [teacherId]
  )
}

function getInitials(name: string) {
  return name.trim().slice(0, 1) || "م"
}

export default async function TeacherProfilePage({ params }: Params) {
  const { id } = await params
  const teacherId = Number(id)

  if (!teacherId || Number.isNaN(teacherId)) {
    notFound()
  }

  const [teacher, courses] = await Promise.all([
    getTeacher(teacherId),
    getTeacherCourses(teacherId),
  ])

  if (!teacher) {
    notFound()
  }

  return (
    <main>
      <SiteHeader />

      <section className="course-hero">
        <div className="wrap course-hero-grid">
          <div className="card course-panel">
            <div className="course-meta">
              <span className="badge">{teacher.courses_count} كورس</span>
              <span className="badge">{teacher.lessons_count} حصة</span>
              <span className="badge">{teacher.students_count} طالب</span>
            </div>

            <h1 className="h1 mt-6">{teacher.full_name}</h1>

            <p className="muted mt-6 text-lg">
              {teacher.bio || "مدرس على منصة حورايزون تعليم. يمكنك تصفح الكورسات المنشورة لهذا المدرس."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/teachers" className="btn">
                كل المدرسين
              </Link>

              <Link href="/subjects" className="btn btn-outline">
                تصفح الكورسات
              </Link>
            </div>
          </div>

          <aside className="course-preview">
            <span className="lesson-pill">مدرس</span>
            <h2 className="mt-5 font-[var(--display)] text-6xl font-bold leading-none">
              {getInitials(teacher.full_name)}
            </h2>
            <p className="mt-4 max-w-sm opacity-80">
              شاهد الكورسات المنشورة واطلب الانضمام للكورس المناسب.
            </p>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">كورسات المدرس</span>
            <h2 className="h2">الكورسات المتاحة</h2>
          </div>

          <div className="grid-auto">
            {courses.map((course) => (
              <Link
                href={`/courses/${course.slug}`}
                className="card subject-card"
                key={course.id}
              >
                <div className="icon-circle">{course.title.slice(0, 1)}</div>

                <h3 className="mt-5 text-2xl font-black">{course.title}</h3>

                <p className="muted mt-2">
                  {course.short_description || "لا يوجد وصف مختصر لهذا الكورس بعد."}
                </p>

                <p className="muted mt-3 text-sm">
                  {course.education_type_name || "كل الأنواع"} —{" "}
                  {course.stage_name || "كل المراحل"} —{" "}
                  {course.grade_name || "كل الصفوف"}
                </p>

                <span className="badge mt-5">{course.lessons_count} حصة</span>
              </Link>
            ))}

            {courses.length === 0 ? (
              <div className="card subject-card">
                <div className="icon-circle">ك</div>
                <h3 className="mt-5 text-2xl font-black">لا توجد كورسات منشورة</h3>
                <p className="muted mt-2">
                  لا توجد كورسات منشورة لهذا المدرس حاليًا.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
