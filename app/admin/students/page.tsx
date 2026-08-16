import Link from "next/link"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { AdminStudentActions } from "@/components/admin/AdminStudentActions"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type StudentRow = {
  user_id: number
  student_id: number
  full_name: string
  email: string
  phone: string | null
  status: string
  student_code: string | null
  whatsapp_phone: string | null
  national_id: string | null
  address: string | null
  governorate: string | null
  guardian_name: string | null
  guardian_phone: string | null
  guardian_whatsapp_phone: string | null
  stage_name: string | null
  grade_name: string | null
  education_type_name: string | null
  subscriptions_count: number
  requests_count: number
}

async function getStudents() {
  return query<StudentRow>(
    `
    SELECT
      u.id AS user_id,
      s.id AS student_id,
      u.full_name,
      u.email,
      u.phone,
      u.status,
      s.student_code,
      s.whatsapp_phone,
      s.national_id,
      s.address,
      s.governorate,
      gr.name AS guardian_name,
      gr.phone AS guardian_phone,
      gr.whatsapp_phone AS guardian_whatsapp_phone,
      es.name AS stage_name,
      g.name AS grade_name,
      et.name AS education_type_name,
      COUNT(DISTINCT sla.id) AS subscriptions_count,
      COUNT(DISTINCT scr.id) AS requests_count
    FROM users u
    JOIN roles r ON r.id = u.role_id
    JOIN students s ON s.user_id = u.id
    LEFT JOIN guardians gr ON gr.id = s.guardian_id
    LEFT JOIN educational_stages es ON es.id = s.stage_id
    LEFT JOIN grades g ON g.id = s.grade_id
    LEFT JOIN education_types et ON et.id = s.education_type_id
    LEFT JOIN student_lesson_access sla ON sla.student_id = s.id
    LEFT JOIN student_course_requests scr ON scr.student_id = s.id
    WHERE r.name = 'student'
      AND u.deleted_at IS NULL
    GROUP BY
      u.id,
      s.id,
      u.full_name,
      u.email,
      u.phone,
      u.status,
      s.student_code,
      s.whatsapp_phone,
      s.national_id,
      s.address,
      s.governorate,
      gr.name,
      gr.phone,
      gr.whatsapp_phone,
      es.name,
      g.name,
      et.name
    ORDER BY u.id DESC
    `
  )
}

function getInitials(name: string) {
  return name.trim().slice(0, 1) || "S"
}

function getStatusLabel(status: string) {
  if (status === "active") return "Active"
  if (status === "suspended") return "Suspended"
  if (status === "banned") return "Banned"
  return status
}

export default async function AdminStudentsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "admin") {
    redirect("/403")
  }

  const students = await getStudents()

  const activeStudents = students.filter((student) => student.status === "active").length
  const suspendedStudents = students.filter((student) => student.status !== "active").length
  const followUpStudents = students.filter((student) => Number(student.subscriptions_count) === 0).length

  return (
    <main>
      <SiteHeader />

      <section className="admin-page-hero">
        <div className="wrap">
          <span className="eyebrow">Admin Dashboard</span>
          <h1 className="h1">Manage Students</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            Review student accounts, contact details, guardian information, subscriptions, and join requests.
          </p>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap">
          <div className="admin-summary-grid">
            <div className="card summary-card">
              <b>{students.length}</b>
              <span className="muted font-bold">Total Students</span>
            </div>
            <div className="card summary-card">
              <b>{activeStudents}</b>
              <span className="muted font-bold">Active Students</span>
            </div>
            <div className="card summary-card">
              <b>{suspendedStudents}</b>
              <span className="muted font-bold">Suspended Students</span>
            </div>
            <div className="card summary-card">
              <b>{followUpStudents}</b>
              <span className="muted font-bold">Need Follow-up</span>
            </div>
          </div>

          <div className="toolbar">
            <div className="search-row">
              <input className="input" placeholder="Search by student name or email..." />
              <select className="input" defaultValue="all">
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <Link href="/admin" className="btn btn-outline">
              Back to Admin Dashboard
            </Link>
          </div>

          <div className="grid gap-5">
            {students.map((student) => {
              const grade = [
                student.education_type_name,
                student.stage_name,
                student.grade_name,
              ]
                .filter(Boolean)
                .join(" / ")

              return (
                <div className="card course-management-card" key={student.user_id}>
                  <div className="course-management-head">
                    <div className="table-user">
                      <div className="table-avatar">{getInitials(student.full_name)}</div>
                      <div>
                        <h2 className="text-3xl font-black">{student.full_name}</h2>
                        <p className="muted mt-1">{student.email}</p>
                        <p className="muted mt-1 text-sm">{grade || "Not specified"}</p>
                      </div>
                    </div>

                    <div className="course-actions">
                      <span className="badge">{getStatusLabel(student.status)}</span>
                      <AdminStudentActions
                        userId={student.user_id}
                        studentName={student.full_name}
                        status={student.status}
                      />
                    </div>
                  </div>

                  <div className="course-metrics">
                    <div className="metric-mini">
                      <b>{student.student_code || "—"}</b>
                      <span className="muted">Student Code</span>
                    </div>

                    <div className="metric-mini">
                      <b>{student.phone || "—"}</b>
                      <span className="muted">Student Phone</span>
                    </div>

                    <div className="metric-mini">
                      <b>{student.whatsapp_phone || "—"}</b>
                      <span className="muted">Student WhatsApp</span>
                    </div>

                    <div className="metric-mini">
                      <b>{student.subscriptions_count}</b>
                      <span className="muted">Activated Lessons</span>
                    </div>

                    <div className="metric-mini">
                      <b>{student.requests_count}</b>
                      <span className="muted">Join Requests</span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 text-sm font-bold md:grid-cols-2">
                    <p>National ID: {student.national_id || "Not specified"}</p>
                    <p>Governorate: {student.governorate || "Not specified"}</p>
                    <p>Address: {student.address || "Not specified"}</p>
                    <p>Guardian: {student.guardian_name || "Not specified"}</p>
                    <p>Guardian Phone: {student.guardian_phone || "Not specified"}</p>
                    <p>Guardian WhatsApp: {student.guardian_whatsapp_phone || "Not specified"}</p>
                  </div>
                </div>
              )
            })}

            {students.length === 0 ? (
              <div className="card course-management-card">
                <h2 className="text-2xl font-black">No students yet</h2>
                <p className="muted mt-2">
                  Students will appear here after they register on the platform.
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
