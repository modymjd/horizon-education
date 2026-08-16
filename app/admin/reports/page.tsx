import Link from "next/link"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type ReportSummary = {
  revenue_total: number
  platform_total: number
  teacher_total: number
  payments_count: number
  active_students: number
  courses_count: number
  unlocked_lessons: number
  total_lessons: number
  pending_requests: number
  accepted_requests: number
  rejected_requests: number
}

type TopCourse = {
  course_id: number
  course_title: string
  revenue: number
  students_count: number
}

type TopTeacher = {
  teacher_id: number
  teacher_name: string
  revenue: number
  courses_count: number
}

type RecentPayment = {
  id: number
  invoice_number: string
  student_name: string
  lesson_title: string
  amount_paid: number
}

async function getReportSummary() {
  const rows = await query<ReportSummary>(
    `
    SELECT
      (SELECT COALESCE(SUM(amount_paid), 0) FROM payments WHERE status = 'completed') AS revenue_total,
      (SELECT COALESCE(SUM(platform_amount), 0) FROM payments WHERE status = 'completed') AS platform_total,
      (SELECT COALESCE(SUM(teacher_amount), 0) FROM payments WHERE status = 'completed') AS teacher_total,
      (SELECT COUNT(*) FROM payments WHERE status = 'completed') AS payments_count,
      (SELECT COUNT(DISTINCT student_id) FROM student_lesson_access) AS active_students,
      (SELECT COUNT(*) FROM courses WHERE deleted_at IS NULL AND status = 'published') AS courses_count,
      (SELECT COUNT(*) FROM student_lesson_access) AS unlocked_lessons,
      (SELECT COUNT(*) FROM lessons WHERE deleted_at IS NULL AND status = 'published') AS total_lessons,
      (SELECT COUNT(*) FROM student_course_requests WHERE status = 'pending') AS pending_requests,
      (SELECT COUNT(*) FROM student_course_requests WHERE status = 'accepted') AS accepted_requests,
      (SELECT COUNT(*) FROM student_course_requests WHERE status = 'rejected') AS rejected_requests
    `
  )

  return rows[0]
}

async function getTopCourses() {
  return query<TopCourse>(
    `
    SELECT
      c.id AS course_id,
      c.title AS course_title,
      COALESCE(SUM(p.amount_paid), 0) AS revenue,
      COUNT(DISTINCT p.student_id) AS students_count
    FROM courses c
    JOIN chapters ch ON ch.course_id = c.id
    JOIN lessons l ON l.chapter_id = ch.id
    LEFT JOIN payments p ON p.lesson_id = l.id AND p.status = 'completed'
    WHERE c.deleted_at IS NULL
    GROUP BY c.id, c.title
    ORDER BY revenue DESC, students_count DESC
    LIMIT 5
    `
  )
}

async function getTopTeachers() {
  return query<TopTeacher>(
    `
    SELECT
      t.id AS teacher_id,
      u.full_name AS teacher_name,
      COALESCE(SUM(p.teacher_amount), 0) AS revenue,
      COUNT(DISTINCT c.id) AS courses_count
    FROM teachers t
    JOIN users u ON u.id = t.user_id
    LEFT JOIN courses c ON c.teacher_id = t.id AND c.deleted_at IS NULL
    LEFT JOIN chapters ch ON ch.course_id = c.id
    LEFT JOIN lessons l ON l.chapter_id = ch.id
    LEFT JOIN payments p ON p.lesson_id = l.id AND p.status = 'completed'
    WHERE u.deleted_at IS NULL
    GROUP BY t.id, u.full_name
    ORDER BY revenue DESC, courses_count DESC
    LIMIT 5
    `
  )
}

async function getRecentPayments() {
  return query<RecentPayment>(
    `
    SELECT
      p.id,
      p.invoice_number,
      u.full_name AS student_name,
      l.title AS lesson_title,
      p.amount_paid
    FROM payments p
    JOIN students s ON s.id = p.student_id
    JOIN users u ON u.id = s.user_id
    JOIN lessons l ON l.id = p.lesson_id
    WHERE p.status = 'completed'
    ORDER BY p.paid_at DESC
    LIMIT 5
    `
  )
}

function money(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("en-US")} EGP`
}

function percent(value: number, total: number) {
  if (!total) return 0
  return Math.round((Number(value) / Number(total)) * 100)
}

export default async function AdminReportsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "admin") {
    redirect("/403")
  }

  const [summary, topCourses, topTeachers, recentPayments] = await Promise.all([
    getReportSummary(),
    getTopCourses(),
    getTopTeachers(),
    getRecentPayments(),
  ])

  const completionRate = percent(
    Number(summary?.unlocked_lessons || 0),
    Number(summary?.total_lessons || 0)
  )

  const reports = [
    [money(summary?.revenue_total || 0), "Total Revenue"],
    [String(Number(summary?.active_students || 0)), "Active Students"],
    [String(Number(summary?.courses_count || 0)), "Available Courses"],
    [`${completionRate}%`, "Lesson Unlock Rate"],
  ]

  const bars = [
    Number(summary?.pending_requests || 0),
    Number(summary?.accepted_requests || 0),
    Number(summary?.rejected_requests || 0),
    Number(summary?.payments_count || 0),
  ]
  const maxBar = Math.max(...bars, 1)

  return (
    <main>
      <SiteHeader />

      <section className="admin-page-hero">
        <div className="wrap">
          <span className="eyebrow">Admin Dashboard</span>
          <h1 className="h1">Reports</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            Monitor platform performance, revenue, courses, and student progress.
          </p>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap">
          <div className="toolbar">
            <div>
              <span className="eyebrow">Overview</span>
              <h2 className="text-3xl font-black">Performance Summary</h2>
            </div>

            <Link href="/admin" className="btn btn-outline">
              Back to Admin Dashboard
            </Link>
          </div>

          <div className="report-grid">
            {reports.map(([value, label]) => (
              <div className="card report-card" key={label}>
                <b>{value}</b>
                <span className="muted font-bold">{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-7 grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="card chart-card">
              <span className="eyebrow">Requests and Payments</span>
              <h2 className="text-3xl font-black">Platform Indicators</h2>

              <div className="fake-chart mt-6">
                {bars.map((value, index) => (
                  <div
                    className="chart-bar"
                    style={{ height: `${Math.max(8, (value / maxBar) * 100)}%` }}
                    key={index}
                    title={String(value)}
                  />
                ))}
              </div>

              <div className="mt-5 grid gap-2 text-sm font-bold">
                <p>Pending requests: {summary?.pending_requests || 0}</p>
                <p>Accepted requests: {summary?.accepted_requests || 0}</p>
                <p>Rejected requests: {summary?.rejected_requests || 0}</p>
                <p>Payments count: {summary?.payments_count || 0}</p>
              </div>
            </div>

            <div className="card admin-panel">
              <span className="eyebrow">Revenue</span>
              <h2 className="text-3xl font-black">Revenue Distribution</h2>

              <div className="admin-row-list mt-6">
                <div className="payment-row">
                  <div>
                    <h3 className="font-black">Total Revenue</h3>
                    <p className="muted text-sm">All completed payments</p>
                  </div>
                  <div className="amount">{money(summary?.revenue_total || 0)}</div>
                </div>

                <div className="payment-row">
                  <div>
                    <h3 className="font-black">Platform Share</h3>
                    <p className="muted text-sm">Platform amount</p>
                  </div>
                  <div className="amount">{money(summary?.platform_total || 0)}</div>
                </div>

                <div className="payment-row">
                  <div>
                    <h3 className="font-black">Teacher Share</h3>
                    <p className="muted text-sm">Teacher amount</p>
                  </div>
                  <div className="amount">{money(summary?.teacher_total || 0)}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-7 lg:grid-cols-2">
            <div className="card admin-panel">
              <span className="eyebrow">Top Performance</span>
              <h2 className="text-3xl font-black">Top Courses</h2>

              <div className="admin-row-list mt-6">
                {topCourses.map((course) => (
                  <div className="payment-row" key={course.course_id}>
                    <div>
                      <h3 className="font-black">{course.course_title}</h3>
                      <p className="muted text-sm">{course.students_count} students</p>
                    </div>
                    <div className="amount">{money(course.revenue)}</div>
                  </div>
                ))}

                {topCourses.length === 0 ? <p className="muted">No course data yet.</p> : null}
              </div>
            </div>

            <div className="card admin-panel">
              <span className="eyebrow">Teachers</span>
              <h2 className="text-3xl font-black">Top Teachers</h2>

              <div className="admin-row-list mt-6">
                {topTeachers.map((teacher) => (
                  <div className="payment-row" key={teacher.teacher_id}>
                    <div>
                      <h3 className="font-black">{teacher.teacher_name}</h3>
                      <p className="muted text-sm">{teacher.courses_count} courses</p>
                    </div>
                    <div className="amount">{money(teacher.revenue)}</div>
                  </div>
                ))}

                {topTeachers.length === 0 ? <p className="muted">No teacher data yet.</p> : null}
              </div>
            </div>
          </div>

          <div className="card admin-panel mt-7">
            <div className="toolbar">
              <div>
                <span className="eyebrow">Payments</span>
                <h2 className="text-3xl font-black">Latest Payments</h2>
              </div>

              <Link href="/admin/payments" className="btn btn-soft">
                Open Payments
              </Link>
            </div>

            <div className="grid gap-3">
              {recentPayments.map((payment) => (
                <div className="payment-row" key={payment.id}>
                  <div>
                    <h3 className="font-black">{payment.invoice_number}</h3>
                    <p className="muted text-sm">
                      {payment.student_name} · {payment.lesson_title}
                    </p>
                  </div>
                  <div className="amount">{money(payment.amount_paid)}</div>
                </div>
              ))}

              {recentPayments.length === 0 ? <p className="muted">No payments yet.</p> : null}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
