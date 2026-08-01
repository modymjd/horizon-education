import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { query } from "@/lib/db"

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

async function getPayments() {
  const payments = await query<PaymentRow>(`
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
    LEFT JOIN students s ON s.id = p.student_id
    LEFT JOIN users su ON su.id = s.user_id
    LEFT JOIN lessons l ON l.id = p.lesson_id
    LEFT JOIN payment_methods pm ON pm.id = p.payment_method_id
    ORDER BY p.id DESC
  `)

  return payments
}

function money(value: number | string | null | undefined) {
  return `${Number(value || 0).toLocaleString("ar-EG")} ج.م`
}

function getStatusLabel(status: string) {
  if (status === "completed") return "مكتمل"
  if (status === "pending") return "معلق"
  if (status === "refunded") return "مسترد"
  if (status === "cancelled") return "ملغي"
  return status
}

export default async function AdminPaymentsPage() {
  const payments = await getPayments()

  const totalRevenue = payments.reduce((sum, payment) => sum + Number(payment.amount_paid || 0), 0)
  const platformRevenue = payments.reduce((sum, payment) => sum + Number(payment.platform_amount || 0), 0)
  const teacherRevenue = payments.reduce((sum, payment) => sum + Number(payment.teacher_amount || 0), 0)

  return (
    <main>
      <SiteHeader />

      <section className="admin-page-hero">
        <div className="wrap">
          <span className="eyebrow">لوحة الإدارة</span>
          <h1 className="h1">المدفوعات</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            راجع المدفوعات، سجّل دفعة جديدة، وتابع نصيب المنصة والمدرسين.
          </p>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap grid gap-7 lg:grid-cols-[0.85fr_1.15fr]">
          <aside className="card payment-form">
            <span className="eyebrow">تسجيل دفعة</span>
            <h2 className="text-3xl font-black">إضافة دفعة جديدة</h2>
            <p className="muted mt-3">
              هذه واجهة جاهزة، وربط الحفظ الفعلي بالـ API يتم في خطوة لاحقة.
            </p>

            <div className="form-grid mt-6">
              <label className="font-bold">
                الطالب
                <select className="input mt-2" defaultValue="">
                  <option value="">اختر الطالب</option>
                </select>
              </label>

              <label className="font-bold">
                الحصة
                <select className="input mt-2" defaultValue="">
                  <option value="">اختر الحصة</option>
                </select>
              </label>

              <label className="font-bold">
                المبلغ
                <input className="input mt-2" type="number" placeholder="75" />
              </label>

              <label className="font-bold">
                طريقة الدفع
                <select className="input mt-2" defaultValue="">
                  <option value="">اختر طريقة الدفع</option>
                </select>
              </label>
            </div>

            <button className="btn btn-block mt-6">
              تسجيل الدفعة
            </button>
          </aside>

          <div>
            <div className="admin-summary-grid">
              <div className="card summary-card">
                <b>{money(totalRevenue)}</b>
                <span className="muted font-bold">إجمالي الإيرادات</span>
              </div>
              <div className="card summary-card">
                <b>{money(platformRevenue)}</b>
                <span className="muted font-bold">نصيب المنصة</span>
              </div>
              <div className="card summary-card">
                <b>{money(teacherRevenue)}</b>
                <span className="muted font-bold">نصيب المدرسين</span>
              </div>
            </div>

            <div className="toolbar">
              <div>
                <span className="eyebrow">السجل</span>
                <h2 className="text-3xl font-black">آخر المدفوعات</h2>
              </div>

              <Link href="/admin" className="btn btn-outline">
                رجوع للوحة الإدارة
              </Link>
            </div>

            <div className="card admin-table-card">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>الفاتورة</th>
                    <th>الطالب</th>
                    <th>الحصة</th>
                    <th>الطريقة</th>
                    <th>المبلغ</th>
                    <th>الحالة</th>
                    <th>التاريخ</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td><b>{payment.invoice_number}</b></td>
                      <td>{payment.student_name || "غير محدد"}</td>
                      <td>{payment.lesson_title || "غير محدد"}</td>
                      <td>{payment.payment_method_name || "غير محدد"}</td>
                      <td className="amount">{money(payment.amount_paid)}</td>
                      <td><span className="badge">{getStatusLabel(payment.status)}</span></td>
                      <td>{payment.paid_at}</td>
                    </tr>
                  ))}

                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={7}>لا توجد مدفوعات مسجلة بعد.</td>
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
