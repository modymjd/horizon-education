import Link from "next/link"
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
  teacher_name: string | null
  education_type_name: string | null
  stage_name: string | null
  grade_name: string | null
  lessons_count: number
  request_status: "pending" | "accepted" | "rejected" | null
}

async function getCourses(studentId?: number) {
  if (studentId) {
    return query<CourseRow>(
      `
      SELECT
        c.id,
        c.slug,
        c.title,
        c.short_description,
        c.cover_image_url,
        u.full_name AS teacher_name,
        (
          SELECT GROUP_CONCAT(et2.name ORDER BY et2.id SEPARATOR ', ')
          FROM course_education_types cet2
          JOIN education_types et2 ON et2.id = cet2.education_type_id
          WHERE cet2.course_id = c.id
        ) AS education_type_name,
        es.name AS stage_name,
        g.name AS grade_name,
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
      LEFT JOIN educational_stages es ON es.id = c.stage_id
      LEFT JOIN grades g ON g.id = c.grade_id
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
        u.full_name,
        es.name,
        g.name,
        r.status
      ORDER BY c.id DESC
      `,
      [studentId]
    )
  }

  return query<CourseRow>(
    `
    SELECT
      c.id,
      c.slug,
      c.title,
      c.short_description,
      c.cover_image_url,
      u.full_name AS teacher_name,
      (
        SELECT GROUP_CONCAT(et2.name ORDER BY et2.id SEPARATOR ', ')
        FROM course_education_types cet2
        JOIN education_types et2 ON et2.id = cet2.education_type_id
        WHERE cet2.course_id = c.id
      ) AS education_type_name,
      es.name AS stage_name,
      g.name AS grade_name,
      COUNT(DISTINCT l.id) AS lessons_count,
      NULL AS request_status
    FROM courses c
    JOIN teachers t ON t.id = c.teacher_id
    JOIN users u ON u.id = t.user_id
    LEFT JOIN educational_stages es ON es.id = c.stage_id
    LEFT JOIN grades g ON g.id = c.grade_id
    LEFT JOIN chapters ch ON ch.course_id = c.id AND ch.deleted_at IS NULL
    LEFT JOIN lessons l ON l.chapter_id = ch.id AND l.deleted_at IS NULL
    WHERE c.deleted_at IS NULL
      AND c.status = 'published'
    GROUP BY
      c.id,
      c.slug,
      c.title,
      c.short_description,
      c.cover_image_url,
      u.full_name,
      es.name,
      g.name
    ORDER BY c.id DESC
    `
  )
}

function getInitials(title: string) {
  return title.trim().slice(0, 1) || "C"
}

function getRequestLabel(status: string | null) {
  if (status === "pending") return "Pending Review"
  if (status === "accepted") return "Accepted"
  if (status === "rejected") return "Rejected"
  return "Available"
}

export default async function SubjectsPage() {
  const user = await getCurrentUser()
  const isStudent = user?.role === "student" && !!user.student_id
  const studentId = isStudent ? Number(user.student_id) : undefined
  const courses = await getCourses(studentId)

  return (
    <main>
      <SiteHeader />

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Available Courses</span>
            <h1 className="h1">Choose the course you want to study</h1>
            <p className="muted mt-6 text-lg">
              Browse published courses, view teachers and lessons, and request to join the course that fits you.
            </p>
          </div>

          <div className="grid-auto">
            {courses.map((course) => (
              <div className="card subject-card" key={course.id}>
                {course.cover_image_url ? (
                  <img
                    src={course.cover_image_url}
                    alt={course.title}
                    className="course-cover-image"
                  />
                ) : (
                  <div className="icon-circle">{getInitials(course.title)}</div>
                )}
                <h3 className="mt-5 text-2xl font-black">{course.title}</h3>
                <p className="muted mt-2">
                  {course.short_description || "No short description is available for this course yet."}
                </p>

                <p className="muted mt-3 text-sm">
                  Teacher: {course.teacher_name || "Not specified"}
                </p>

                <p className="muted mt-1 text-sm">
                  {course.education_type_name || "All types"} â€”{" "}
                  {course.stage_name || "All stages"} â€”{" "}
                  {course.grade_name || "All grades"}
                </p>

                <span className="badge mt-5">
                  {course.lessons_count} lessons
                </span>

                <span className="badge mt-3">
                  {getRequestLabel(course.request_status)}
                </span>

                <div className="mt-5 grid gap-3">
                  <Link href={`/courses/${course.slug}`} className="btn btn-soft">
                    Preview Course
                  </Link>

                  {isStudent ? (
                    <StudentCourseRequestButton
                      courseId={course.id}
                      initialStatus={course.request_status}
                    />
                  ) : (
                    <Link href="/register" className="btn">
                      Register as a student to join
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {courses.length === 0 ? (
              <div className="card subject-card">
                <div className="icon-circle">C</div>
                <h3 className="mt-5 text-2xl font-black">No courses available</h3>
                <p className="muted mt-2">
                  Published courses will appear here once available.
                </p>

                {isStudent ? (
                  <Link href="/student" className="btn mt-5">
                    Back to Student Dashboard
                  </Link>
                ) : (
                  <Link href="/register" className="btn mt-5">
                    Create Student Account
                  </Link>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

