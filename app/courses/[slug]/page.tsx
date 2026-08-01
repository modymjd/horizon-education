import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

const skills = [
  "تفهم المتغيرات والمعادلات بدل حفظ خطوات الحل",
  "تحل مسائل متدرجة من السهل للصعب",
  "تربط الجبر بالتطبيقات اليومية والامتحانات",
  "تتابع تقدمك بعد كل حصة بتدريبات قصيرة",
]

const lessons = [
  ["1", "المتغيرات والمعادلات", "25 دقيقة"],
  ["2", "تبسيط التعبيرات الجبرية", "32 دقيقة"],
  ["3", "حل المعادلات الخطية", "28 دقيقة"],
  ["4", "قواعد الاشتقاق", "35 دقيقة"],
  ["5", "تطبيقات على التفاضل", "30 دقيقة"],
  ["6", "مراجعة واختبار قصير", "20 دقيقة"],
]

const testimonials = [
  ["محمد محمود", "أول مرة أحس إن الجبر مفهوم ومش مجرد خطوات بحفظها."],
  ["سارة أحمد", "طريقة الشرح بالرسومات والتدريبات فرقت معايا جدًا."],
  ["علي حسن", "المتابعة بعد كل حصة خلتني أعرف أنا واقف فين."],
]

export default function CoursePage() {
  return (
    <main>
      <SiteHeader />

      <section className="course-hero">
        <div className="wrap course-hero-grid">
          <div className="card course-panel">
            <div className="course-meta">
              <span className="badge">رياضيات</span>
              <span className="badge">الصف الأول الثانوي</span>
              <span className="badge">24 حصة</span>
            </div>

            <h1 className="h1 mt-6">
              من الجبر للتفاضل والتكامل — بأسلوب خطوة بخطوة
            </h1>

            <p className="muted mt-6 text-lg">
              كورس تأسيسي منظم يساعدك تفهم الرياضيات من البداية، مع حصص قصيرة،
              تدريبات بعد كل درس، ومتابعة واضحة لمستواك.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="btn">
                ابدأ الكورس
              </Link>
              <Link href="/subjects" className="btn btn-outline">
                رجوع للمواد
              </Link>
            </div>
          </div>

          <aside className="course-preview">
            <span className="lesson-pill">شرح تفاعلي + تدريبات</span>
            <h2 className="mt-5 font-[var(--display)] text-6xl font-bold leading-none">
              الرياضيات بشكل مختلف
            </h2>
            <p className="mt-4 max-w-sm opacity-80">
              كل درس متقسم لفكرة، مثال، تدريب، وقياس تقدم.
            </p>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="wrap grid gap-7 lg:grid-cols-[1fr_340px]">
          <div className="space-y-8">
            <div>
              <div className="section-head">
                <span className="eyebrow">هتتعلم إيه؟</span>
                <h2 className="h2">مهارات هتخرج بيها من المادة</h2>
              </div>

              <div className="skill-list">
                {skills.map((skill, index) => (
                  <div className="skill-item" key={skill}>
                    <div className="lesson-number">{index + 1}</div>
                    <p className="font-bold">{skill}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="section-head">
                <span className="eyebrow">المحتوى</span>
                <h2 className="h2">4 أبواب، 24 حصة</h2>
              </div>

              <div className="lesson-list">
                {lessons.map(([number, title, duration]) => (
                  <div className="lesson-row" key={number}>
                    <div className="lesson-number">{number}</div>
                    <div>
                      <h3 className="text-xl font-black">{title}</h3>
                      <p className="muted">فيديو + تدريب قصير</p>
                    </div>
                    <span className="badge">{duration}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="section-head">
                <span className="eyebrow">آراء الطلاب</span>
                <h2 className="h2">اللي الطلبة بيقولوه</h2>
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
          </div>

          <aside className="card price-card">
            <span className="eyebrow">الاشتراك</span>
            <div className="price">75 ج.م</div>
            <p className="muted mt-3">
              وصول للحصة الأولى، التدريبات، ومتابعة التقدم داخل لوحة الطالب.
            </p>

            <Link href="/login" className="btn btn-block mt-6">
              اشترك الآن
            </Link>

            <div className="mt-6 grid gap-3 text-sm font-bold">
              <p>✓ أول حصة تجربة</p>
              <p>✓ تدريبات بعد كل درس</p>
              <p>✓ شهادة عند إكمال المادة</p>
              <p>✓ متابعة تقدمك في الداشبورد</p>
            </div>
          </aside>
        </div>
      </section>

      <section className="section tint-section">
        <div className="wrap">
          <div className="card p-8 md:p-12">
            <span className="eyebrow">جاهز تبدأ؟</span>
            <h2 className="h2">جاهز تبدأ الرياضيات بطريقة مختلفة؟</h2>
            <p className="muted mt-5 max-w-3xl">
              سجل دخولك وابدأ أول حصة، وبعدها قرر تكمل باقي الكورس.
            </p>
            <div className="mt-8">
              <Link href="/login" className="btn">
                ابدأ الآن
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
