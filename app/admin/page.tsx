import Link from "next/link"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type SummaryRow = {
  students_count: number
  teachers_count: number
  courses_count: number
  revenue_total: number
  pending_requests: number
}

type TeacherRow = {
  id: number
  full_name: string
  courses_count: number
  students_count: number
}

type StudentRow = {
  id: number
  full_name: string
  student_code: string
  education_type_name: string | null
  stage_name: string | null
  grade_name: string | null
}

type PaymentRow = {
  id: number
  invoice_number: string
  student_name: string
  lesson_title: string
  amount_paid: number
}

type ActivityRow = {
  text: string
  activity_time: string
}

const navCards = [
  ["المدرسون", "إضافة وتعديل بيانات المدرسين", "/admin/teachers"],
  ["الطلاب", "متابعة الطلاب والحسابات", "/admin/students"],
  ["الكورسات", "إدارة الكورسات والحصص", "/admin/courses"],
  ["المدفوعات", "تسجيل ومراجعة المدفوعات", "/admin/payments"],
  ["التقارير", "إحصائيات المنصة والإيرادات", "/admin/reports"],
  ["الإعدادات", "إعدادات المنصة العامة", "/admin/settings"],
]

async function getSummary() {
  const rows = await query<SummaryRow>(
    `
    SELECT
      (SELECT COUNT(*) FROM students) AS students_count,
      (SELECT COUNT(*) FROM teachers t JOIN users u ON u.id = t.user_id WHERE u.deleted_at IS NULL) AS teachers_count,
      (SELECT COUNT(*) FROM courses WHERE deleted_at IS NULL) AS courses_count,
      (SELECT COALESCE(SUM(amount_paid), 0) FROM payments WHERE status = 'completed') AS revenue_total,
      (SELECT COUNT(*) FROM student_course_requests WHERE status = 'pending') AS pending_requests
    `
  )

  return rows[0]
}

async function getLatestTeachers() {
  return query<TeacherRow>(
    `
    SELECT
      t.id,
      u.full_name,
      COUNT(DISTINCT c.id) AS courses_count,
      COUNT(DISTINCT sla.student_id) AS students_count
    FROM teachers t
    JOIN users u ON u.id = t.user_id
    LEFT JOIN courses c ON c.teacher_id = t.id AND c.deleted_at IS NULL
    LEFT JOIN chapters ch ON ch.course_id = c.id AND ch.deleted_at IS NULL
    LEFT JOIN lessons l ON l.chapter_id = ch.id AND l.deleted_at IS NULL
    LEFT JOIN student_lesson_access sla ON sla.lesson_id = l.id
    WHERE u.deleted_at IS NULL
    GROUP BY t.id, u.full_name
    ORDER BY t.id DESC
    LIMIT 3
    `
  )
}

async function getLatestStudents() {
  return query<StudentRow>(
    `
    SELECT
      s.id,
      s.student_code,
      u.full_name,
      et.name AS education_type_name,
      es.name AS stage_name,
      g.name AS grade_name
    FROM students s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN education_types et ON et.id = s.education_type_id
    LEFT JOIN educational_stages es ON es.id = s.stage_id
    LEFT JOIN grades g ON g.id = s.grade_id
    WHERE u.deleted_at IS NULL
    ORDER BY s.id DESC
    LIMIT 3
    `
  )
}

async function getLatestPayments() {
  return query<PaymentRow>(
    `
    SELECT
      p.id,
      p.invoice_number,
      u.full_name AS student_name,
      l.title AS lesson_title,
      p.amount_paid
    FROM payments p
    JOIN students s ON s.id = p.student_id
    JOIN users u ON u.id = s.user_id
    JOIN lessons l ON l.id = p.lesson_id
    WHERE p.status = 'completed'
    ORDER BY p.paid_at DESC
    LIMIT 3
    `
  )
}

async function getActivities() {
  return query<ActivityRow>(
    `
    SELECT
      CONCAT(u.full_name, ' طلب الانضمام إلى ', c.title) AS text,
      DATE_FORMAT(r.requested_at, '%Y-%m-%d %H:%i') AS activity_time
    FROM student_course_requests r
    JOIN students s ON s.id = r.student_id
    JOIN users u ON u.id = s.user_id
    JOIN courses c ON c.id = r.course_id
    ORDER BY r.requested_at DESC
    LIMIT 4
    `
  )
}

function money(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("ar-EG")} ج.م`
}

function getInitials(name: string) {
  return name.trim().slice(0, 1) || "م"
}

export default async function AdminDashboard() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "admin") {
    redirect("/403")
  }

  const [summary, teachers, students, payments, activities] = await Promise.all([
    getSummary(),
    getLatestTeachers(),
    getLatestStudents(),
    getLatestPayments(),
    getActivities(),
  ])

  const stats = [
    [String(Number(summary?.students_count || 0)), "طالب"],
    [String(Number(summary?.teachers_count || 0)), "مدرس"],
    [String(Number(summary?.courses_count || 0)), "كورس"],
    [money(summary?.revenue_total || 0), "إيرادات"],
  ]

  return (
    <main>
      <SiteHeader />

      <div className="wrap">
        <section className="admin-dashboard-grid">
          <div className="card admin-welcome">
            <span className="eyebrow">لوحة الإدارة</span>
            <h1 className="welcome-title">أهلًا، {user.full_name || "مدير النظام"} 👋</h1>
            <p className="muted mt-4 text-lg">
              تابع أداء المنصة، المدرسين، الطلاب، المدفوعات، والكورسات من مكان واحد.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/admin/teachers" className="btn">
                إدارة المدرسين
              </Link>
              <Link href="/admin/payments" className="btn btn-outline">
                تسجيل دفعة
              </Link>
              <Link href="/admin/courses" className="btn btn-outline">
                إدارة الكورسات
              </Link>
            </div>
          </div>

          <div className="admin-actions">
            <Link href="/admin/courses" className="admin-action-card">
              <span className="badge">الكورسات</span>
              <h3 className="mt-4 text-2xl font-black">راجع الكورسات المنشورة</h3>
              <p className="muted mt-2">تابع حالة الكورسات والحصص المتاحة للطلاب.</p>
            </Link>

            <Link href="/admin/reports" className="admin-action-card">
              <span className="badge">التقارير</span>
              <h3 className="mt-4 text-2xl font-black">إحصائيات وإيرادات</h3>
              <p className="muted mt-2">راقب نمو المنصة والمدفوعات الشهرية.</p>
            </Link>
          </div>
        </section>

        <section className="admin-stat-grid">
          {stats.map(([value, label]) => (
            <div className="card admin-stat-card" key={label}>
              <b>{value}</b>
              <span className="muted font-bold">{label}</span>
            </div>
          ))}
        </section>

        {Number(summary?.pending_requests || 0) > 0 ? (
          <section className="card mt-7 p-6 md:p-8">
            <span className="eyebrow">تنبيه</span>
            <h2 className="text-3xl font-black">
              يوجد {summary.pending_requests} طلب انضمام قيد المراجعة
            </h2>
            <p className="muted mt-3">
              يمكن للمدرسين مراجعة الطلبات من صفحاتهم، ويمكنك متابعة النشاط من التقارير.
            </p>
          </section>
        ) : null}
      </div>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">الإدارة السريعة</span>
            <h2 className="h2">أقسام لوحة التحكم</h2>
          </div>

          <div className="admin-nav-grid">
            {navCards.map(([title, description, href]) => (
              <Link href={href} className="card admin-nav-card" key={title}>
                <h3 className="text-2xl font-black">{title}</h3>
                <p className="muted mt-2">{description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section tint-section">
        <div className="wrap grid gap-7 lg:grid-cols-2">
          <div className="card admin-panel">
            <div className="toolbar">
              <div>
                <span className="eyebrow">المدرسون</span>
                <h2 className="text-3xl font-black">أحدث المدرسين</h2>
              </div>
              <Link href="/admin/teachers" className="btn btn-soft">
                عرض الكل
              </Link>
            </div>

            <div className="admin-row-list">
              {teachers.map((teacher) => (
                <div className="admin-row" key={teacher.id}>
                  <div className="admin-avatar">{getInitials(teacher.full_name)}</div>
                  <div>
                    <h3 className="font-black">{teacher.full_name}</h3>
                    <p className="muted text-sm">
                      {teacher.courses_count} كورس · {teacher.students_count} طالب
                    </p>
                  </div>
                  <span className="badge">نشط</span>
                </div>
              ))}

              {teachers.length === 0 ? <p className="muted">لا يوجد مدرسون بعد.</p> : null}
            </div>
          </div>

          <div className="card admin-panel">
            <div className="toolbar">
              <div>
                <span className="eyebrow">الطلاب</span>
                <h2 className="text-3xl font-black">أحدث الطلاب</h2>
              </div>
              <Link href="/admin/students" className="btn btn-soft">
                عرض الكل
              </Link>
            </div>

            <div className="admin-row-list">
              {students.map((student) => (
                <div className="admin-row" key={student.id}>
                  <div className="admin-avatar">{getInitials(student.full_name)}</div>
                  <div>
                    <h3 className="font-black">{student.full_name}</h3>
                    <p className="muted text-sm">
                      {student.education_type_name || "غير محدد"} · {student.stage_name || "غير محدد"} · {student.grade_name || "غير محدد"}
                    </p>
                  </div>
                  <span className="badge">{student.student_code}</span>
                </div>
              ))}

              {students.length === 0 ? <p className="muted">لا يوجد طلاب بعد.</p> : null}
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap grid gap-7 lg:grid-cols-[1fr_0.9fr]">
          <div className="card admin-panel">
            <div className="toolbar">
              <div>
                <span className="eyebrow">المدفوعات</span>
                <h2 className="text-3xl font-black">آخر المدفوعات</h2>
              </div>
              <Link href="/admin/payments" className="btn btn-soft">
                فتح المدفوعات
              </Link>
            </div>

            <div className="grid gap-3">
              {payments.map((payment) => (
                <div className="payment-row" key={payment.id}>
                  <div>
                    <h3 className="font-black">{payment.invoice_number}</h3>
                    <p className="muted text-sm">
                      {payment.student_name} · {payment.lesson_title}
                    </p>
                  </div>
                  <div className="amount">{money(payment.amount_paid)}</div>
                </div>
              ))}

              {payments.length === 0 ? <p className="muted">لا توجد مدفوعات بعد.</p> : null}
            </div>
          </div>

          <div className="card admin-panel">
            <span className="eyebrow">النشاطات</span>
            <h2 className="text-3xl font-black">آخر النشاطات</h2>

            <div className="activity-list mt-6">
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
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
