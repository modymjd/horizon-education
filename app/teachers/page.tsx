import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

const teachers = [
  ["د. أحمد درويش", "مدرس رياضيات", "خبرة 10 سنوات في تبسيط الجبر والتفاضل.", "أ"],
  ["أ. مريم علي", "مدرسة فيزياء", "شرح عملي قائم على التجارب والتطبيق.", "م"],
  ["أ. محمد حسن", "مدرس لغة إنجليزية", "تأسيس ومراجعات وتدريب على الامتحانات.", "م"],
  ["أ. سارة محمود", "مدرسة كيمياء", "تبسيط المعادلات والتفاعلات بخطوات واضحة.", "س"],
]

export default function TeachersPage() {
  return (
    <main>
      <SiteHeader />

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">المدرّسين</span>
            <h1 className="h1">مدرّسين متخصصين في كل مادة</h1>
            <p className="muted mt-6 text-lg">
              اختار المدرس المناسب لطريقة تعلمك، وتابع الحصص والتقدم من لوحة الطالب.
            </p>
          </div>

          <div className="grid-auto">
            {teachers.map(([name, subject, bio, letter]) => (
              <Link href="/teachers/1" className="card teacher-card" key={name}>
                <div className="icon-circle">{letter}</div>
                <h3 className="mt-5 text-2xl font-black">{name}</h3>
                <p className="font-bold text-[var(--maple)]">{subject}</p>
                <p className="muted mt-3">{bio}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
