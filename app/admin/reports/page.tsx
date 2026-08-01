import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

const reports = [
  ["42,800", "ج.م إيرادات الشهر"],
  ["128", "طالب نشط"],
  ["27", "كورس متاح"],
  ["86%", "معدل إكمال الحصص"],
]

const bars = [42, 68, 55, 80, 63, 92, 74, 88]

const topCourses = [
  ["الرياضيات للصف الأول الثانوي", "12,400 ج.م", "82 طالب"],
  ["الفيزياء العملية", "8,900 ج.م", "61 طالب"],
  ["الكيمياء المبسطة", "5,300 ج.م", "44 طالب"],
]

export default function AdminReportsPage() {
  return (
    <main>
      <SiteHeader />

      <section className="admin-page-hero">
        <div className="wrap">
          <span className="eyebrow">لوحة الإدارة</span>
          <h1 className="h1">التقارير</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            راقب أداء المنصة، الإيرادات، الكورسات، ومعدلات تقدم الطلاب.
          </p>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap">
          <div className="toolbar">
            <div>
              <span className="eyebrow">نظرة عامة</span>
              <h2 className="text-3xl font-black">ملخص الأداء</h2>
            </div>

            <Link href="/admin" className="btn btn-outline">
              رجوع للوحة الإدارة
            </Link>
          </div>

          <div className="report-grid">
            {reports.map(([value, label]) => (
              <div className="card report-card" key={label}>
                <b>{value}</b>
                <span className="muted font-bold">{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-7 grid gap-7 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="card chart-card">
              <span className="eyebrow">الإيرادات</span>
              <h2 className="text-3xl font-black">أداء آخر 8 أسابيع</h2>

              <div className="fake-chart mt-6">
                {bars.map((height, index) => (
                  <div
                    className="chart-bar"
                    style={{ height: `${height}%` }}
                    key={index}
                  />
                ))}
              </div>
            </div>

            <div className="card admin-panel">
              <span className="eyebrow">الأعلى أداءً</span>
              <h2 className="text-3xl font-black">أفضل الكورسات</h2>

              <div className="admin-row-list mt-6">
                {topCourses.map(([course, revenue, students]) => (
                  <div className="payment-row" key={course}>
                    <div>
                      <h3 className="font-black">{course}</h3>
                      <p className="muted text-sm">{students}</p>
                    </div>
                    <div className="amount">{revenue}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
