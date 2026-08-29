import Link from "next/link"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { StudentCourseRequestButton } from "@/components/student/StudentCourseRequestButton"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type CourseRow = {
  id: number
  slug: string
  title: string
  short_description: string | null
  cover_image_url: string | null
  status: string
  teacher_name: string
  education_type_name: string | null
  lessons_count: number
  request_status: "pending" | "accepted" | "rejected" | null
}

type StudentProfile = {
  education_type_id: number | null
  education_type_name: string | null
  stage_name: string | null
  grade_name: string | null
}

async function getStudentProfile(studentId: number) {
  const rows = await query<StudentProfile>(
    `
    SELECT
      s.education_type_id,
      et.name AS education_type_name,
      es.name AS stage_name,
      g.name AS grade_name
    FROM students s
    LEFT JOIN education_types et ON et.id = s.education_type_id
    LEFT JOIN educational_stages es ON es.id = s.stage_id
    LEFT JOIN grades g ON g.id = s.grade_id
    WHERE s.id = ?
    LIMIT 1
    `,
    [studentId]
  )

  return rows[0]
}

async function getAvailableCourses(studentId: number) {
  return query<CourseRow>(
    `
    SELECT
      c.id,
      c.slug,
      c.title,
      c.short_description,
      c.cover_image_url,
      c.status,
      u.full_name AS teacher_name,
      (
        SELECT GROUP_CONCAT(et2.name ORDER BY et2.id SEPARATOR ', ')
        FROM course_education_types cet2
        JOIN education_types et2 ON et2.id = cet2.education_type_id
        WHERE cet2.course_id = c.id
      ) AS education_type_name,
      COUNT(DISTINCT l.id) AS lessons_count,
      r.status AS request_status
    FROM students s
    JOIN courses c
      ON c.deleted_at IS NULL
      AND c.status = 'published'
      AND (
        NOT EXISTS (
          SELECT 1 FROM course_education_types cet WHERE cet.course_id = c.id
        )
        OR s.education_type_id IS NULL
        OR EXISTS (
          SELECT 1 FROM course_education_types cet
          WHERE cet.course_id = c.id
            AND cet.education_type_id = s.education_type_id
        )
      )
      AND (
        c.stage_id IS NULL
        OR s.stage_id IS NULL
        OR c.stage_id = s.stage_id
      )
      AND (
        c.grade_id IS NULL
        OR s.grade_id IS NULL
        OR c.grade_id = s.grade_id
      )
    JOIN teachers t ON t.id = c.teacher_id
    JOIN users u ON u.id = t.user_id
    LEFT JOIN chapters ch ON ch.course_id = c.id AND ch.deleted_at IS NULL
    LEFT JOIN lessons l ON l.chapter_id = ch.id AND l.deleted_at IS NULL
    LEFT JOIN student_course_requests r
      ON r.course_id = c.id
      AND r.student_id = s.id
    WHERE s.id = ?
    GROUP BY
      c.id,
      c.slug,
      c.title,
      c.short_description,
      c.cover_image_url,
      c.status,
      u.full_name,
      r.status
    ORDER BY c.id DESC
    `,
    [studentId]
  )
}

function getRequestLabel(status: string | null) {
  if (status === "pending") return "Pending Review"
  if (status === "accepted") return "Accepted"
  if (status === "rejected") return "Rejected"
  return "Not requested yet"
}

export default async function StudentCoursesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "student" || !user.student_id) {
    redirect("/403")
  }

  const [profile, courses] = await Promise.all([
    getStudentProfile(user.student_id),
    getAvailableCourses(user.student_id),
  ])

  return (
    <main>
      <SiteHeader />

      <section className="teacher-page-hero">
        <div className="wrap">
          <span className="eyebrow">Student Dashboard</span>
          <h1 className="h1">Courses that match your profile</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            Browse courses that match your education profile and request to join. Your request will be sent to the teacher.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/student" className="btn">
              Back to Student Dashboard
            </Link>

            <Link href="/student/activate" className="btn btn-outline">
              Activate Access Code
            </Link>
          </div>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap">
          <div className="card p-6 md:p-8 mb-6">
            <span className="eyebrow">Your Education Profile</span>
            <div className="mt-4 grid gap-3 text-sm font-bold md:grid-cols-3">
              <p>âœ“ Education type: {profile?.education_type_name || "Not specified"}</p>
              <p>âœ“ Stage: {profile?.stage_name || "Not specified"}</p>
              <p>âœ“ Grade: {profile?.grade_name || "Not specified"}</p>
            </div>
          </div>

          <div className="grid gap-5">
            {courses.map((course) => (
              <div className="card course-management-card" key={course.id}>
                <div className="course-management-head">
                  {course.cover_image_url ? (
                    <img
                      src={course.cover_image_url}
                      alt={course.title}
                      className="course-thumb"
                    />
                  ) : null}

                  <div>
                    <span className="badge">
                      {getRequestLabel(course.request_status)}
                    </span>

                    <div className="mt-4">
                      <h2 className="text-3xl font-black">{course.title}</h2>
                      <p className="muted mt-1">
                        {course.short_description || "No short description yet."}
                      </p>
                      <p className="muted mt-2 text-sm">
                        Teacher: {course.teacher_name} â€” Education type: {course.education_type_name || "General"} â€” Lessons: {course.lessons_count}
                      </p>
                    </div>
                  </div>

                  <div className="course-actions">
                    <Link href={`/courses/${course.slug}`} className="btn btn-soft">
                      Preview
                    </Link>
                  </div>
                </div>

                <StudentCourseRequestButton
                  courseId={course.id}
                  initialStatus={course.request_status}
                />
              </div>
            ))}

            {courses.length === 0 ? (
              <div className="card course-management-card">
                <h2 className="text-2xl font-black">No matching courses right now</h2>
                <p className="muted mt-2">
                  When courses that match your education profile are published, they will appear here.
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

