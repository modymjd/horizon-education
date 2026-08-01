import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

const codes = [
  {
    code: "HZ-MATH-84K2",
    lesson: "الحصة الأولى: المتغيرات والمعادلات",
    status: "جديد",
    usage: "12 استخدام متاح",
    expires: "ينتهي خلال 14 يوم",
  },
  {
    code: "HZ-REV-19PL",
    lesson: "مراجعة الجبر",
    status: "جديد",
    usage: "5 استخدامات متاحة",
    expires: "ينتهي خلال 7 أيام",
  },
  {
    code: "HZ-CALC-77QW",
    lesson: "قواعد الاشتقاق",
    status: "مستخدم",
    usage: "تم استخدامه بواسطة طالب",
    expires: "صالح",
  },
]

export default function TeacherAccessCodesPage() {
  return (
    <main>
      <SiteHeader />

      <section className="teacher-page-hero">
        <div className="wrap">
          <span className="eyebrow">لوحة المدرس</span>
          <h1 className="h1">أكواد الوصول</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            أنشئ أكواد وصول للحصص، وراجع حالة الأكواد المستخدمة والجديدة.
          </p>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="card code-generator">
            <span className="eyebrow">إنشاء أكواد</span>
            <h2 className="text-3xl font-black">ولّد أكواد جديدة</h2>
            <p className="muted mt-3">
              اختر الحصة وعدد الأكواد، وسيظهر الكود للطالب مرة واحدة.
            </p>

            <div className="form-grid mt-6">
              <label className="font-bold">
                الحصة
                <select className="input mt-2" defaultValue="lesson-1">
                  <option value="lesson-1">المتغيرات والمعادلات</option>
                  <option value="lesson-2">تبسيط التعبيرات الجبرية</option>
                  <option value="lesson-3">قواعد الاشتقاق</option>
                </select>
              </label>

              <label className="font-bold">
                عدد الأكواد
                <input className="input mt-2" type="number" min="1" max="500" defaultValue="10" />
              </label>

              <label className="font-bold">
                تاريخ الانتهاء
                <input className="input mt-2" type="date" />
              </label>

              <label className="font-bold">
                نوع الكود
                <select className="input mt-2" defaultValue="single">
                  <option value="single">استخدام مرة واحدة</option>
                  <option value="multi">متعدد الاستخدام</option>
                </select>
              </label>
            </div>

            <button className="btn btn-block mt-6">
              إنشاء الأكواد
            </button>

            <p className="muted mt-4 text-sm">
              ملاحظة: هذه واجهة جاهزة، وربط الإنشاء الفعلي بالـ API يتم في الخطوة التالية.
            </p>
          </aside>

          <div>
            <div className="toolbar">
              <div>
                <span className="eyebrow">الأكواد</span>
                <h2 className="h2">آخر الأكواد</h2>
              </div>

              <Link href="/teacher" className="btn btn-outline">
                رجوع للوحة المدرس
              </Link>
            </div>

            <div className="code-table">
              {codes.map((item) => (
                <div className="code-row" key={item.code}>
                  <div>
                    <div className="code-token">{item.code}</div>
                    <p className="muted mt-1">{item.lesson}</p>
                  </div>

                  <span className="badge">{item.status}</span>

                  <div>
                    <p className="font-bold">{item.usage}</p>
                    <p className="muted text-sm">{item.expires}</p>
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
