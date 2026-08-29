import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { AdminCourseCreateForm } from "@/components/admin/AdminCourseCreateForm"
import { AdminCourseDeleteButton } from "@/components/admin/AdminCourseDeleteButton"
import { query } from "@/lib/db"

type CourseRow = {
  id: number
  title: string
  slug: string
  status: string
  teacher_name: string | null
  education_type_name: string | null
  stage_name: string | null
  grade_name: string | null
  lessons_count: number
  students_count: number
}

type TeacherOption = {
  id: number
  full_name: string
}

type EducationTypeOption = {
  id: number
  name: string
}

type StageOption = {
  id: number
  name: string
}

type GradeOption = {
  id: number
  name: string
  stage_id: number
}

async function getCourses() {
  const courses = await query<CourseRow>(
    `
    SELECT
      c.id,
      c.title,
      c.slug,
      c.status,
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
      COUNT(DISTINCT sla.student_id) AS students_count
    FROM courses c
    LEFT JOIN teachers t ON t.id = c.teacher_id
    LEFT JOIN users u ON u.id = t.user_id
    LEFT JOIN educational_stages es ON es.id = c.stage_id
    LEFT JOIN grades g ON g.id = c.grade_id
    LEFT JOIN chapters ch ON ch.course_id = c.id
    LEFT JOIN lessons l ON l.chapter_id = ch.id
    LEFT JOIN student_lesson_access sla ON sla.lesson_id = l.id
    WHERE c.deleted_at IS NULL
    GROUP BY
      c.id,
      c.title,
      c.slug,
      c.status,
      u.full_name,
      es.name,
      g.name
    ORDER BY c.id DESC
    `
  )

  return courses
}

async function getTeachers() {
  return query<TeacherOption>(
    `
    SELECT
      t.id,
      u.full_name
    FROM teachers t
    JOIN users u ON u.id = t.user_id
    WHERE u.deleted_at IS NULL
      AND u.status = 'active'
    ORDER BY u.full_name ASC
    `
  )
}

async function getEducationTypes() {
  return query<EducationTypeOption>(
    `
    SELECT id, name
    FROM education_types
    ORDER BY id ASC
    `
  )
}

async function getStages() {
  return query<StageOption>(
    `
    SELECT id, name
    FROM educational_stages
    ORDER BY sort_order ASC, id ASC
    `
  )
}

async function getGrades() {
  return query<GradeOption>(
    `
    SELECT id, name, stage_id
    FROM grades
    ORDER BY sort_order ASC, id ASC
    `
  )
}

function getStatusLabel(status: string) {
  if (status === "published") return "Published"
  if (status === "draft") return "Draft"
  if (status === "paused") return "Paused"
  if (status === "ended") return "Ended"
  if (status === "archived") return "Archived"
  return status
}

function getInitials(title: string) {
  return title.trim().slice(0, 1) || "C"
}

export default async function AdminCoursesPage() {
  const [courses, teachers, educationTypes, stages, grades] = await Promise.all([
    getCourses(),
    getTeachers(),
    getEducationTypes(),
    getStages(),
    getGrades(),
  ])

  const published = courses.filter((course) => course.status === "published").length
  const drafts = courses.filter((course) => course.status === "draft").length

  return (
    <main>
      <SiteHeader />

      <section className="admin-page-hero">
        <div className="wrap">
          <span className="eyebrow">Admin Dashboard</span>
          <h1 className="h1">Manage Courses</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            Create courses from the admin panel and select the teacher, education type(s), stage, and grade.
          </p>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap">
          <div className="admin-summary-grid">
            <div className="card summary-card">
              <b>{courses.length}</b>
              <span className="muted font-bold">Total Courses</span>
            </div>
            <div className="card summary-card">
              <b>{published}</b>
              <span className="muted font-bold">Published</span>
            </div>
            <div className="card summary-card">
              <b>{drafts}</b>
              <span className="muted font-bold">Drafts</span>
            </div>
          </div>

          <AdminCourseCreateForm
            teachers={teachers}
            educationTypes={educationTypes}
            stages={stages}
            grades={grades}
          />

          <div className="toolbar">
            <div className="search-row">
              <input className="input" placeholder="Search courses..." />
              <select className="input" defaultValue="all">
                <option value="all">All courses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            <Link href="/admin" className="btn btn-outline">
              Back to Admin Dashboard
            </Link>
          </div>

          <div className="card admin-table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Teacher</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Lessons</th>
                  <th>Students</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <div className="table-user">
                        <div className="table-avatar">{getInitials(course.title)}</div>
                        <b>{course.title}</b>
                      </div>
                    </td>
                    <td>{course.teacher_name || "Not specified"}</td>
                    <td>
                      <p>{course.education_type_name || "All types"}</p>
                      <p className="muted text-sm">
                        {course.stage_name || "All stages"} â€” {course.grade_name || "All grades"}
                      </p>
                    </td>
                    <td>
                      <span className="badge">{getStatusLabel(course.status)}</span>
                    </td>
                    <td>{course.lessons_count} lessons</td>
                    <td>{course.students_count} students</td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/courses/${course.slug}`} className="btn btn-soft btn-sm">
                          Preview
                        </Link>

                        <Link href={`/admin/courses/${course.id}`} className="btn btn-outline btn-sm">
                          Edit
                        </Link>

                        <AdminCourseDeleteButton
                          courseId={course.id}
                          courseTitle={course.title}
                        />
                      </div>
                    </td>
                  </tr>
                ))}

                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={7}>No courses yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

