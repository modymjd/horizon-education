export const dynamic = "force-dynamic"
export const revalidate = 0

import Link from "next/link"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type TeacherCourseRow = {
  id: number
  slug: string
  title: string
  short_description: string | null
  status: string
  lessons_count: number
  students_count: number
  teacher_revenue: number
}

async function getTeacherCourses(teacherId: number) {
  return query<TeacherCourseRow>(
    `
    SELECT
      c.id,
      c.slug,
      c.title,
      c.short_description,
      c.status,
      COUNT(DISTINCT CASE WHEN l.deleted_at IS NULL THEN l.id END) AS lessons_count,
      COUNT(DISTINCT sla.student_id) AS students_count,
      COALESCE(SUM(DISTINCT p.teacher_amount), 0) AS teacher_revenue
    FROM courses c
    LEFT JOIN chapters ch ON ch.course_id = c.id
    LEFT JOIN lessons l ON l.chapter_id = ch.id
    LEFT JOIN student_lesson_access sla ON sla.lesson_id = l.id
    LEFT JOIN payments p ON p.lesson_id = l.id
    WHERE c.teacher_id = ?
      AND c.deleted_at IS NULL
    GROUP BY
      c.id,
      c.slug,
      c.title,
      c.short_description,
      c.status
    ORDER BY c.id DESC
    `,
    [teacherId]
  )
}

function getStatusLabel(status: string) {
  if (status === "published") return "Published"
  if (status === "draft") return "Draft"
  if (status === "archived") return "Archived"
  return status
}

function getStatusClass(status: string) {
  if (status === "published") return "status-published"
  if (status === "draft") return "status-draft"
  if (status === "archived") return "status-archived"
  return "status-archived"
}

function getInitials(title: string) {
  return title.trim().slice(0, 1) || "C"
}

function money(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("en-US")} EGP`
}

export default async function TeacherCoursesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher" || !user.teacher_id) {
    redirect("/403")
  }

  const courses = await getTeacherCourses(user.teacher_id)

  const totalLessons = courses.reduce(
    (sum, course) => sum + Number(course.lessons_count || 0),
    0
  )

  const totalStudents = courses.reduce(
    (sum, course) => sum + Number(course.students_count || 0),
    0
  )

  const totalRevenue = courses.reduce(
    (sum, course) => sum + Number(course.teacher_revenue || 0),
    0
  )

  return (
    <main>
      <SiteHeader />

      <section className="teacher-page-hero">
        <div className="wrap">
          <span className="eyebrow">Teacher Dashboard</span>
          <h1 className="h1">Manage Courses</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            Review your courses, add lessons, and track students and revenue.
          </p>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap">
          <div className="teacher-stat-grid mb-6">
            <div className="card teacher-stat-card">
              <b>{courses.length}</b>
              <span className="muted font-bold">Courses</span>
            </div>

            <div className="card teacher-stat-card">
              <b>{totalLessons}</b>
              <span className="muted font-bold">Lessons</span>
            </div>

            <div className="card teacher-stat-card">
              <b>{totalStudents}</b>
              <span className="muted font-bold">Students with access</span>
            </div>

            <div className="card teacher-stat-card">
              <b>{money(totalRevenue)}</b>
              <span className="muted font-bold">Total Earnings</span>
            </div>
          </div>

          <div className="toolbar">
            <div className="search-row">
              <input className="input" placeholder="Search courses..." />
              <select className="input" defaultValue="all">
                <option value="all">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <Link href="/teacher" className="btn btn-outline">
              Back to Teacher Dashboard
            </Link>
          </div>

          <div className="grid gap-5">
            {courses.map((course) => (
              <div className="card course-management-card" key={course.id}>
                <div className="course-management-head">
                  <div>
                    <span className={`status-pill ${getStatusClass(course.status)}`}>
                      {getStatusLabel(course.status)}
                    </span>

                    <div className="mt-4 flex items-center gap-4">
                      <div className="course-letter">{getInitials(course.title)}</div>

                      <div>
                        <h2 className="text-3xl font-black">{course.title}</h2>
                        <p className="muted mt-1">
                          {course.short_description || "No short description yet."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="course-actions">
                    <Link href={`/courses/${course.slug}`} className="btn btn-soft">
                      Preview
                    </Link>

                    <Link
                      href={`/teacher/courses/${course.id}/lessons`}
                      className="btn btn-outline"
                    >
                      View Lessons
                    </Link>

                    <Link
                      href={`/teacher/courses/${course.id}/lessons/new`}
                      className="btn btn-outline"
                    >
                      Add Lesson
                    </Link>
                  </div>
                </div>

                <div className="course-metrics">
                  <div className="metric-mini">
                    <b>{course.lessons_count}</b>
                    <span className="muted">Lessons</span>
                  </div>

                  <div className="metric-mini">
                    <b>{course.students_count}</b>
                    <span className="muted">Students</span>
                  </div>

                  <div className="metric-mini">
                    <b>{money(course.teacher_revenue)}</b>
                    <span className="muted">Earnings</span>
                  </div>
                </div>
              </div>
            ))}

            {courses.length === 0 ? (
              <div className="card course-management-card">
                <h2 className="text-2xl font-black">No courses yet</h2>
                <p className="muted mt-2">
                  Courses assigned to this teacher will appear here.
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
