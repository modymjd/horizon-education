import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { query } from "@/lib/db"

type StudentRow = {
  id: number
  full_name: string
  email: string
  status: string
  student_code: string | null
  stage_name: string | null
  grade_name: string | null
  education_type_name: string | null
  subscriptions_count: number
}

async function getStudents() {
  const students = await query<StudentRow>(`
    SELECT
      u.id,
      u.full_name,
      u.email,
      u.status,
      s.student_code,
      es.name AS stage_name,
      g.name AS grade_name,
      et.name AS education_type_name,
      COUNT(sla.id) AS subscriptions_count
    FROM users u
    JOIN roles r ON r.id = u.role_id
    LEFT JOIN students s ON s.user_id = u.id
    LEFT JOIN educational_stages es ON es.id = s.stage_id
    LEFT JOIN grades g ON g.id = s.grade_id
    LEFT JOIN education_types et ON et.id = s.education_type_id
    LEFT JOIN student_lesson_access sla ON sla.student_id = s.id
    WHERE r.name = 'student'
      AND u.deleted_at IS NULL
    GROUP BY
      u.id,
      u.full_name,
      u.email,
      u.status,
      s.student_code,
      es.name,
      g.name,
      et.name
    ORDER BY u.id DESC
  `)

  return students
}

function getInitials(name: string) {
  return name.trim().slice(0, 1) || "ط"
}

function getStatusLabel(status: string) {
  if (status === "active") return "نشط"
  if (status === "suspended") return "موقوف"
  if (status === "banned") return "محظور"
  return status
}

export default async function AdminStudentsPage() {
  const students = await getStudents()

  const activeStudents = students.filter((student) => student.status === "active").length
  const followUpStudents = students.filter((student) => student.subscriptions_count === 0).length

  return (
    <main>
      <SiteHeader />

      <section className="admin-page-hero">
        <div className="wrap">
          <span className="eyebrow">لوحة الإدارة</span>
          <h1 className="h1">إدارة الطلاب</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            تابع حسابات الطلاب، المراحل الدراسية، وحالة الاشتراكات والتقدم.
          </p>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap">
          <div className="admin-summary-grid">
            <div className="card summary-card">
              <b>{students.length}</b>
              <span className="muted font-bold">إجمالي الطلاب</span>
            </div>
            <div className="card summary-card">
              <b>{activeStudents}</b>
              <span className="muted font-bold">طلاب نشطون</span>
            </div>
            <div className="card summary-card">
              <b>{followUpStudents}</b>
              <span className="muted font-bold">يحتاجون متابعة</span>
            </div>
          </div>

          <div className="toolbar">
            <div className="search-row">
              <input className="input" placeholder="ابحث باسم الطالب أو البريد..." />
              <select className="input" defaultValue="all">
                <option value="all">كل الحالات</option>
                <option value="active">نشط</option>
                <option value="follow">يحتاج متابعة</option>
              </select>
            </div>

            <Link href="/admin" className="btn btn-outline">
              رجوع للوحة الإدارة
            </Link>
          </div>

          <div className="card admin-table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>الطالب</th>
                  <th>البريد</th>
                  <th>الكود</th>
                  <th>المرحلة</th>
                  <th>الحالة</th>
                  <th>الاشتراكات</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const grade = [
                    student.education_type_name,
                    student.stage_name,
                    student.grade_name,
                  ]
                    .filter(Boolean)
                    .join(" / ")

                  return (
                    <tr key={student.id}>
                      <td>
                        <div className="table-user">
                          <div className="table-avatar">{getInitials(student.full_name)}</div>
                          <b>{student.full_name}</b>
                        </div>
                      </td>
                      <td>{student.email}</td>
                      <td>{student.student_code || "—"}</td>
                      <td>{grade || "غير محدد"}</td>
                      <td>
                        <span className="badge">{getStatusLabel(student.status)}</span>
                      </td>
                      <td>{student.subscriptions_count} حصة</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
