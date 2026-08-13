import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { AdminCourseEditForm } from "@/components/admin/AdminCourseEditForm"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type CourseRow = {
  id: number
  slug: string
  title: string
  short_description: string | null
  description: string | null
  cover_image_url: string | null
  status: string
  teacher_id: number
  teacher_name: string
  education_type_id: number | null
  education_type_name: string | null
  stage_id: number | null
  stage_name: string | null
  grade_id: number | null
  grade_name: string | null
  access_duration_days: number | null
}

type ChapterRow = {
  id: number
  title: string
  description: string | null
  status: string
  sort_order: number
  lessons_count: number
}

type TeacherOption = {
  id: number
  full_name: string
}

type EducationTypeOption = {
  id: number
  name: string
}

type StageOption = {
  id: number
  name: string
  education_type_id: number | null
}

type GradeOption = {
  id: number
  name: string
  stage_id: number
}

type Params = {
  params: Promise<{
    id: string
  }>
}

async function getCourse(courseId: number) {
  const rows = await query<CourseRow>(
    `
    SELECT
      c.id,
      c.slug,
      c.title,
      c.short_description,
      c.description,
      c.cover_image_url,
      c.status,
      c.teacher_id,
      u.full_name AS teacher_name,
      c.education_type_id,
      et.name AS education_type_name,
      c.stage_id,
      es.name AS stage_name,
      c.grade_id,
      g.name AS grade_name,
      c.access_duration_days
    FROM courses c
    JOIN teachers t ON t.id = c.teacher_id
    JOIN users u ON u.id = t.user_id
    LEFT JOIN education_types et ON et.id = c.education_type_id
    LEFT JOIN educational_stages es ON es.id = c.stage_id
    LEFT JOIN grades g ON g.id = c.grade_id
    WHERE c.id = ?
      AND c.deleted_at IS NULL
    LIMIT 1
    `,
    [courseId]
  )

  return rows[0]
}

async function getChapters(courseId: number) {
  return query<ChapterRow>(
    `
    SELECT
      ch.id,
      ch.title,
      ch.description,
      ch.status,
      ch.sort_order,
      COUNT(DISTINCT l.id) AS lessons_count
    FROM chapters ch
    LEFT JOIN lessons l ON l.chapter_id = ch.id AND l.deleted_at IS NULL
    WHERE ch.course_id = ?
      AND ch.deleted_at IS NULL
    GROUP BY ch.id, ch.title, ch.description, ch.status, ch.sort_order
    ORDER BY ch.sort_order ASC, ch.id ASC
    `,
    [courseId]
  )
}

async function getTeachers() {
  return query<TeacherOption>(
    `
    SELECT
      t.id,
      u.full_name
    FROM teachers t
    JOIN users u ON u.id = t.user_id
    WHERE u.deleted_at IS NULL
      AND u.status = 'active'
    ORDER BY u.full_name ASC
    `
  )
}

async function getEducationTypes() {
  return query<EducationTypeOption>(
    `
    SELECT id, name
    FROM education_types
    ORDER BY id ASC
    `
  )
}

async function getStages() {
  return query<StageOption>(
    `
    SELECT id, name, education_type_id
    FROM educational_stages
    ORDER BY education_type_id ASC, sort_order ASC, id ASC
    `
  )
}

async function getGrades() {
  return query<GradeOption>(
    `
    SELECT id, name, stage_id
    FROM grades
    ORDER BY stage_id ASC, sort_order ASC, id ASC
    `
  )
}

function getStatusLabel(status: string) {
  if (status === "published") return "منشور"
  if (status === "draft") return "مسودة"
  if (status === "paused") return "متوقف"
  if (status === "ended") return "منتهي"
  return status
}

export default async function AdminCourseDetailsPage({ params }: Params) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "admin") {
    redirect("/403")
  }

  const { id } = await params
  const courseId = Number(id)

  if (!courseId || Number.isNaN(courseId)) {
    notFound()
  }

  const [course, chapters, teachers, educationTypes, stages, grades] =
    await Promise.all([
      getCourse(courseId),
      getChapters(courseId),
      getTeachers(),
      getEducationTypes(),
      getStages(),
      getGrades(),
    ])

  if (!course) {
    notFound()
  }

  return (
    <main>
      <SiteHeader />

      <section className="admin-page-hero">
        <div className="wrap">
          <span className="eyebrow">لوحة الإدارة</span>
          <h1 className="h1">{course.title}</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            تعديل بيانات الكورس ومراجعة الشابترات والحصص المرتبطة به.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/admin/courses" className="btn">
              رجوع للكورسات
            </Link>

            <Link href={`/courses/${course.slug}`} className="btn btn-outline">
              معاينة الكورس
            </Link>
          </div>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="card price-card">
            <span className="eyebrow">ملخص الكورس</span>
            <h2 className="text-3xl font-black">{course.title}</h2>

            <div className="mt-5 grid gap-3 text-sm font-bold">
              <p>✓ المدرس: {course.teacher_name}</p>
              <p>✓ الحالة: {getStatusLabel(course.status)}</p>
              <p>✓ نوع التعليم: {course.education_type_name || "كل الأنواع"}</p>
              <p>✓ المرحلة: {course.stage_name || "كل المراحل"}</p>
              <p>✓ الصف: {course.grade_name || "كل الصفوف"}</p>
              <p>✓ مدة الوصول: {course.access_duration_days || 30} يوم</p>
              <p>✓ عدد الشابترات: {chapters.length}</p>
            </div>
          </aside>

          <AdminCourseEditForm
            course={course}
            teachers={teachers}
            educationTypes={educationTypes}
            stages={stages}
            grades={grades}
          />
        </div>
      </section>

      <section className="section tint-section">
        <div className="wrap">
          <div className="card p-8 md:p-12">
            <span className="eyebrow">الشابترات</span>
            <h2 className="h2">شابترات الكورس</h2>
            <p className="muted mt-5 max-w-3xl">
              يمكنك إدارة الشابترات والحصص من صفحات الإدارة الحالية.
            </p>

            <div className="mt-8 grid gap-4">
              {chapters.map((chapter) => (
                <div
                  className="rounded-2xl border border-[var(--line)] bg-[var(--cream-2)] p-5"
                  key={chapter.id}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="badge">{getStatusLabel(chapter.status)}</span>
                      <h3 className="mt-3 text-2xl font-black">{chapter.title}</h3>
                      {chapter.description ? (
                        <p className="muted mt-2">{chapter.description}</p>
                      ) : null}
                      <p className="muted mt-2 text-sm">
                        عدد الحصص: {chapter.lessons_count}
                      </p>
                    </div>

                    <Link href={`/admin/chapters/${chapter.id}`} className="btn btn-outline">
                      إدارة الشابتر
                    </Link>
                  </div>
                </div>
              ))}

              {chapters.length === 0 ? (
                <p className="muted">لا توجد شابترات داخل هذا الكورس بعد.</p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
