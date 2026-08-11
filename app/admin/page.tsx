import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

const stats = [
  ["128", "طالب"],
  ["14", "مدرس"],
  ["27", "كورس"],
  ["42,800", "ج.م إيرادات"],
]

const teachers = [
  ["أ", "د. أحمد درويش", "رياضيات · 82 طالب · 4 كورسات"],
  ["م", "أ. مريم علي", "فيزياء · 61 طالب · 3 كورسات"],
  ["س", "أ. سارة محمود", "كيمياء · 44 طالب · 2 كورسات"],
]

const students = [
  ["م", "محمد محمود", "الصف الأول الثانوي · نشط"],
  ["س", "سارة أحمد", "الصف الأول الثانوي · نشط"],
  ["ع", "علي حسن", "الصف الثاني الثانوي · يحتاج متابعة"],
]

const payments = [
  ["INV-2026-8K2A", "محمد محمود · حصة المتغيرات والمعادلات", "75 ج.م"],
  ["INV-2026-3QW9", "سارة أحمد · مراجعة الجبر", "120 ج.م"],
  ["INV-2026-7PL1", "علي حسن · كورس الرياضيات", "300 ج.م"],
]

const navCards = [
  ["المدرسون", "إضافة وتعديل بيانات المدرسين", "/admin/teachers"],
  ["الطلاب", "متابعة الطلاب والحسابات", "/admin/students"],
  ["الكورسات", "إدارة الكورسات والحصص", "/admin/courses"],
  ["المدفوعات", "تسجيل ومراجعة المدفوعات", "/admin/payments"],
  ["التقارير", "إحصائيات المنصة والإيرادات", "/admin/reports"],
  ["الإعدادات", "إعدادات المنصة العامة", "/admin/settings"],
]

const activities = [
  ["تم تسجيل دفعة جديدة بقيمة 300 ج.م.", "منذ 10 دقائق"],
  ["تم إضافة مدرس جديد إلى قسم الفيزياء.", "منذ ساعة"],
  ["طالب جديد أكمل التسجيل في المنصة.", "منذ ساعتين"],
  ["تم نشر كورس الرياضيات للصف الأول الثانوي.", "أمس"],
]

export default function AdminDashboard() {
  return (
    <main>
      <SiteHeader />

      <div className="wrap">
        <section className="admin-dashboard-grid">
          <div className="card admin-welcome">
            <span className="eyebrow">لوحة الإدارة</span>
            <h1 className="welcome-title">أهلًا، مدير النظام 👋</h1>
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
              {teachers.map(([letter, name, meta]) => (
                <div className="admin-row" key={name}>
                  <div className="admin-avatar">{letter}</div>
                  <div>
                    <h3 className="font-black">{name}</h3>
                    <p className="muted text-sm">{meta}</p>
                  </div>
                  <span className="badge">نشط</span>
                </div>
              ))}
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
              {students.map(([letter, name, meta]) => (
                <div className="admin-row" key={name}>
                  <div className="admin-avatar">{letter}</div>
                  <div>
                    <h3 className="font-black">{name}</h3>
                    <p className="muted text-sm">{meta}</p>
                  </div>
                  <span className="badge">متابعة</span>
                </div>
              ))}
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
              {payments.map(([invoice, details, amount]) => (
                <div className="payment-row" key={invoice}>
                  <div>
                    <h3 className="font-black">{invoice}</h3>
                    <p className="muted text-sm">{details}</p>
                  </div>
                  <div className="amount">{amount}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card admin-panel">
            <span className="eyebrow">النشاطات</span>
            <h2 className="text-3xl font-black">آخر النشاطات</h2>

            <div className="activity-list mt-6">
              {activities.map(([text, time]) => (
                <div className="activity-item" key={text}>
                  <div className="activity-dot" />
                  <div>
                    <p className="font-bold">{text}</p>
                    <p className="muted text-sm">{time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
