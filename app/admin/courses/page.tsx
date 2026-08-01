import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { query } from "@/lib/db"

type CourseRow = {
  id: number
  title: string
  slug: string
  status: string
  teacher_name: string | null
  lessons_count: number
  students_count: number
}

async function getCourses() {
  const courses = await query<CourseRow>(`
    SELECT
      c.id,
      c.title,
      c.slug,
      c.status,
      u.full_name AS teacher_name,
      COUNT(DISTINCT l.id) AS lessons_count,
      COUNT(DISTINCT sla.student_id) AS students_count
    FROM courses c
    LEFT JOIN teachers t ON t.id = c.teacher_id
    LEFT JOIN users u ON u.id = t.user_id
    LEFT JOIN chapters ch ON ch.course_id = c.id
    LEFT JOIN lessons l ON l.chapter_id = ch.id
    LEFT JOIN student_lesson_access sla ON sla.lesson_id = l.id
    WHERE c.deleted_at IS NULL
    GROUP BY
      c.id,
      c.title,
      c.slug,
      c.status,
      u.full_name
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

function getInitials(title: string) {
  return title.trim().slice(0, 1) || "ك"
}

export default async function AdminCoursesPage() {
  const courses = await getCourses()

  const published = courses.filter((course) => course.status === "published").length
  const drafts = courses.filter((course) => course.status === "draft").length

  return (
    <main>
      <SiteHeader />

      <section className="admin-page-hero">
        <div className="wrap">
          <span className="eyebrow">لوحة الإدارة</span>
          <h1 className="h1">إدارة الكورسات</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            راجع الكورسات المنشورة والمسودات، وعدد الحصص والطلاب لكل كورس.
          </p>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap">
          <div className="admin-summary-grid">
            <div className="card summary-card">
              <b>{courses.length}</b>
              <span className="muted font-bold">إجمالي الكورسات</span>
            </div>
            <div className="card summary-card">
              <b>{published}</b>
              <span className="muted font-bold">منشورة</span>
            </div>
            <div className="card summary-card">
              <b>{drafts}</b>
              <span className="muted font-bold">مسودات</span>
            </div>
          </div>

          <div className="toolbar">
            <div className="search-row">
              <input className="input" placeholder="ابحث عن كورس..." />
              <select className="input" defaultValue="all">
                <option value="all">كل الكورسات</option>
                <option value="published">منشور</option>
                <option value="draft">مسودة</option>
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
                  <th>الكورس</th>
                  <th>المدرس</th>
                  <th>الحالة</th>
                  <th>الحصص</th>
                  <th>الطلاب</th>
                  <th>معاينة</th>
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
                    <td>{course.teacher_name || "غير محدد"}</td>
                    <td>
                      <span className="badge">{getStatusLabel(course.status)}</span>
                    </td>
                    <td>{course.lessons_count} حصة</td>
                    <td>{course.students_count} طالب</td>
                    <td>
                      <Link href={`/courses/${course.slug}`} className="btn btn-soft btn-sm">
                        فتح
                      </Link>
                    </td>
                  </tr>
                ))}

                {courses.length === 0 ? (
                  <tr>
                    <td colSpan={6}>لا توجد كورسات بعد.</td>
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
