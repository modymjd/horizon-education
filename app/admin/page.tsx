import Link from "next/link"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type SummaryRow = {
  students_count: number
  teachers_count: number
  courses_count: number
  revenue_total: number
  pending_requests: number
}

type TeacherRow = {
  id: number
  full_name: string
  courses_count: number
  students_count: number
}

type StudentRow = {
  id: number
  full_name: string
  student_code: string
  education_type_name: string | null
  stage_name: string | null
  grade_name: string | null
}

type PaymentRow = {
  id: number
  invoice_number: string
  student_name: string
  lesson_title: string
  amount_paid: number
}

type ActivityRow = {
  text: string
  activity_time: string
}

const navCards = [
  ["Teachers", "Add and edit teacher profiles", "/admin/teachers"],
  ["Students", "Manage students and accounts", "/admin/students"],
  ["Courses", "Manage courses and lessons", "/admin/courses"],
  ["Payments", "Record and review payments", "/admin/payments"],
  ["Reports", "Platform statistics and revenue", "/admin/reports"],
  ["Settings", "General platform settings", "/admin/settings"],
]

async function getSummary() {
  const rows = await query<SummaryRow>(
    `
    SELECT
      (SELECT COUNT(*) FROM students) AS students_count,
      (SELECT COUNT(*) FROM teachers t JOIN users u ON u.id = t.user_id WHERE u.deleted_at IS NULL) AS teachers_count,
      (SELECT COUNT(*) FROM courses WHERE deleted_at IS NULL) AS courses_count,
      (SELECT COALESCE(SUM(amount_paid), 0) FROM payments WHERE status = 'completed') AS revenue_total,
      (SELECT COUNT(*) FROM student_course_requests WHERE status = 'pending') AS pending_requests
    `
  )

  return rows[0]
}

async function getLatestTeachers() {
  return query<TeacherRow>(
    `
    SELECT
      t.id,
      u.full_name,
      COUNT(DISTINCT c.id) AS courses_count,
      COUNT(DISTINCT sla.student_id) AS students_count
    FROM teachers t
    JOIN users u ON u.id = t.user_id
    LEFT JOIN courses c ON c.teacher_id = t.id AND c.deleted_at IS NULL
    LEFT JOIN chapters ch ON ch.course_id = c.id AND ch.deleted_at IS NULL
    LEFT JOIN lessons l ON l.chapter_id = ch.id AND l.deleted_at IS NULL
    LEFT JOIN student_lesson_access sla ON sla.lesson_id = l.id
    WHERE u.deleted_at IS NULL
    GROUP BY t.id, u.full_name
    ORDER BY t.id DESC
    LIMIT 3
    `
  )
}

async function getLatestStudents() {
  return query<StudentRow>(
    `
    SELECT
      s.id,
      s.student_code,
      u.full_name,
      et.name AS education_type_name,
      es.name AS stage_name,
      g.name AS grade_name
    FROM students s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN education_types et ON et.id = s.education_type_id
    LEFT JOIN educational_stages es ON es.id = s.stage_id
    LEFT JOIN grades g ON g.id = s.grade_id
    WHERE u.deleted_at IS NULL
    ORDER BY s.id DESC
    LIMIT 3
    `
  )
}

async function getLatestPayments() {
  return query<PaymentRow>(
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
    LIMIT 3
    `
  )
}

async function getActivities() {
  return query<ActivityRow>(
    `
    SELECT
      CONCAT(u.full_name, ' requested to join ', c.title) AS text,
      DATE_FORMAT(r.requested_at, '%Y-%m-%d %H:%i') AS activity_time
    FROM student_course_requests r
    JOIN students s ON s.id = r.student_id
    JOIN users u ON u.id = s.user_id
    JOIN courses c ON c.id = r.course_id
    ORDER BY r.requested_at DESC
    LIMIT 4
    `
  )
}

function money(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("en-US")} EGP`
}

function getInitials(name: string) {
  return name.trim().slice(0, 1) || "A"
}

export default async function AdminDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "admin") {
    redirect("/403")
  }

  const [summary, teachers, students, payments, activities] = await Promise.all([
    getSummary(),
    getLatestTeachers(),
    getLatestStudents(),
    getLatestPayments(),
    getActivities(),
  ])

  const stats = [
    [String(Number(summary?.students_count || 0)), "Students"],
    [String(Number(summary?.teachers_count || 0)), "Teachers"],
    [String(Number(summary?.courses_count || 0)), "Courses"],
    [money(summary?.revenue_total || 0), "Revenue"],
  ]

  return (
    <main>
      <SiteHeader />

      <div className="wrap">
        <section className="admin-dashboard-grid">
          <div className="card admin-welcome">
            <span className="eyebrow">Admin Dashboard</span>
            <h1 className="welcome-title">Welcome, {user.full_name || "Admin"} 👋</h1>
            <p className="muted mt-4 text-lg">
              Track platform performance, teachers, students, payments, and courses from one place.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/admin/teachers" className="btn">
                Manage Teachers
              </Link>
              <Link href="/admin/payments" className="btn btn-outline">
                Record Payment
              </Link>
              <Link href="/admin/courses" className="btn btn-outline">
                Manage Courses
              </Link>
            </div>
          </div>

          <div className="admin-actions">
            <Link href="/admin/courses" className="admin-action-card">
              <span className="badge">Courses</span>
              <h3 className="mt-4 text-2xl font-black">Review published courses</h3>
              <p className="muted mt-2">Monitor course status and lessons available to students.</p>
            </Link>

            <Link href="/admin/reports" className="admin-action-card">
              <span className="badge">Reports</span>
              <h3 className="mt-4 text-2xl font-black">Statistics and revenue</h3>
              <p className="muted mt-2">Monitor platform growth and monthly payments.</p>
            </Link>
          </div>
        </section>

        <section className="admin-stat-grid">
          {stats.map(([value, label]) => (
            <div className="card admin-stat-card" key={label}>
              <b>{value}</b>
              <span className="muted font-bold">{label}</span>
            </div>
          ))}
        </section>

        {Number(summary?.pending_requests || 0) > 0 ? (
          <section className="card mt-7 p-6 md:p-8">
            <span className="eyebrow">Alert</span>
            <h2 className="text-3xl font-black">
              {summary.pending_requests} join requests are pending review
            </h2>
            <p className="muted mt-3">
              Teachers can review requests from their pages, and you can track activity from reports.
            </p>
          </section>
        ) : null}
      </div>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Quick Management</span>
            <h2 className="h2">Dashboard Sections</h2>
          </div>

          <div className="admin-nav-grid">
            {navCards.map(([title, description, href]) => (
              <Link href={href} className="card admin-nav-card" key={title}>
                <h3 className="text-2xl font-black">{title}</h3>
                <p className="muted mt-2">{description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section tint-section">
        <div className="wrap grid gap-7 lg:grid-cols-2">
          <div className="card admin-panel">
            <div className="toolbar">
              <div>
                <span className="eyebrow">Teachers</span>
                <h2 className="text-3xl font-black">Latest Teachers</h2>
              </div>
              <Link href="/admin/teachers" className="btn btn-soft">
                View All
              </Link>
            </div>

            <div className="admin-row-list">
              {teachers.map((teacher) => (
                <div className="admin-row" key={teacher.id}>
                  <div className="admin-avatar">{getInitials(teacher.full_name)}</div>
                  <div>
                    <h3 className="font-black">{teacher.full_name}</h3>
                    <p className="muted text-sm">
                      {teacher.courses_count} courses · {teacher.students_count} students
                    </p>
                  </div>
                  <span className="badge">Active</span>
                </div>
              ))}

              {teachers.length === 0 ? <p className="muted">No teachers yet.</p> : null}
            </div>
          </div>

          <div className="card admin-panel">
            <div className="toolbar">
              <div>
                <span className="eyebrow">Students</span>
                <h2 className="text-3xl font-black">Latest Students</h2>
              </div>
              <Link href="/admin/students" className="btn btn-soft">
                View All
              </Link>
            </div>

            <div className="admin-row-list">
              {students.map((student) => (
                <div className="admin-row" key={student.id}>
                  <div className="admin-avatar">{getInitials(student.full_name)}</div>
                  <div>
                    <h3 className="font-black">{student.full_name}</h3>
                    <p className="muted text-sm">
                      {student.education_type_name || "Not specified"} · {student.stage_name || "Not specified"} · {student.grade_name || "Not specified"}
                    </p>
                  </div>
                  <span className="badge">{student.student_code}</span>
                </div>
              ))}

              {students.length === 0 ? <p className="muted">No students yet.</p> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap grid gap-7 lg:grid-cols-[1fr_0.9fr]">
          <div className="card admin-panel">
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
              {payments.map((payment) => (
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

              {payments.length === 0 ? <p className="muted">No payments yet.</p> : null}
            </div>
          </div>

          <div className="card admin-panel">
            <span className="eyebrow">Activity</span>
            <h2 className="text-3xl font-black">Latest Activity</h2>

            <div className="activity-list mt-6">
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
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
