import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

const courses = [
  {
    title: "الرياضيات للصف الأول الثانوي",
    description: "كورس تأسيسي منظم في الجبر والتفاضل والتكامل.",
    status: "منشور",
    statusClass: "status-published",
    lessons: "24",
    students: "82",
    revenue: "12,400",
    progress: 76,
  },
  {
    title: "مراجعة نهائية — الجبر",
    description: "حل امتحانات وتدريبات مركزة قبل الاختبار.",
    status: "مسودة",
    statusClass: "status-draft",
    lessons: "8",
    students: "41",
    revenue: "3,250",
    progress: 45,
  },
  {
    title: "تأسيس رياضيات",
    description: "تقوية الأساسيات قبل الدخول في المنهج.",
    status: "منشور",
    statusClass: "status-published",
    lessons: "12",
    students: "35",
    revenue: "2,800",
    progress: 60,
  },
]

export default function TeacherCoursesPage() {
  return (
    <main>
      <SiteHeader />

      <section className="teacher-page-hero">
        <div className="wrap">
          <span className="eyebrow">لوحة المدرس</span>
          <h1 className="h1">إدارة الكورسات</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            راجع كورساتك، أضف حصص جديدة، وتابع أعداد الطلاب والإيرادات.
          </p>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap">
          <div className="toolbar">
            <div className="search-row">
              <input className="input" placeholder="ابحث عن كورس..." />
              <select className="input" defaultValue="all">
                <option value="all">كل الحالات</option>
                <option value="published">منشور</option>
                <option value="draft">مسودة</option>
              </select>
            </div>

            <Link href="/teacher/courses/new" className="btn">
              إضافة كورس جديد
            </Link>
          </div>

          <div className="grid gap-5">
            {courses.map((course) => (
              <div className="card course-management-card" key={course.title}>
                <div className="course-management-head">
                  <div>
                    <span className={`status-pill ${course.statusClass}`}>
                      {course.status}
                    </span>
                    <h2 className="mt-4 text-3xl font-black">{course.title}</h2>
                    <p className="muted mt-2">{course.description}</p>
                  </div>

                  <div className="course-actions">
                    <Link href="/courses/math-grade-one" className="btn btn-soft">
                      معاينة
                    </Link>
                    <Link href="/teacher/courses" className="btn btn-outline">
                      تعديل
                    </Link>
                  </div>
                </div>

                <div className="course-metrics">
                  <div className="metric-mini">
                    <b>{course.lessons}</b>
                    <span className="muted">حصة</span>
                  </div>
                  <div className="metric-mini">
                    <b>{course.students}</b>
                    <span className="muted">طالب</span>
                  </div>
                  <div className="metric-mini">
                    <b>{course.revenue}</b>
                    <span className="muted">ج.م إيرادات</span>
                  </div>
                </div>

                <div className="progress-track mt-5">
                  <div
                    className="progress-fill"
                    style={{ width: `${course.progress}%` }}
                  />
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
