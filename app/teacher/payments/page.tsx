import Link from "next/link"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { TeacherPaymentCreateForm } from "@/components/teacher/TeacherPaymentCreateForm"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type PaymentRow = {
  id: number
  invoice_number: string
  student_name: string | null
  lesson_title: string | null
  payment_method_name: string | null
  amount_paid: number
  platform_amount: number
  teacher_amount: number
  status: string
  paid_at: string
}

type StudentOption = {
  id: number
  full_name: string
  student_code: string | null
}

type LessonOption = {
  id: number
  title: string
  course_title: string | null
  price: number
}

type PaymentMethodOption = {
  id: number
  name: string
}

async function getPayments(teacherId: number) {
  return query<PaymentRow>(
    `
    SELECT
      p.id,
      p.invoice_number,
      su.full_name AS student_name,
      l.title AS lesson_title,
      pm.name AS payment_method_name,
      p.amount_paid,
      p.platform_amount,
      p.teacher_amount,
      p.status,
      DATE_FORMAT(p.paid_at, '%Y-%m-%d') AS paid_at
    FROM payments p
    JOIN lessons l ON l.id = p.lesson_id
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    LEFT JOIN students s ON s.id = p.student_id
    LEFT JOIN users su ON su.id = s.user_id
    LEFT JOIN payment_methods pm ON pm.id = p.payment_method_id
    WHERE c.teacher_id = ?
    ORDER BY p.id DESC
    `,
    [teacherId]
  )
}

async function getStudents(teacherId: number) {
  return query<StudentOption>(
    `
    SELECT DISTINCT
      s.id,
      u.full_name,
      s.student_code
    FROM students s
    JOIN users u ON u.id = s.user_id
    JOIN student_course_requests scr ON scr.student_id = s.id AND scr.status = 'accepted'
    JOIN courses c ON c.id = scr.course_id
    WHERE c.teacher_id = ?
      AND u.deleted_at IS NULL
      AND u.status = 'active'
    ORDER BY u.full_name ASC
    `,
    [teacherId]
  )
}

async function getLessons(teacherId: number) {
  return query<LessonOption>(
    `
    SELECT
      l.id,
      l.title,
      c.title AS course_title,
      l.price
    FROM lessons l
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    WHERE c.teacher_id = ?
      AND l.status = 'published'
    ORDER BY c.title ASC, l.sort_order ASC
    `,
    [teacherId]
  )
}

async function getPaymentMethods() {
  return query<PaymentMethodOption>(
    `
    SELECT id, name
    FROM payment_methods
    WHERE is_active = 1
    ORDER BY id ASC
    `
  )
}

function money(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("en-US")} EGP`
}

function getStatusLabel(status: string) {
  if (status === "completed") return "Completed"
  if (status === "pending") return "Pending"
  if (status === "refunded") return "Refunded"
  if (status === "cancelled") return "Cancelled"
  return status
}

export default async function TeacherPaymentsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher" || !user.teacher_id) {
    redirect("/403")
  }

  const teacherId = user.teacher_id

  const [payments, students, lessons, paymentMethods] = await Promise.all([
    getPayments(teacherId),
    getStudents(teacherId),
    getLessons(teacherId),
    getPaymentMethods(),
  ])

  const totalRevenue = payments.reduce(
    (sum, payment) => sum + Number(payment.amount_paid || 0),
    0
  )
  const platformRevenue = payments.reduce(
    (sum, payment) => sum + Number(payment.platform_amount || 0),
    0
  )
  const teacherRevenue = payments.reduce(
    (sum, payment) => sum + Number(payment.teacher_amount || 0),
    0
  )

  return (
    <main>
      <SiteHeader />

      <section className="teacher-page-hero">
        <div className="wrap">
          <span className="eyebrow">Teacher Dashboard</span>
          <h1 className="h1">Payments</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            Record payments for students in your own courses. Every payment you record here is tracked as official platform revenue and automatically split between you and the platform.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/teacher" className="btn">
              Back to Teacher Dashboard
            </Link>
          </div>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap grid gap-7 lg:grid-cols-[0.85fr_1.15fr]">
          <TeacherPaymentCreateForm
            students={students}
            lessons={lessons}
            paymentMethods={paymentMethods}
          />

          <div>
            <div className="admin-summary-grid">
              <div className="card summary-card">
                <b>{money(totalRevenue)}</b>
                <span className="muted font-bold">Total Revenue</span>
              </div>
              <div className="card summary-card">
                <b>{money(platformRevenue)}</b>
                <span className="muted font-bold">Platform Share</span>
              </div>
              <div className="card summary-card">
                <b>{money(teacherRevenue)}</b>
                <span className="muted font-bold">Your Share</span>
              </div>
            </div>

            <div className="toolbar">
              <div>
                <span className="eyebrow">History</span>
                <h2 className="text-3xl font-black">Your Payments</h2>
              </div>
            </div>

            <div className="card admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Student</th>
                    <th>Lesson</th>
                    <th>Method</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>
                        <b>{payment.invoice_number}</b>
                      </td>
                      <td>{payment.student_name || "Not specified"}</td>
                      <td>{payment.lesson_title || "Not specified"}</td>
                      <td>{payment.payment_method_name || "Not specified"}</td>
                      <td className="amount">{money(payment.amount_paid)}</td>
                      <td>
                        <span className="badge">
                          {getStatusLabel(payment.status)}
                        </span>
                      </td>
                      <td>{payment.paid_at}</td>
                    </tr>
                  ))}

                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={7}>No payments recorded yet.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

