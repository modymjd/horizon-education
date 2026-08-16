import Link from "next/link"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type StudentSummary = {
  student_id: number
  full_name: string
  active_lessons: number
  active_courses: number
}

type StudentLesson = {
  lesson_id: number
  lesson_title: string
  course_title: string
  course_slug: string
  chapter_title: string
  access_until: string | null
  created_at: string | null
}

type CourseProgress = {
  course_id: number
  course_title: string
  course_slug: string
  total_lessons: number
  unlocked_lessons: number
}

type CourseRequestNotification = {
  id: number
  status: "pending" | "accepted" | "rejected"
  course_title: string
  requested_at: string
  reviewed_at: string | null
}

async function getStudentSummary(studentId: number) {
  const rows = await query<StudentSummary>(
    `
    SELECT
      s.id AS student_id,
      u.full_name,
      COUNT(DISTINCT sla.lesson_id) AS active_lessons,
      COUNT(DISTINCT c.id) AS active_courses
    FROM students s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN student_lesson_access sla ON sla.student_id = s.id
    LEFT JOIN lessons l ON l.id = sla.lesson_id
    LEFT JOIN chapters ch ON ch.id = l.chapter_id
    LEFT JOIN courses c ON c.id = ch.course_id
    WHERE s.id = ?
    GROUP BY s.id, u.full_name
    LIMIT 1
    `,
    [studentId]
  )

  return rows[0]
}

async function getStudentLessons(studentId: number) {
  return query<StudentLesson>(
    `
    SELECT
      l.id AS lesson_id,
      l.title AS lesson_title,
      c.title AS course_title,
      c.slug AS course_slug,
      ch.title AS chapter_title,
      DATE_FORMAT(sla.access_until, '%Y-%m-%d') AS access_until,
      DATE_FORMAT(sla.created_at, '%Y-%m-%d') AS created_at
    FROM student_lesson_access sla
    JOIN lessons l ON l.id = sla.lesson_id
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    WHERE sla.student_id = ?
    ORDER BY sla.id DESC
    LIMIT 6
    `,
    [studentId]
  )
}

async function getCourseProgress(studentId: number) {
  return query<CourseProgress>(
    `
    SELECT
      c.id AS course_id,
      c.title AS course_title,
      c.slug AS course_slug,
      COUNT(DISTINCT all_lessons.id) AS total_lessons,
      COUNT(DISTINCT sla.lesson_id) AS unlocked_lessons
    FROM courses c
    JOIN chapters ch ON ch.course_id = c.id
    JOIN lessons all_lessons ON all_lessons.chapter_id = ch.id
    JOIN student_lesson_access sla ON sla.lesson_id = all_lessons.id
    WHERE sla.student_id = ?
    GROUP BY c.id, c.title, c.slug
    ORDER BY c.id DESC
    `,
    [studentId]
  )
}

async function getCourseRequestNotifications(studentId: number) {
  return query<CourseRequestNotification>(
    `
    SELECT
      r.id,
      r.status,
      c.title AS course_title,
      DATE_FORMAT(r.requested_at, '%Y-%m-%d %H:%i') AS requested_at,
      DATE_FORMAT(r.reviewed_at, '%Y-%m-%d %H:%i') AS reviewed_at
    FROM student_course_requests r
    JOIN courses c ON c.id = r.course_id
    WHERE r.student_id = ?
      AND c.deleted_at IS NULL
    ORDER BY r.requested_at DESC
    LIMIT 5
    `,
    [studentId]
  )
}

function getProgressPercent(unlocked: number, total: number) {
  if (!total) return 0
  return Math.round((Number(unlocked) / Number(total)) * 100)
}

function getRequestTitle(status: string) {
  if (status === "pending") return "Your request is pending review"
  if (status === "accepted") return "Your request was accepted"
  if (status === "rejected") return "Your request was not accepted"
  return "Course request update"
}

function getRequestMessage(notification: CourseRequestNotification) {
  if (notification.status === "pending") {
    return `Your request to join ${notification.course_title} is pending teacher review.`
  }

  if (notification.status === "accepted") {
    return `You were accepted into ${notification.course_title}. Contact the teacher to get your lesson access code.`
  }

  if (notification.status === "rejected") {
    return `You were not accepted into ${notification.course_title}. You can request another course or contact administration.`
  }

  return `There is an update on your request for ${notification.course_title}.`
}

function ProgressRing({ value }: { value: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const dash = (value / 100) * circumference

  return (
    <div className="ring">
      <svg width="68" height="68" viewBox="0 0 68 68">
        <circle className="ring-bg" cx="34" cy="34" r={radius} />
        <circle
          className="ring-fg"
          cx="34"
          cy="34"
          r={radius}
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <div className="ring-label">{value}%</div>
    </div>
  )
}

export default async function StudentDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "student" || !user.student_id) {
    redirect("/403")
  }

  const [summary, lessons, progress, notifications] = await Promise.all([
    getStudentSummary(user.student_id),
    getStudentLessons(user.student_id),
    getCourseProgress(user.student_id),
    getCourseRequestNotifications(user.student_id),
  ])

  const latestLesson = lessons[0]
  const studentName = summary?.full_name || user.full_name || "Student"
  const activeLessons = Number(summary?.active_lessons || 0)
  const activeCourses = Number(summary?.active_courses || 0)
  const unreadLikeNotifications = notifications.filter(
    (item) => item.status === "accepted" || item.status === "rejected"
  ).length

  const stats = [
    [String(activeCourses), "Active Courses"],
    [String(activeLessons), "Available Lessons"],
    [String(progress.length), "Courses in Progress"],
    [String(unreadLikeNotifications), "Request Notifications"],
  ]

  return (
    <main>
      <SiteHeader />

      <div className="wrap">
        <section className="dashboard-welcome">
          <div className="card welcome-box">
            <h1 className="welcome-title">Welcome, {studentName} 👋</h1>
            <p className="muted mt-4 text-lg">
              {latestLesson
                ? `Your latest activated lesson: ${latestLesson.lesson_title}.`
                : "Request to join a suitable course or activate an access code to start studying."}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/student/activate" className="btn">
                Activate New Code
              </Link>

              <Link href="/subjects" className="btn btn-outline">
                Browse Courses
              </Link>
            </div>
          </div>

          <div className="quick-stats">
            {stats.map(([value, label]) => (
              <div className="qstat" key={label}>
                <b>{value}</b>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        {notifications.length > 0 ? (
          <section className="card mt-7 p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="eyebrow">Notifications</span>
                <h2 className="text-3xl font-black">Course Request Updates</h2>
              </div>

              <Link href="/subjects" className="btn btn-outline">
                Browse Courses
              </Link>
            </div>

            <div className="mt-6 grid gap-4">
              {notifications.map((notification) => (
                <div
                  className="rounded-2xl border border-[var(--line)] bg-[var(--cream-2)] p-4"
                  key={notification.id}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-black">
                        {getRequestTitle(notification.status)}
                      </h3>
                      <p className="muted mt-2">
                        {getRequestMessage(notification)}
                      </p>
                      <p className="muted mt-2 text-sm">
                        Requested at: {notification.requested_at}
                        {notification.reviewed_at
                          ? ` — Reviewed at: ${notification.reviewed_at}`
                          : ""}
                      </p>
                    </div>

                    <span className="badge">
                      {notification.status === "pending"
                        ? "Pending"
                        : notification.status === "accepted"
                          ? "Accepted"
                          : "Rejected"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="card continue-card mt-7">
          <div>
            <span className="lesson-pill">
              {latestLesson ? latestLesson.course_title : "Start Now"}
            </span>
            <h2 className="mt-5 font-[var(--display)] text-5xl font-bold leading-none">
              {latestLesson ? latestLesson.lesson_title : "Activate your first lesson"}
            </h2>
            <p className="muted mt-4">
              {latestLesson
                ? `${latestLesson.chapter_title} — Activated on ${latestLesson.created_at || "Not specified"}`
                : "Request to join a suitable course. After teacher approval, use the access code sent to you."}
            </p>
          </div>

          <div>
            {latestLesson ? (
              <Link href={`/student/lessons/${latestLesson.lesson_id}`} className="btn">
                Open Lesson
              </Link>
            ) : (
              <Link href="/subjects" className="btn">
                Browse Courses
              </Link>
            )}
          </div>
        </section>
      </div>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Your Progress</span>
            <h2 className="h2">Your level in each course</h2>
          </div>

          <div className="grid-auto">
            {progress.map((course) => {
              const percent = getProgressPercent(
                Number(course.unlocked_lessons),
                Number(course.total_lessons)
              )

              return (
                <div className="card progress-card" key={course.course_id}>
                  <div className="progress-card-head">
                    <ProgressRing value={percent} />
                    <div>
                      <h3>{course.course_title}</h3>
                      <p className="muted">
                        {course.unlocked_lessons} of {course.total_lessons} activated lessons
                      </p>
                    </div>
                  </div>

                  <div className="progress-track mt-6">
                    <div
                      className="progress-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <Link href={`/courses/${course.course_slug}`} className="btn btn-soft mt-6">
                    Open Course
                  </Link>
                </div>
              )
            })}

            {progress.length === 0 ? (
              <div className="card progress-card">
                <h3>No active courses yet</h3>
                <p className="muted mt-2">
                  Request to join a suitable course. After teacher approval, activate your access code to start seeing progress here.
                </p>
                <Link href="/subjects" className="btn mt-6">
                  Browse Courses
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section tint-section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Your Lessons</span>
            <h2 className="h2">Latest activated lessons</h2>
          </div>

          <div className="grid gap-4">
            {lessons.map((lesson) => (
              <div className="teacher-course-row" key={lesson.lesson_id}>
                <div className="course-letter">
                  {lesson.course_title.slice(0, 1)}
                </div>

                <div>
                  <h3 className="text-xl font-black">{lesson.lesson_title}</h3>
                  <p className="muted">
                    {lesson.course_title} — {lesson.chapter_title}
                  </p>
                  <p className="muted text-sm">
                    Activated: {lesson.created_at || "Not specified"}
                    {lesson.access_until ? ` · Available until: ${lesson.access_until}` : ""}
                  </p>
                </div>

                <Link href={`/student/lessons/${lesson.lesson_id}`} className="btn btn-soft">
                  Open Lesson
                </Link>
              </div>
            ))}

            {lessons.length === 0 ? (
              <div className="card course-management-card">
                <h3 className="text-2xl font-black">No activated lessons yet</h3>
                <p className="muted mt-2">
                  Once you activate a code, the lesson will appear here.
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
