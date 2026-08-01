import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

const settings = [
  ["تفعيل تسجيل الطلاب", "السماح للطلاب بإنشاء حسابات جديدة من صفحة التسجيل."],
  ["مراجعة المدرسين قبل النشر", "أي مدرس جديد يحتاج موافقة الإدارة قبل الظهور."],
  ["إظهار الشهادات العامة", "السماح بالتحقق من الشهادات برقم الشهادة."],
  ["تنبيهات المدفوعات", "إرسال إشعار عند تسجيل دفعة جديدة."],
]

export default function AdminSettingsPage() {
  return (
    <main>
      <SiteHeader />

      <section className="admin-page-hero">
        <div className="wrap">
          <span className="eyebrow">لوحة الإدارة</span>
          <h1 className="h1">الإعدادات</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            إعدادات عامة لشكل المنصة، التسجيل، الشهادات، والتنبيهات.
          </p>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="card settings-card">
            <span className="eyebrow">المنصة</span>
            <h2 className="text-3xl font-black">بيانات المنصة</h2>

            <div className="mt-6 grid gap-4">
              <label className="font-bold">
                اسم المنصة
                <input className="input mt-2" defaultValue="حورايزون تعليم" />
              </label>

              <label className="font-bold">
                رابط الموقع
                <input className="input mt-2" defaultValue="http://localhost:3000" />
              </label>

              <label className="font-bold">
                البريد الإداري
                <input className="input mt-2" defaultValue="admin@horizon.test" />
              </label>
            </div>

            <button className="btn btn-block mt-6">
              حفظ الإعدادات
            </button>

            <p className="muted mt-4 text-sm">
              هذه واجهة جاهزة، وربط الحفظ الفعلي بالـ API يتم لاحقًا.
            </p>
          </aside>

          <div className="card settings-card">
            <div className="toolbar">
              <div>
                <span className="eyebrow">الخيارات</span>
                <h2 className="text-3xl font-black">إعدادات التشغيل</h2>
              </div>

              <Link href="/admin" className="btn btn-outline">
                رجوع للوحة الإدارة
              </Link>
            </div>

            <div>
              {settings.map(([title, description]) => (
                <div className="settings-row" key={title}>
                  <div>
                    <h3 className="font-black">{title}</h3>
                    <p className="muted text-sm">{description}</p>
                  </div>

                  <div className="toggle-pill" />
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
