import Link from "next/link"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type TeacherSummary = {
  active_students: number
  published_courses: number
  lessons_count: number
  teacher_revenue: number
  pending_requests: number
}

type TeacherCourseRow = {
  id: number
  slug: string
  title: string
  status: string
  lessons_count: number
  students_count: number
}

type AccessCodeRow = {
  id: number
  code_prefix: string | null
  lesson_title: string | null
  available_count: number
}

type ActivityRow = {
  text: string
  activity_time: string
}

async function getTeacherSummary(teacherId: number) {
  const rows = await query<TeacherSummary>(
    `
    SELECT
      COUNT(DISTINCT sla.student_id) AS active_students,
      COUNT(DISTINCT CASE WHEN c.status = 'published' THEN c.id END) AS published_courses,
      COUNT(DISTINCT l.id) AS lessons_count,
      COALESCE(SUM(DISTINCT p.teacher_amount), 0) AS teacher_revenue,
      COUNT(DISTINCT CASE WHEN r.status = 'pending' THEN r.id END) AS pending_requests
    FROM courses c
    LEFT JOIN chapters ch ON ch.course_id = c.id AND ch.deleted_at IS NULL
    LEFT JOIN lessons l ON l.chapter_id = ch.id AND l.deleted_at IS NULL
    LEFT JOIN student_lesson_access sla ON sla.lesson_id = l.id
    LEFT JOIN payments p ON p.lesson_id = l.id
    LEFT JOIN student_course_requests r ON r.course_id = c.id
    WHERE c.teacher_id = ?
      AND c.deleted_at IS NULL
    `,
    [teacherId]
  )

  return rows[0]
}

async function getTeacherCourses(teacherId: number) {
  return query<TeacherCourseRow>(
    `
    SELECT
      c.id,
      c.slug,
      c.title,
      c.status,
      COUNT(DISTINCT l.id) AS lessons_count,
      COUNT(DISTINCT sla.student_id) AS students_count
    FROM courses c
    LEFT JOIN chapters ch ON ch.course_id = c.id AND ch.deleted_at IS NULL
    LEFT JOIN lessons l ON l.chapter_id = ch.id AND l.deleted_at IS NULL
    LEFT JOIN student_lesson_access sla ON sla.lesson_id = l.id
    WHERE c.teacher_id = ?
      AND c.deleted_at IS NULL
    GROUP BY c.id, c.slug, c.title, c.status
    ORDER BY c.id DESC
    LIMIT 4
    `,
    [teacherId]
  )
}

async function getLatestCodes(teacherId: number) {
  return query<AccessCodeRow>(
    `
    SELECT
      MAX(ac.id) AS id,
      ac.code_prefix,
      l.title AS lesson_title,
      COUNT(*) AS available_count
    FROM access_codes ac
    JOIN lessons l ON l.id = ac.lesson_id
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    WHERE c.teacher_id = ?
      AND ac.status = 'new'
    GROUP BY ac.batch_id, ac.code_prefix, l.title
    ORDER BY id DESC
    LIMIT 3
    `,
    [teacherId]
  )
}

async function getActivities(teacherId: number) {
  return query<ActivityRow>(
    `
    SELECT
      CONCAT(u.full_name, ' طلب الانضمام إلى ', c.title) AS text,
      DATE_FORMAT(r.requested_at, '%Y-%m-%d %H:%i') AS activity_time
    FROM student_course_requests r
    JOIN courses c ON c.id = r.course_id
    JOIN students s ON s.id = r.student_id
    JOIN users u ON u.id = s.user_id
    WHERE c.teacher_id = ?
    ORDER BY r.requested_at DESC
    LIMIT 5
    `,
    [teacherId]
  )
}

function money(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("ar-EG")} ج.م`
}

function getStatusLabel(status: string) {
  if (status === "published") return "منشور"
  if (status === "draft") return "مسودة"
  if (status === "paused") return "متوقف"
  if (status === "ended") return "منتهي"
  return status
}

function getInitials(title: string) {
  return title.trim().slice(0, 1) || "ك"
}

function ProgressRing({ value }: { value: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const dash = (value / 100) * circumference

  return (
    <div className="ring">
      <svg width="68" height="68" viewBox="0 0 68 68">
        <circle className="ring-bg" cx="34" cy="34" r={radius} />
        <circle
          className="ring-fg"
          cx="34"
          cy="34"
          r={radius}
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <div className="ring-label">{value}%</div>
    </div>
  )
}

export default async function TeacherDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher" || !user.teacher_id) {
    redirect("/403")
  }

  const [summary, courses, codes, activities] = await Promise.all([
    getTeacherSummary(user.teacher_id),
    getTeacherCourses(user.teacher_id),
    getLatestCodes(user.teacher_id),
    getActivities(user.teacher_id),
  ])

  const stats = [
    [String(Number(summary?.active_students || 0)), "طالب نشط"],
    [String(Number(summary?.published_courses || 0)), "كورسات منشورة"],
    [String(Number(summary?.lessons_count || 0)), "حصة متاحة"],
    [money(summary?.teacher_revenue || 0), "إجمالي الأرباح"],
  ]

  const firstCourse = courses[0]

  return (
    <main>
      <SiteHeader />

      <div className="wrap">
        <section className="teacher-dashboard-grid">
          <div className="card teacher-welcome">
            <span className="eyebrow">لوحة المدرس</span>
            <h1 className="welcome-title">أهلًا، {user.full_name || "المدرس"} 👋</h1>
            <p className="muted mt-4 text-lg">
              لديك {Number(summary?.pending_requests || 0)} طلب انضمام قيد المراجعة، ويمكنك إدارة حصصك وأكواد الوصول من هنا.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/teacher/courses" className="btn">
                إدارة الكورسات
              </Link>

              <Link href="/teacher/requests" className="btn btn-outline">
                طلبات الانضمام
              </Link>

              <Link href="/teacher/students" className="btn btn-outline">
                طلابي
              </Link>

              <Link href="/teacher/access-codes" className="btn btn-outline">
                إنشاء أكواد وصول
              </Link>
            </div>
          </div>

          <div className="teacher-actions">
            <Link href="/teacher/requests" className="teacher-action-card">
              <span className="badge">الطلبات</span>
              <h3 className="mt-4 text-2xl font-black">راجع طلبات الطلاب</h3>
              <p className="muted mt-2">اقبل أو ارفض طلبات الانضمام لكورساتك.</p>
            </Link>

            <Link href="/teacher/students" className="teacher-action-card">
              <span className="badge">الطلاب</span>
              <h3 className="mt-4 text-2xl font-black">قائمة الطلاب المقبولين</h3>
              <p className="muted mt-2">راجع بيانات الطلاب وأرقام التواصل وولي الأمر.</p>
            </Link>

            <Link href="/teacher/access-codes" className="teacher-action-card">
              <span className="badge">الأكواد</span>
              <h3 className="mt-4 text-2xl font-black">ولّد أكواد للطلاب</h3>
              <p className="muted mt-2">أنشئ أكواد وصول لحصة أو مجموعة حصص.</p>
            </Link>
          </div>
        </section>

        <section className="teacher-stat-grid">
          {stats.map(([value, label]) => (
            <div className="card teacher-stat-card" key={label}>
              <b>{value}</b>
              <span className="muted font-bold">{label}</span>
            </div>
          ))}
        </section>

        <section className="card continue-card mt-7">
          <div>
            <span className="lesson-pill">إدارة المحتوى</span>
            <h2 className="mt-5 font-[var(--display)] text-5xl font-bold leading-none">
              {firstCourse ? firstCourse.title : "ابدأ بإدارة كورساتك"}
            </h2>
            <p className="muted mt-4">
              {firstCourse
                ? "افتح الكورس لإضافة حصص وفيديوهات وواجبات وامتحانات."
                : "عندما يضيف الأدمن كورسًا لك، سيظهر هنا."}
            </p>
          </div>

          <Link href="/teacher/courses" className="btn">
            إدارة الكورسات
          </Link>
        </section>
      </div>

      <section className="section">
        <div className="wrap grid gap-7 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="section-head">
              <span className="eyebrow">كورساتي</span>
              <h2 className="h2">الكورسات والحصص</h2>
            </div>

            <div className="grid gap-4">
              {courses.map((course) => (
                <div className="teacher-course-row" key={course.id}>
                  <div className="course-letter">{getInitials(course.title)}</div>

                  <div>
                    <h3 className="text-xl font-black">{course.title}</h3>
                    <p className="muted">
                      {course.lessons_count} حصة · {course.students_count} طالب · {getStatusLabel(course.status)}
                    </p>

                    <div className="progress-track mt-4">
                      <div
                        className="progress-fill"
                        style={{ width: `${course.lessons_count ? 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <Link href={`/teacher/courses/${course.id}/lessons`} className="btn btn-soft">
                    فتح
                  </Link>
                </div>
              ))}

              {courses.length === 0 ? (
                <div className="card course-management-card">
                  <h3 className="text-2xl font-black">لا توجد كورسات بعد</h3>
                  <p className="muted mt-2">
                    عندما يضيف الأدمن كورسات لهذا الحساب ستظهر هنا.
                  </p>
                </div>
              ) : null}
            </div>
          </div>

          <aside>
            <div className="section-head">
              <span className="eyebrow">أكواد الوصول</span>
              <h2 className="h2">آخر الأكواد</h2>
            </div>

            <div className="grid gap-4">
              {codes.map((item) => (
                <div className="card access-code-card" key={item.id}>
                  <h3 className="text-xl font-black">{item.lesson_title || "حصة غير محددة"}</h3>
                  <p className="muted mt-2">{item.available_count} كود متاح</p>
                  <span className="code-preview">{item.code_prefix || "HZ-***"}</span>
                </div>
              ))}

              {codes.length === 0 ? (
                <div className="card access-code-card">
                  <h3 className="text-xl font-black">لا توجد أكواد حديثة</h3>
                  <p className="muted mt-2">أنشئ أكواد وصول للطلاب من صفحة الأكواد.</p>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </section>

      <section className="section tint-section">
        <div className="wrap grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <span className="eyebrow">النشاطات</span>
            <h2 className="h2">آخر النشاطات</h2>
            <p className="muted mt-5">
              متابعة سريعة لما يحدث داخل كورساتك وحصصك.
            </p>
          </div>

          <div className="activity-list">
            {activities.map((activity) => (
              <div className="activity-item" key={`${activity.text}-${activity.activity_time}`}>
                <div className="activity-dot" />
                <div>
                  <p className="font-bold">{activity.text}</p>
                  <p className="muted text-sm">{activity.activity_time}</p>
                </div>
              </div>
            ))}

            {activities.length === 0 ? (
              <div className="activity-item">
                <div className="activity-dot" />
                <div>
                  <p className="font-bold">لا توجد نشاطات حديثة</p>
                  <p className="muted text-sm">ستظهر طلبات الانضمام والتحديثات هنا.</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

