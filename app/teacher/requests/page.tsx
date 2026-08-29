import Link from "next/link"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { TeacherCourseRequestActions } from "@/components/teacher/TeacherCourseRequestActions"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type RequestRow = {
  id: number
  status: "pending" | "accepted" | "rejected"
  requested_at: string
  reviewed_at: string | null
  course_id: number
  course_title: string
  student_id: number
  student_code: string
  student_name: string
  student_email: string
  student_phone: string | null
  student_whatsapp_phone: string | null
  national_id: string | null
  address: string | null
  governorate: string | null
  guardian_name: string | null
  guardian_phone: string | null
  guardian_whatsapp_phone: string | null
  education_type_name: string | null
  stage_name: string | null
  grade_name: string | null
}

async function getTeacherRequests(teacherId: number) {
  return query<RequestRow>(
    `
    SELECT
      r.id,
      r.status,
      DATE_FORMAT(r.requested_at, '%Y-%m-%d %H:%i') AS requested_at,
      DATE_FORMAT(r.reviewed_at, '%Y-%m-%d %H:%i') AS reviewed_at,
      c.id AS course_id,
      c.title AS course_title,
      s.id AS student_id,
      s.student_code,
      u.full_name AS student_name,
      u.email AS student_email,
      u.phone AS student_phone,
      s.whatsapp_phone AS student_whatsapp_phone,
      s.national_id,
      s.address,
      s.governorate,
      gr.name AS guardian_name,
      gr.phone AS guardian_phone,
      gr.whatsapp_phone AS guardian_whatsapp_phone,
      et.name AS education_type_name,
      es.name AS stage_name,
      g.name AS grade_name
    FROM student_course_requests r
    JOIN courses c ON c.id = r.course_id
    JOIN students s ON s.id = r.student_id
    JOIN users u ON u.id = s.user_id
    LEFT JOIN guardians gr ON gr.id = s.guardian_id
    LEFT JOIN education_types et ON et.id = s.education_type_id
    LEFT JOIN educational_stages es ON es.id = s.stage_id
    LEFT JOIN grades g ON g.id = s.grade_id
    WHERE c.teacher_id = ?
      AND c.deleted_at IS NULL
    ORDER BY
      CASE r.status
        WHEN 'pending' THEN 1
        WHEN 'accepted' THEN 2
        WHEN 'rejected' THEN 3
        ELSE 4
      END,
      r.requested_at DESC
    `,
    [teacherId]
  )
}

function getStatusLabel(status: string) {
  if (status === "pending") return "Pending"
  if (status === "accepted") return "Accepted"
  if (status === "rejected") return "Rejected"
  return status
}

export default async function TeacherRequestsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher" || !user.teacher_id) {
    redirect("/403")
  }

  const requests = await getTeacherRequests(user.teacher_id)
  const pendingCount = requests.filter((item) => item.status === "pending").length
  const acceptedCount = requests.filter((item) => item.status === "accepted").length
  const rejectedCount = requests.filter((item) => item.status === "rejected").length

  return (
    <main>
      <SiteHeader />

      <section className="teacher-page-hero">
        <div className="wrap">
          <span className="eyebrow">Teacher Dashboard </span>
          <h1 className="h1">Join Requests</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            Review students' requests to join your courses, and accept or reject them. Accepting a request does not open the sessions without an access code.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/teacher" className="btn">
              Return to Teacher Dashboard
            </Link>

            <Link href="/teacher/access-codes" className="btn btn-outline">
              Create Access Codes
            </Link>
          </div>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap">
          <div className="teacher-stat-grid mb-6">
            <div className="card teacher-stat-card">
              <b>{pendingCount}</b>
              <span className="muted font-bold">Pending Requests</span>
            </div>

            <div className="card teacher-stat-card">
              <b>{acceptedCount}</b>
              <span className="muted font-bold">Accepted Requests</span>
            </div>

            <div className="card teacher-stat-card">
              <b>{rejectedCount}</b>
              <span className="muted font-bold">Rejected Requests</span>
            </div>

            <div className="card teacher-stat-card">
              <b>{requests.length}</b>
              <span className="muted font-bold">Total Requests</span>
            </div>
          </div>

          <div className="grid gap-5">
            {requests.map((request) => (
              <div className="card course-management-card" key={request.id}>
                <div className="course-management-head">
                  <div>
                    <span className="badge">{getStatusLabel(request.status)}</span>

                    <div className="mt-4">
                      <h2 className="text-3xl font-black">{request.student_name}</h2>
                      <p className="muted mt-1">
                        Request to join: {request.course_title}
                      </p>
                      <p className="muted mt-2 text-sm">
                        Request Date: {request.requested_at}
                        {request.reviewed_at ? ` — Reviewed: ${request.reviewed_at}` : ""}
                      </p>
                    </div>
                  </div>

                  <TeacherCourseRequestActions
                    requestId={request.id}
                    currentStatus={request.status}
                  />
                </div>

                <div className="course-metrics">
                  <div className="metric-mini">
                    <b>{request.student_code || "—"}</b>
                    <span className="muted">Student Code</span>
                  </div>

                  <div className="metric-mini">
                    <b>{request.student_phone || "—"}</b>
                    <span className="muted">Student Phone</span>
                  </div>

                  <div className="metric-mini">
                    <b>{request.student_whatsapp_phone || "—"}</b>
                    <span className="muted">Student WhatsApp  </span>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm font-bold md:grid-cols-2">
                  <p>Email: {request.student_email}</p>
                  <p>National ID: {request.national_id || "Not Specified"}</p>
                  <p>Governorate: {request.governorate || "Not Specified"}</p>
                  <p>Address: {request.address || "Not Specified"}</p>
                  <p>Guardian Name: {request.guardian_name || "Not Specified"}</p>
                  <p>Guardian Phone: {request.guardian_phone || "Not Specified"}</p>
                  <p>Guardian WhatsApp: {request.guardian_whatsapp_phone || "Not Specified"}</p>
                  <p>
                    Education: {request.education_type_name || "Not Specified"} —{" "}
                    {request.stage_name || "Not Specified"} —{" "}
                    {request.grade_name || "Not Specified"}
                  </p>
                </div>
              </div>
            ))}

            {requests.length === 0 ? (
              <div className="card course-management-card">
                <h2 className="text-2xl font-black">No requests yet</h2>
                <p className="muted mt-2">
                  When a student requests to join one of your courses, the request will appear here.
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
