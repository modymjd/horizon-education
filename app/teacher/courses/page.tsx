import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { query } from "@/lib/db"

type TeacherCourseRow = {
  id: number
  slug: string
  title: string
  short_description: string | null
  status: string
  lessons_count: number
  students_count: number
  teacher_revenue: number
  first_lesson_id: number | null
}

async function getTeacherCourses() {
  const courses = await query<TeacherCourseRow>(`
    SELECT
      c.id,
      c.slug,
      c.title,
      c.short_description,
      c.status,
      MIN(l.id) AS first_lesson_id,
      COUNT(DISTINCT l.id) AS lessons_count,
      COUNT(DISTINCT sla.student_id) AS students_count,
      COALESCE(SUM(DISTINCT p.teacher_amount), 0) AS teacher_revenue
    FROM courses c
    JOIN teachers t ON t.id = c.teacher_id
    JOIN users u ON u.id = t.user_id
    LEFT JOIN chapters ch ON ch.course_id = c.id
    LEFT JOIN lessons l ON l.chapter_id = ch.id
    LEFT JOIN student_lesson_access sla ON sla.lesson_id = l.id
    LEFT JOIN payments p ON p.lesson_id = l.id
    WHERE u.email = 'teacher@horizon.test'
      AND c.deleted_at IS NULL
    GROUP BY
      c.id,
      c.slug,
      c.title,
      c.short_description,
      c.status
    ORDER BY c.id DESC
  `)

  return courses
}

function getStatusLabel(status: string) {
  if (status === "published") return "منشور"
  if (status === "draft") return "مسودة"
  if (status === "archived") return "مؤرشف"
  return status
}

function getStatusClass(status: string) {
  if (status === "published") return "status-published"
  if (status === "draft") return "status-draft"
  if (status === "archived") return "status-archived"
  return "status-archived"
}

function getInitials(title: string) {
  return title.trim().slice(0, 1) || "ك"
}

function money(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("ar-EG")} ج.م`
}

export default async function TeacherCoursesPage() {
  const courses = await getTeacherCourses()

  const totalLessons = courses.reduce(
    (sum, course) => sum + Number(course.lessons_count || 0),
    0
  )

  const totalStudents = courses.reduce(
    (sum, course) => sum + Number(course.students_count || 0),
    0
  )

  const totalRevenue = courses.reduce(
    (sum, course) => sum + Number(course.teacher_revenue || 0),
    0
  )

  return (
    <main>
      <SiteHeader />

      <section className="teacher-page-hero">
        <div className="wrap">
          <span className="eyebrow">لوحة المدرس</span>
          <h1 className="h1">إدارة الكورسات</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            راجع كورساتك، أضف حصص جديدة، وتابع أعداد الطلاب والإيرادات.
          </p>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap">
          <div className="teacher-stat-grid mb-6">
            <div className="card teacher-stat-card">
              <b>{courses.length}</b>
              <span className="muted font-bold">كورسات</span>
            </div>

            <div className="card teacher-stat-card">
              <b>{totalLessons}</b>
              <span className="muted font-bold">حصة</span>
            </div>

            <div className="card teacher-stat-card">
              <b>{totalStudents}</b>
              <span className="muted font-bold">طالب لديه وصول</span>
            </div>

            <div className="card teacher-stat-card">
              <b>{money(totalRevenue)}</b>
              <span className="muted font-bold">إجمالي الأرباح</span>
            </div>
          </div>

          <div className="toolbar">
            <div className="search-row">
              <input className="input" placeholder="ابحث عن كورس..." />
              <select className="input" defaultValue="all">
                <option value="all">كل الحالات</option>
                <option value="published">منشور</option>
                <option value="draft">مسودة</option>
              </select>
            </div>

            <Link href="/teacher" className="btn btn-outline">
              رجوع للوحة المدرس
            </Link>
          </div>

          <div className="grid gap-5">
            {courses.map((course) => (
              <div className="card course-management-card" key={course.id}>
                <div className="course-management-head">
                  <div>
                    <span className={`status-pill ${getStatusClass(course.status)}`}>
                      {getStatusLabel(course.status)}
                    </span>

                    <div className="mt-4 flex items-center gap-4">
                      <div className="course-letter">{getInitials(course.title)}</div>

                      <div>
                        <h2 className="text-3xl font-black">{course.title}</h2>
                        <p className="muted mt-1">
                          {course.short_description || "لا يوجد وصف مختصر بعد."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="course-actions">
                    <Link href={`/courses/${course.slug}`} className="btn btn-soft">
                      معاينة
                    </Link>

                    <Link
                      href={
                        course.first_lesson_id
                          ? `/teacher/lessons/${course.first_lesson_id}`
                          : "/teacher/courses"
                      }
                      className="btn btn-outline"
                    >
                      تعديل
                    </Link>
                  </div>
                </div>

                <div className="course-metrics">
                  <div className="metric-mini">
                    <b>{course.lessons_count}</b>
                    <span className="muted">حصة</span>
                  </div>

                  <div className="metric-mini">
                    <b>{course.students_count}</b>
                    <span className="muted">طالب</span>
                  </div>

                  <div className="metric-mini">
                    <b>{money(course.teacher_revenue)}</b>
                    <span className="muted">أرباح</span>
                  </div>
                </div>
              </div>
            ))}

            {courses.length === 0 ? (
              <div className="card course-management-card">
                <h2 className="text-2xl font-black">لا توجد كورسات بعد</h2>
                <p className="muted mt-2">
                  عندما يتم إضافة كورسات لهذا المدرس ستظهر هنا.
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