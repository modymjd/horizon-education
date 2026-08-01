import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

const subjects = [
  ["الرياضيات", "الجبر، الهندسة، التفاضل والتكامل", "24 حصة"],
  ["مراجعات نهائية", "حل امتحانات وتدريبات مركزة", "8 حصص"],
  ["تأسيس رياضيات", "تقوية الأساسيات قبل المنهج", "12 حصة"],
]

const timeline = [
  ["2014", "بدأ تدريس الرياضيات للمرحلة الثانوية."],
  ["2018", "طوّر طريقة شرح تعتمد على التصور البصري قبل القوانين."],
  ["2022", "درّس لأكثر من 5000 طالب في كورسات مباشرة ومسجلة."],
  ["2026", "انضم إلى حورايزون تعليم لتقديم تجربة تعلم منظمة ومتابعة."],
]

const testimonials = [
  ["محمد محمود", "شرح د. أحمد خلاني أفهم المسائل بدل ما أحفظ خطواتها."],
  ["سارة علي", "التدريبات بعد كل حصة كانت أهم حاجة ساعدتني أتحسن."],
  ["كريم حسن", "طريقة المتابعة خلتني أعرف مستوايا الحقيقي قبل الامتحان."],
]

export default function TeacherProfilePage() {
  return (
    <main>
      <SiteHeader />

      <section className="teacher-hero">
        <div className="wrap teacher-hero-grid">
          <aside className="teacher-portrait">
            <div className="teacher-avatar-large">أ</div>
            <div className="relative z-10 mt-8">
              <span className="lesson-pill">مدرس رياضيات</span>
              <h1 className="mt-5 font-[var(--display)] text-7xl font-bold leading-none">
                د. أحمد درويش
              </h1>
              <p className="mt-4 max-w-sm opacity-85">
                خبرة 10 سنوات في تبسيط الرياضيات للمرحلة الثانوية.
              </p>
            </div>
          </aside>

          <div className="card teacher-info-card">
            <span className="eyebrow">عن المدرس</span>
            <h2 className="h2">شرح منظم، تدريبات واضحة، ومتابعة مستمرة</h2>
            <p className="muted mt-5 text-lg">
              د. أحمد بيشرح الرياضيات بطريقة تعتمد على فهم الفكرة قبل القانون،
              مع أمثلة متدرجة وتدريبات بعد كل حصة عشان الطالب يعرف مستواه.
            </p>

            <div className="teacher-stats mt-8">
              <div className="teacher-stat">
                <b>10+</b>
                <span className="muted">سنوات خبرة</span>
              </div>
              <div className="teacher-stat">
                <b>5000+</b>
                <span className="muted">طالب</span>
              </div>
              <div className="teacher-stat">
                <b>32</b>
                <span className="muted">حصة متاحة</span>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/courses/math-grade-one" className="btn">
                ابدأ مع المدرس
              </Link>
              <Link href="/teachers" className="btn btn-outline">
                كل المدرسين
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">المواد</span>
            <h2 className="h2">المواد اللي بيدرّسها أحمد</h2>
          </div>

          <div className="grid-auto">
            {subjects.map(([title, description, lessons]) => (
              <Link href="/courses/math-grade-one" className="card teacher-subject" key={title}>
                <span className="badge">{lessons}</span>
                <h3 className="mt-5 text-2xl font-black">{title}</h3>
                <p className="muted mt-2">{description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section tint-section">
        <div className="wrap grid gap-8 lg:grid-cols-2">
          <div>
            <span className="eyebrow">الرحلة</span>
            <h2 className="h2">رحلة أحمد في التدريس</h2>
          </div>

          <div className="timeline">
            {timeline.map(([year, text]) => (
              <div className="timeline-item" key={year}>
                <div className="timeline-dot" />
                <div className="card p-5">
                  <h3 className="text-xl font-black">{year}</h3>
                  <p className="muted mt-1">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">آراء الطلاب</span>
            <h2 className="h2">اللي طلبة أحمد بيقولوه</h2>
          </div>

          <div className="grid-auto">
            {testimonials.map(([name, text]) => (
              <div className="card testimonial" key={name}>
                <p className="text-lg font-bold">“{text}”</p>
                <p className="muted mt-4">— {name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section tint-section">
        <div className="wrap">
          <div className="card p-8 md:p-12">
            <span className="eyebrow">ابدأ دلوقتي</span>
            <h2 className="h2">جاهز تبدأ مع أحمد؟</h2>
            <p className="muted mt-5 max-w-3xl">
              افتح كورس الرياضيات وابدأ أول حصة بتجربة تعليم منظمة ومتابعة واضحة.
            </p>
            <div className="mt-8">
              <Link href="/courses/math-grade-one" className="btn">
                ابدأ الكورس
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
