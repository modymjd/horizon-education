import Link from "next/link"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type TeacherSummary = {
  active_students: number
  published_courses: number
  lessons_count: number
  teacher_revenue: number
  pending_requests: number
}

type TeacherCourseRow = {
  id: number
  slug: string
  title: string
  status: string
  lessons_count: number
  students_count: number
}

type AccessCodeRow = {
  id: number
  code_prefix: string | null
  lesson_title: string | null
  available_count: number
}

type ActivityRow = {
  text: string
  activity_time: string
}

async function getTeacherSummary(teacherId: number) {
  const rows = await query<TeacherSummary>(
    `
    SELECT
      COUNT(DISTINCT sla.student_id) AS active_students,
      COUNT(DISTINCT CASE WHEN c.status = 'published' THEN c.id END) AS published_courses,
      COUNT(DISTINCT l.id) AS lessons_count,
      COALESCE(SUM(DISTINCT p.teacher_amount), 0) AS teacher_revenue,
      COUNT(DISTINCT CASE WHEN r.status = 'pending' THEN r.id END) AS pending_requests
    FROM courses c
    LEFT JOIN chapters ch ON ch.course_id = c.id AND ch.deleted_at IS NULL
    LEFT JOIN lessons l ON l.chapter_id = ch.id AND l.deleted_at IS NULL
    LEFT JOIN student_lesson_access sla ON sla.lesson_id = l.id
    LEFT JOIN payments p ON p.lesson_id = l.id
    LEFT JOIN student_course_requests r ON r.course_id = c.id
    WHERE c.teacher_id = ?
      AND c.deleted_at IS NULL
    `,
    [teacherId]
  )

  return rows[0]
}

async function getTeacherCourses(teacherId: number) {
  return query<TeacherCourseRow>(
    `
    SELECT
      c.id,
      c.slug,
      c.title,
      c.status,
      COUNT(DISTINCT l.id) AS lessons_count,
      COUNT(DISTINCT sla.student_id) AS students_count
    FROM courses c
    LEFT JOIN chapters ch ON ch.course_id = c.id AND ch.deleted_at IS NULL
    LEFT JOIN lessons l ON l.chapter_id = ch.id AND l.deleted_at IS NULL
    LEFT JOIN student_lesson_access sla ON sla.lesson_id = l.id
    WHERE c.teacher_id = ?
      AND c.deleted_at IS NULL
    GROUP BY c.id, c.slug, c.title, c.status
    ORDER BY c.id DESC
    LIMIT 4
    `,
    [teacherId]
  )
}

async function getLatestCodes(teacherId: number) {
  return query<AccessCodeRow>(
    `
    SELECT
      MAX(ac.id) AS id,
      ac.code_prefix,
      l.title AS lesson_title,
      COUNT(*) AS available_count
    FROM access_codes ac
    JOIN lessons l ON l.id = ac.lesson_id
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    WHERE c.teacher_id = ?
      AND ac.status = 'new'
    GROUP BY ac.batch_id, ac.code_prefix, l.title
    ORDER BY id DESC
    LIMIT 3
    `,
    [teacherId]
  )
}

async function getActivities(teacherId: number) {
  return query<ActivityRow>(
    `
    SELECT
      CONCAT(u.full_name, ' requested to join ', c.title) AS text,
      DATE_FORMAT(r.requested_at, '%Y-%m-%d %H:%i') AS activity_time
    FROM student_course_requests r
    JOIN courses c ON c.id = r.course_id
    JOIN students s ON s.id = r.student_id
    JOIN users u ON u.id = s.user_id
    WHERE c.teacher_id = ?
    ORDER BY r.requested_at DESC
    LIMIT 5
    `,
    [teacherId]
  )
}

function money(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("en-US")} EGP`
}

function getStatusLabel(status: string) {
  if (status === "published") return "Published"
  if (status === "draft") return "Draft"
  if (status === "paused") return "Paused"
  if (status === "ended") return "Ended"
  return status
}

function getInitials(title: string) {
  return title.trim().slice(0, 1) || "C"
}

export default async function TeacherDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher" || !user.teacher_id) {
    redirect("/403")
  }

  const [summary, courses, codes, activities] = await Promise.all([
    getTeacherSummary(user.teacher_id),
    getTeacherCourses(user.teacher_id),
    getLatestCodes(user.teacher_id),
    getActivities(user.teacher_id),
  ])

  const stats = [
    [String(Number(summary?.active_students || 0)), "Active Students"],
    [String(Number(summary?.published_courses || 0)), "Published Courses"],
    [String(Number(summary?.lessons_count || 0)), "Available Lessons"],
    [money(summary?.teacher_revenue || 0), "Total Earnings"],
  ]

  const firstCourse = courses[0]

  return (
    <main>
      <SiteHeader />

      <div className="wrap">
        <section className="teacher-dashboard-grid">
          <div className="card teacher-welcome">
            <span className="eyebrow">Teacher Dashboard</span>
            <h1 className="welcome-title">Welcome, {user.full_name || "Teacher"} 👋</h1>
            <p className="muted mt-4 text-lg">
              You have {Number(summary?.pending_requests || 0)} pending join requests. Manage your lessons and access codes from here.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/teacher/courses" className="btn">
                Manage Courses
              </Link>

              <Link href="/teacher/requests" className="btn btn-outline">
                Join Requests
              </Link>

              <Link href="/teacher/students" className="btn btn-outline">
                My Students
              </Link>

              <Link href="/teacher/access-codes" className="btn btn-outline">
                Create Access Codes
              </Link>
            </div>
          </div>

          <div className="teacher-actions">
            <Link href="/teacher/requests" className="teacher-action-card">
              <span className="badge">Requests</span>
              <h3 className="mt-4 text-2xl font-black">Review student requests</h3>
              <p className="muted mt-2">Accept or reject join requests for your courses.</p>
            </Link>

            <Link href="/teacher/students" className="teacher-action-card">
              <span className="badge">Students</span>
              <h3 className="mt-4 text-2xl font-black">Accepted students</h3>
              <p className="muted mt-2">Review student contact details and guardian information.</p>
            </Link>

            <Link href="/teacher/access-codes" className="teacher-action-card">
              <span className="badge">Codes</span>
              <h3 className="mt-4 text-2xl font-black">Generate student codes</h3>
              <p className="muted mt-2">Create access codes for one lesson or multiple lessons.</p>
            </Link>
          </div>
        </section>

        <section className="teacher-stat-grid">
          {stats.map(([value, label]) => (
            <div className="card teacher-stat-card" key={label}>
              <b>{value}</b>
              <span className="muted font-bold">{label}</span>
            </div>
          ))}
        </section>

        <section className="card continue-card mt-7">
          <div>
            <span className="lesson-pill">Content Management</span>
            <h2 className="mt-5 font-[var(--display)] text-5xl font-bold leading-none">
              {firstCourse ? firstCourse.title : "Start managing your courses"}
            </h2>
            <p className="muted mt-4">
              {firstCourse
                ? "Open the course to add lessons, videos, assignments, and exams."
                : "When the admin assigns a course to you, it will appear here."}
            </p>
          </div>

          <Link href="/teacher/courses" className="btn">
            Manage Courses
          </Link>
        </section>
      </div>

      <section className="section">
        <div className="wrap grid gap-7 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="section-head">
              <span className="eyebrow">My Courses</span>
              <h2 className="h2">Courses and Lessons</h2>
            </div>

            <div className="grid gap-4">
              {courses.map((course) => (
                <div className="teacher-course-row" key={course.id}>
                  <div className="course-letter">{getInitials(course.title)}</div>

                  <div>
                    <h3 className="text-xl font-black">{course.title}</h3>
                    <p className="muted">
                      {course.lessons_count} lessons · {course.students_count} students · {getStatusLabel(course.status)}
                    </p>

                    <div className="progress-track mt-4">
                      <div
                        className="progress-fill"
                        style={{ width: `${course.lessons_count ? 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <Link href={`/teacher/courses/${course.id}/lessons`} className="btn btn-soft">
                    Open
                  </Link>
                </div>
              ))}

              {courses.length === 0 ? (
                <div className="card course-management-card">
                  <h3 className="text-2xl font-black">No courses yet</h3>
                  <p className="muted mt-2">
                    Courses assigned to this account will appear here.
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <aside>
            <div className="section-head">
              <span className="eyebrow">Access Codes</span>
              <h2 className="h2">Latest Codes</h2>
            </div>

            <div className="grid gap-4">
              {codes.map((item) => (
                <div className="card access-code-card" key={item.id}>
                  <h3 className="text-xl font-black">{item.lesson_title || "Unspecified lesson"}</h3>
                  <p className="muted mt-2">{item.available_count} available codes</p>
                  <span className="code-preview">{item.code_prefix || "HZ-***"}</span>
                </div>
              ))}

              {codes.length === 0 ? (
                <div className="card access-code-card">
                  <h3 className="text-xl font-black">No recent codes</h3>
                  <p className="muted mt-2">Create student access codes from the codes page.</p>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </section>

      <section className="section tint-section">
        <div className="wrap grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="eyebrow">Activity</span>
            <h2 className="h2">Latest Activity</h2>
            <p className="muted mt-5">
              A quick overview of what is happening inside your courses and lessons.
            </p>
          </div>

          <div className="activity-list">
            {activities.map((activity) => (
              <div className="activity-item" key={`${activity.text}-${activity.activity_time}`}>
                <div className="activity-dot" />
                <div>
                  <p className="font-bold">{activity.text}</p>
                  <p className="muted text-sm">{activity.activity_time}</p>
                </div>
              </div>
            ))}

            {activities.length === 0 ? (
              <div className="activity-item">
                <div className="activity-dot" />
                <div>
                  <p className="font-bold">No recent activity</p>
                  <p className="muted text-sm">Join requests and updates will appear here.</p>
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
