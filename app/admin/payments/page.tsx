import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

const payments = [
  ["INV-2026-8K2A", "محمد محمود", "الحصة الأولى: المتغيرات والمعادلات", "نقدي", "75 ج.م", "مكتمل"],
  ["INV-2026-3QW9", "سارة أحمد", "مراجعة الجبر", "محفظة إلكترونية", "120 ج.م", "مكتمل"],
  ["INV-2026-7PL1", "علي حسن", "كورس الرياضيات", "تحويل بنكي", "300 ج.م", "مكتمل"],
  ["INV-2026-2AA4", "نور خالد", "كورس الفيزياء", "بطاقة دفع", "250 ج.م", "معلق"],
]

export default function AdminPaymentsPage() {
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
              هذه واجهة جاهزة، وربطها بالـ API يتم في الخطوة التالية.
            </p>

            <div className="form-grid mt-6">
              <label className="font-bold">
                الطالب
                <select className="input mt-2" defaultValue="student-1">
                  <option value="student-1">محمد محمود</option>
                  <option value="student-2">سارة أحمد</option>
                </select>
              </label>

              <label className="font-bold">
                الحصة
                <select className="input mt-2" defaultValue="lesson-1">
                  <option value="lesson-1">المتغيرات والمعادلات</option>
                  <option value="lesson-2">مراجعة الجبر</option>
                </select>
              </label>

              <label className="font-bold">
                المبلغ
                <input className="input mt-2" type="number" defaultValue="75" />
              </label>

              <label className="font-bold">
                طريقة الدفع
                <select className="input mt-2" defaultValue="cash">
                  <option value="cash">نقدي</option>
                  <option value="wallet">محفظة إلكترونية</option>
                  <option value="bank">تحويل بنكي</option>
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
                <b>42,800</b>
                <span className="muted font-bold">ج.م إجمالي الإيرادات</span>
              </div>
              <div className="card summary-card">
                <b>8,560</b>
                <span className="muted font-bold">نصيب المنصة</span>
              </div>
              <div className="card summary-card">
                <b>34,240</b>
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
                  </tr>
                </thead>
                <tbody>
                  {payments.map(([invoice, student, lesson, method, amount, status]) => (
                    <tr key={invoice}>
                      <td><b>{invoice}</b></td>
                      <td>{student}</td>
                      <td>{lesson}</td>
                      <td>{method}</td>
                      <td className="amount">{amount}</td>
                      <td><span className="badge">{status}</span></td>
                    </tr>
                  ))}
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
