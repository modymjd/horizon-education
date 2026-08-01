import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

const stats = [
  ["128", "طالب نشط"],
  ["4", "كورسات منشورة"],
  ["32", "حصة متاحة"],
  ["18,450", "ج.م أرباح"],
]

const courses = [
  {
    title: "الرياضيات للصف الأول الثانوي",
    meta: "24 حصة · 82 طالب · منشور",
    progress: 76,
    letter: "ر",
  },
  {
    title: "مراجعة نهائية — الجبر",
    meta: "8 حصص · 41 طالب · مسودة",
    progress: 45,
    letter: "ج",
  },
  {
    title: "تأسيس رياضيات",
    meta: "12 حصة · 35 طالب · منشور",
    progress: 60,
    letter: "ت",
  },
]

const codes = [
  ["HZ-MATH-84K2", "الحصة الأولى: المتغيرات والمعادلات", "12 استخدام متاح"],
  ["HZ-REV-19PL", "مراجعة الجبر", "5 استخدامات متاحة"],
]

const activities = [
  ["محمد محمود فعّل كود وصول لحصة المتغيرات والمعادلات.", "منذ 12 دقيقة"],
  ["تم تسجيل دفعة جديدة على كورس الرياضيات.", "منذ ساعة"],
  ["سارة أحمد أنهت اختبار قصير بنسبة 88%.", "منذ 3 ساعات"],
  ["تم إضافة 3 طلاب جدد لقائمة المتابعة.", "أمس"],
]

export default function TeacherDashboard() {
  return (
    <main>
      <SiteHeader />

      <div className="wrap">
        <section className="teacher-dashboard-grid">
          <div className="card teacher-welcome">
            <span className="eyebrow">لوحة المدرس</span>
            <h1 className="welcome-title">أهلًا، د. أحمد 👋</h1>
            <p className="muted mt-4 text-lg">
              عندك 3 طلاب محتاجين متابعة، ودفعة جديدة بدأت كورس الرياضيات.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/teacher/courses" className="btn">
                إدارة الكورسات
              </Link>
              <Link href="/teacher/access-codes" className="btn btn-outline">
                إنشاء أكواد وصول
              </Link>
            </div>
          </div>

          <div className="teacher-actions">
            <Link href="/teacher/courses" className="teacher-action-card">
              <span className="badge">الكورسات</span>
              <h3 className="mt-4 text-2xl font-black">أضف حصة جديدة</h3>
              <p className="muted mt-2">ارفع فيديو أو أضف محتوى جديد لكورس منشور.</p>
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
            <span className="lesson-pill">الحصة التالية</span>
            <h2 className="mt-5 font-[var(--display)] text-5xl font-bold leading-none">
              قواعد الاشتقاق — الباب الرابع
            </h2>
            <p className="muted mt-4">
              جهّز التدريب القصير واربطه بالحصة قبل نشرها للطلاب.
            </p>
          </div>

          <Link href="/teacher/courses" className="btn">
            إدارة الحصة
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
                <div className="teacher-course-row" key={course.title}>
                  <div className="course-letter">{course.letter}</div>

                  <div>
                    <h3 className="text-xl font-black">{course.title}</h3>
                    <p className="muted">{course.meta}</p>

                    <div className="progress-track mt-4">
                      <div
                        className="progress-fill"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>

                  <Link href="/teacher/courses" className="btn btn-soft">
                    فتح
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <aside>
            <div className="section-head">
              <span className="eyebrow">أكواد الوصول</span>
              <h2 className="h2">آخر الأكواد</h2>
            </div>

            <div className="grid gap-4">
              {codes.map(([code, lesson, usage]) => (
                <div className="card access-code-card" key={code}>
                  <h3 className="text-xl font-black">{lesson}</h3>
                  <p className="muted mt-2">{usage}</p>
                  <span className="code-preview">{code}</span>
                </div>
              ))}
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
      </section>

      <SiteFooter />
    </main>
  )
}
