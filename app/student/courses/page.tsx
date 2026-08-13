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
      c.status,
      u.full_name AS teacher_name,
      et.name AS education_type_name,
      COUNT(DISTINCT l.id) AS lessons_count,
      r.status AS request_status
    FROM students s
    JOIN courses c
      ON c.deleted_at IS NULL
      AND c.status = 'published'
      AND (
        c.education_type_id IS NULL
        OR s.education_type_id IS NULL
        OR c.education_type_id = s.education_type_id
      )
    JOIN teachers t ON t.id = c.teacher_id
    JOIN users u ON u.id = t.user_id
    LEFT JOIN education_types et ON et.id = c.education_type_id
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
      c.status,
      u.full_name,
      et.name,
      r.status
    ORDER BY c.id DESC
    `,
    [studentId]
  )
}

function getRequestLabel(status: string | null) {
  if (status === "pending") return "قيد المراجعة"
  if (status === "accepted") return "مقبول"
  if (status === "rejected") return "مرفوض"
  return "لم تطلب الانضمام"
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
          <span className="eyebrow">لوحة الطالب</span>
          <h1 className="h1">الكورسات المناسبة لك</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            تصفح الكورسات المناسبة لبياناتك الدراسية، واطلب الانضمام ليظهر طلبك للمدرس.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/student" className="btn">
              رجوع للوحة الطالب
            </Link>

            <Link href="/student/activate" className="btn btn-outline">
              تفعيل كود وصول
            </Link>
          </div>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap">
          <div className="card p-6 md:p-8 mb-6">
            <span className="eyebrow">بياناتك الدراسية</span>
            <div className="mt-4 grid gap-3 text-sm font-bold md:grid-cols-3">
              <p>✓ نوع التعليم: {profile?.education_type_name || "غير محدد"}</p>
              <p>✓ المرحلة: {profile?.stage_name || "غير محدد"}</p>
              <p>✓ الصف: {profile?.grade_name || "غير محدد"}</p>
            </div>
          </div>

          <div className="grid gap-5">
            {courses.map((course) => (
              <div className="card course-management-card" key={course.id}>
                <div className="course-management-head">
                  <div>
                    <span className="badge">
                      {getRequestLabel(course.request_status)}
                    </span>

                    <div className="mt-4">
                      <h2 className="text-3xl font-black">{course.title}</h2>
                      <p className="muted mt-1">
                        {course.short_description || "لا يوجد وصف مختصر بعد."}
                      </p>
                      <p className="muted mt-2 text-sm">
                        المدرس: {course.teacher_name} — نوع التعليم: {course.education_type_name || "عام"} — عدد الحصص: {course.lessons_count}
                      </p>
                    </div>
                  </div>

                  <div className="course-actions">
                    <Link href={`/courses/${course.slug}`} className="btn btn-soft">
                      معاينة
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
                <h2 className="text-2xl font-black">لا توجد كورسات مناسبة حاليًا</h2>
                <p className="muted mt-2">
                  عندما يتم نشر كورسات مناسبة لنوع تعليمك، ستظهر هنا.
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
