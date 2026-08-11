import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

export default function AdminSettingsPage() {
  return (
    <main>
      <SiteHeader />

      <section className="section">
        <div className="wrap">
          <div className="card p-6 md:p-10">
            <span className="eyebrow">لوحة الأدمن</span>
            <h1 className="h2">إعدادات المنصة</h1>
            <p className="muted mt-4">
              إعدادات عامة للمنصة. لا تعرض بيانات دخول تجريبية في بيئة الإنتاج.
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <label>
                اسم المنصة
                <input className="input mt-2" defaultValue="Horizon Education" />
              </label>

              <label>
                البريد الرسمي
                <input className="input mt-2" defaultValue="support@horizon-education.com" />
              </label>

              <label>
                العملة
                <input className="input mt-2" defaultValue="ج.م" />
              </label>

              <label>
                نسبة المنصة الافتراضية
                <input className="input mt-2" defaultValue="20" />
              </label>
            </div>

            <div className="mt-8 flex gap-3">
              <button className="btn" type="button">
                حفظ الإعدادات
              </button>

              <Link href="/admin" className="btn btn-outline">
                رجوع للوحة الأدمن
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
