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
  chapter_id: number
  chapter_title: string
  chapter_sort_order: number
  lesson_sort_order: number
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
      ch.id AS chapter_id,
      ch.title AS chapter_title,
      ch.sort_order AS chapter_sort_order,
      l.sort_order AS lesson_sort_order,
      COUNT(DISTINCT lv.id) AS videos_count,
      COUNT(DISTINCT la.id) AS assignments_count,
      COUNT(DISTINCT le.id) AS exams_count,
      COUNT(DISTINCT sla.student_id) AS students_count
    FROM chapters ch
    LEFT JOIN lessons l
      ON l.chapter_id = ch.id
      AND l.deleted_at IS NULL
    LEFT JOIN lesson_videos lv ON lv.lesson_id = l.id
    LEFT JOIN lesson_assignments la ON la.lesson_id = l.id
    LEFT JOIN lesson_exams le ON le.lesson_id = l.id
    LEFT JOIN student_lesson_access sla ON sla.lesson_id = l.id
    WHERE ch.course_id = ?
      AND ch.deleted_at IS NULL
    GROUP BY
      l.id,
      l.title,
      l.description,
      l.price,
      l.status,
      ch.id,
      ch.title,
      ch.sort_order,
      l.sort_order
    ORDER BY ch.sort_order ASC, ch.id ASC, l.sort_order ASC, l.id ASC
    `,
    [courseId]
  )
}

function getStatusLabel(status: string | null) {
  if (status === "published") return "Published"
  if (status === "draft") return "Draft"
  if (status === "hidden") return "Hidden"
  if (status === "archived") return "Archived"
  return status || "No status"
}

function money(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("en-US")} EGP`
}

function groupByChapter(lessons: LessonRow[]) {
  const groups = new Map<
    number,
    {
      chapter_id: number
      chapter_title: string
      chapter_sort_order: number
      lessons: LessonRow[]
    }
  >()

  for (const item of lessons) {
    if (!groups.has(item.chapter_id)) {
      groups.set(item.chapter_id, {
        chapter_id: item.chapter_id,
        chapter_title: item.chapter_title,
        chapter_sort_order: item.chapter_sort_order,
        lessons: [],
      })
    }

    if (item.id) {
      groups.get(item.chapter_id)?.lessons.push(item)
    }
  }

  return Array.from(groups.values()).sort((a, b) => {
    return a.chapter_sort_order - b.chapter_sort_order || a.chapter_id - b.chapter_id
  })
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

  const lessonGroups = groupByChapter(lessons)
  const realLessons = lessons.filter((lesson) => lesson.id)

  return (
    <main>
      <SiteHeader />

      <section className="teacher-page-hero">
        <div className="wrap">
          <span className="eyebrow">Teacher dashboard</span>
          <h1 className="h1">Course lessons</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            Manage all lessons for {course.title}: videos, assignments, and exams.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/teacher/courses" className="btn">
              Back to courses
            </Link>

            <Link href={`/teacher/courses/${course.id}/lessons/new`} className="btn btn-outline">
              Add new lesson
            </Link>

            <Link href={`/courses/${course.slug}`} className="btn btn-outline">
              Preview course
            </Link>
          </div>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap">
          <div className="teacher-stat-grid mb-6">
            <div className="card teacher-stat-card">
              <b>{realLessons.length}</b>
              <span className="muted font-bold">Lessons</span>
            </div>

            <div className="card teacher-stat-card">
              <b>{realLessons.reduce((sum, lesson) => sum + Number(lesson.videos_count || 0), 0)}</b>
              <span className="muted font-bold">Videos</span>
            </div>

            <div className="card teacher-stat-card">
              <b>{realLessons.reduce((sum, lesson) => sum + Number(lesson.assignments_count || 0), 0)}</b>
              <span className="muted font-bold">Assignments</span>
            </div>

            <div className="card teacher-stat-card">
              <b>{realLessons.reduce((sum, lesson) => sum + Number(lesson.exams_count || 0), 0)}</b>
              <span className="muted font-bold">Exams</span>
            </div>
          </div>

          <div className="grid gap-7">
            {lessonGroups.map((group, index) => (
              <div className="card course-management-card" key={group.chapter_id}>
                <div className="course-management-head">
                  <div>
                    <span className="badge">Chapter {index + 1}</span>
                    <h2 className="mt-4 text-3xl font-black">{group.chapter_title}</h2>
                    <p className="muted mt-2">
                      Lessons in this chapter: {group.lessons.length}
                    </p>
                  </div>

                  <Link href={`/teacher/courses/${course.id}/lessons/new`} className="btn btn-outline">
                    Add lesson to this course
                  </Link>
                </div>

                <div className="mt-6 grid gap-5">
                  {group.lessons.map((lesson) => (
                    <div
                      className="rounded-2xl border border-[var(--line)] bg-[var(--cream-2)] p-5"
                      key={lesson.id}
                    >
                      <div className="course-management-head">
                        <div>
                          <span className="status-pill status-published">
                            {getStatusLabel(lesson.status)}
                          </span>

                          <div className="mt-4">
                            <h3 className="text-2xl font-black">{lesson.title}</h3>
                            <p className="muted mt-1">
                              {lesson.description || "No description has been added for this lesson yet."}
                            </p>
                            <p className="muted mt-2 text-sm">
                              Price: {money(lesson.price)} — Lesson order: {lesson.lesson_sort_order}
                            </p>
                          </div>
                        </div>

                        <div className="course-actions">
                          <Link href={`/teacher/lessons/${lesson.id}`} className="btn btn-outline">
                            Manage lesson
                          </Link>

                          <Link href={`/student/lessons/${lesson.id}`} className="btn btn-soft">
                            Student preview
                          </Link>
                        </div>
                      </div>

                      <div className="course-metrics">
                        <div className="metric-mini">
                          <b>{lesson.videos_count}</b>
                          <span className="muted">Videos</span>
                        </div>

                        <div className="metric-mini">
                          <b>{lesson.assignments_count}</b>
                          <span className="muted">Assignments</span>
                        </div>

                        <div className="metric-mini">
                          <b>{lesson.exams_count}</b>
                          <span className="muted">Exams</span>
                        </div>

                        <div className="metric-mini">
                          <b>{lesson.students_count}</b>
                          <span className="muted">Students</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {group.lessons.length === 0 ? (
                    <div className="rounded-2xl border border-[var(--line)] bg-[var(--cream-2)] p-5">
                      <h3 className="text-2xl font-black">No lessons in this chapter yet</h3>
                      <p className="muted mt-2">
                        You can add a new lesson and select this chapter from the add lesson page.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {lessonGroups.length === 0 ? (
              <div className="card course-management-card">
                <h2 className="text-2xl font-black">No chapters or lessons yet</h2>
                <p className="muted mt-2">
                  Ask the admin to add a chapter to this course first.
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
