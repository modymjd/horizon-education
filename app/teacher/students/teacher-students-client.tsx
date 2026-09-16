"use client"

import Link from "next/link"
import { useMemo, useState } from "react"

type AcceptedCourse = {
  id: number
  title: string
}

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
  accepted_courses_json: string | null
  accepted_courses_count: number
  unlocked_lessons_count: number
}

type Props = {
  students: TeacherStudentRow[]
}

function parseAcceptedCourses(value: string | null): AcceptedCourse[] {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)

    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map((course) => ({
        id: Number(course.id),
        title: String(course.title || ""),
      }))
      .filter((course) => course.id && course.title)
  } catch {
    return []
  }
}

export function TeacherStudentsClient({ students }: Props) {
  const [searchQuery, setSearchQuery] = useState("")
  const [removingKey, setRemovingKey] = useState<string | null>(null)

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
      const courses = (student.accepted_courses || "").toLowerCase()

      return (
        name.includes(q) ||
        phone.includes(q) ||
        whatsapp.includes(q) ||
        guardianPhone.includes(q) ||
        code.includes(q) ||
        courses.includes(q)
      )
    })
  }, [students, searchQuery])

  async function removeFromCourse(student: TeacherStudentRow, course: AcceptedCourse) {
    const confirmed = window.confirm(
      `Remove ${student.student_name} from "${course.title}"? The student account will remain active, but access to this course lessons will be removed.`
    )

    if (!confirmed) return

    const key = `${student.student_id}-${course.id}`
    setRemovingKey(key)

    try {
      const res = await fetch(`/api/teacher/students/${student.student_id}/courses/${course.id}`, {
        method: "DELETE",
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data.message || "Unable to remove student from course.")
      }

      window.location.reload()
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to remove student from course.")
    } finally {
      setRemovingKey(null)
    }
  }

  return (
    <div>
      <div className="card p-5 mb-6">
        <label className="font-bold">
          Search students
          <input
            className="input mt-2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, phone number, or course..."
          />
        </label>
      </div>

      <div className="grid gap-5">
        {filteredStudents.map((student) => {
          const acceptedCourses = parseAcceptedCourses(student.accepted_courses_json)

          return (
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
                      Education: {student.education_type_name || "Not specified"} —{" "}
                      {student.stage_name || "Not specified"} —{" "}
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

              {acceptedCourses.length > 0 ? (
                <div className="mt-5 rounded-[24px] border border-[rgba(76,42,32,0.12)] bg-white/40 p-4">
                  <p className="mb-3 font-black">Accepted courses</p>
                  <div className="flex flex-wrap gap-2">
                    {acceptedCourses.map((course) => {
                      const key = `${student.student_id}-${course.id}`
                      const isRemoving = removingKey === key

                      return (
                        <div
                          key={course.id}
                          className="flex items-center gap-2 rounded-full border border-[rgba(76,42,32,0.18)] bg-white px-4 py-2 text-sm font-bold"
                        >
                          <span>{course.title}</span>
                          <button
                            type="button"
                            className="rounded-full bg-red-100 px-3 py-1 text-xs font-black text-red-700 disabled:opacity-60"
                            onClick={() => removeFromCourse(student, course)}
                            disabled={isRemoving}
                          >
                            {isRemoving ? "Removing..." : "Remove"}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              <div className="course-metrics">
                <div className="metric-mini">
                  <b>{student.student_phone || "—"}</b>
                  <span className="muted">Student Phone</span>
                </div>

                <div className="metric-mini">
                  <b>{student.student_whatsapp_phone || "—"}</b>
                  <span className="muted">Student WhatsApp</span>
                </div>

                <div className="metric-mini">
                  <b>{student.guardian_phone || "—"}</b>
                  <span className="muted">Guardian Phone</span>
                </div>

                <div className="metric-mini">
                  <b>{student.guardian_whatsapp_phone || "—"}</b>
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
          )
        })}

        {filteredStudents.length === 0 && students.length > 0 ? (
          <div className="card course-management-card">
            <h2 className="text-2xl font-black">No matching students</h2>
            <p className="muted mt-2">
              Try a different name, phone number, or course.
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
