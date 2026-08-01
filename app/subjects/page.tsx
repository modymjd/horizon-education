import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

const subjects = [
  ["الرياضيات", "من الجبر للتفاضل والتكامل — بأسلوب خطوة بخطوة", "12 حصة", "ر"],
  ["الفيزياء", "تجارب وقوانين وتطبيقات عملية", "10 حصص", "ف"],
  ["الكيمياء", "شرح منظم للمعادلات والتفاعلات", "9 حصص", "ك"],
  ["الأحياء", "رسومات ومراجعات ومتابعة مستمرة", "8 حصص", "أ"],
  ["اللغة العربية", "نحو وبلاغة وقراءة بطريقة مبسطة", "11 حصة", "ع"],
  ["اللغة الإنجليزية", "قواعد ومحادثة وتدريبات", "10 حصص", "E"],
  ["اللغة الفرنسية", "تأسيس وتدريبات امتحانات", "7 حصص", "F"],
  ["التاريخ", "أحداث مترابطة بدل الحفظ العشوائي", "8 حصص", "ت"],
  ["الجغرافيا", "خرائط ومفاهيم بطريقة بصرية", "8 حصص", "ج"],
]

export default function SubjectsPage() {
  return (
    <main>
      <SiteHeader />

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">المواد الدراسية</span>
            <h1 className="h1">اختار المادة اللي تدرسها</h1>
            <p className="muted mt-6 text-lg">
              تصفح المواد المتاحة، شوف المدرسين والحصص، وابدأ أول تجربة تعليمية.
            </p>
          </div>

          <div className="grid-auto">
            {subjects.map(([title, text, lessons, icon]) => (
              <Link href="/courses/math-grade-one" className="card subject-card" key={title}>
                <div className="icon-circle">{icon}</div>
                <h3 className="mt-5 text-2xl font-black">{title}</h3>
                <p className="muted mt-2">{text}</p>
                <span className="badge mt-5">{lessons}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
