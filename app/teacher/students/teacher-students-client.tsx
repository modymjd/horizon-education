"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

type TeacherStudentRow = {
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
  accepted_courses: string
  accepted_courses_count: number
  unlocked_lessons_count: number
}

type Props = {
  students: TeacherStudentRow[]
}

export function TeacherStudentsClient({ students }: Props) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()

    if (!q) {
      return students
    }

    return students.filter((student) => {
      const name = (student.student_name || "").toLowerCase()
      const phone = (student.student_phone || "").toLowerCase()
      const whatsapp = (student.student_whatsapp_phone || "").toLowerCase()
      const guardianPhone = (student.guardian_phone || "").toLowerCase()
      const code = (student.student_code || "").toLowerCase()

      return (
        name.includes(q) ||
        phone.includes(q) ||
        whatsapp.includes(q) ||
        guardianPhone.includes(q) ||
        code.includes(q)
      )
    })
  }, [students, searchQuery])

  return (
    <div>
      <div className="card p-5 mb-6">
        <label className="font-bold">
          Search students
          <input
            className="input mt-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name or phone number..."
          />
        </label>
      </div>

      <div className="grid gap-5">
        {filteredStudents.map((student) => (
          <div className="card course-management-card" key={student.student_id}>
            <div className="course-management-head">
              <div>
                <span className="badge">{student.student_code || "No code"}</span>

                <div className="mt-4">
                  <h2 className="text-3xl font-black">{student.student_name}</h2>
                  <p className="muted mt-1">
                    {student.accepted_courses || "No accepted courses"}
                  </p>
                  <p className="muted mt-2 text-sm">
                    Education: {student.education_type_name || "Not specified"} â€”{" "}
                    {student.stage_name || "Not specified"} â€”{" "}
                    {student.grade_name || "Not specified"}
                  </p>
                </div>
              </div>

              <div className="course-actions">
                <Link href="/teacher/access-codes" className="btn btn-outline">
                  Create Code
                </Link>
              </div>
            </div>

            <div className="course-metrics">
              <div className="metric-mini">
                <b>{student.student_phone || "â€”"}</b>
                <span className="muted">Student Phone</span>
              </div>

              <div className="metric-mini">
                <b>{student.student_whatsapp_phone || "â€”"}</b>
                <span className="muted">Student WhatsApp</span>
              </div>

              <div className="metric-mini">
                <b>{student.guardian_phone || "â€”"}</b>
                <span className="muted">Guardian Phone</span>
              </div>

              <div className="metric-mini">
                <b>{student.guardian_whatsapp_phone || "â€”"}</b>
                <span className="muted">Guardian WhatsApp</span>
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-sm font-bold md:grid-cols-2">
              <p>Email: {student.student_email}</p>
              <p>National ID: {student.national_id || "Not specified"}</p>
              <p>Governorate: {student.governorate || "Not specified"}</p>
              <p>Address: {student.address || "Not specified"}</p>
              <p>Guardian: {student.guardian_name || "Not specified"}</p>
              <p>Unlocked lessons: {student.unlocked_lessons_count}</p>
            </div>
          </div>
        ))}

        {filteredStudents.length === 0 && students.length > 0 ? (
          <div className="card course-management-card">
            <h2 className="text-2xl font-black">No matching students</h2>
            <p className="muted mt-2">
              Try a different name or phone number.
            </p>
          </div>
        ) : null}

        {students.length === 0 ? (
          <div className="card course-management-card">
            <h2 className="text-2xl font-black">No accepted students yet</h2>
            <p className="muted mt-2">
              When you accept a student's join request for one of your courses, they will appear here.
            </p>

            <div className="mt-6">
              <Link href="/teacher/requests" className="btn">
                Review Join Requests
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

