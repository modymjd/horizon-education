import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

const stats = [
  ["3", "مواد مشترك فيها"],
  ["47", "حصة خلّصتها"],
  ["2", "شهادة حصلت عليها"],
  ["12", "يوم أطول تتابع"],
]

const subjects = [
  {
    name: "الرياضيات",
    done: "15 من 24 حصة",
    progress: 64,
  },
  {
    name: "الفيزياء",
    done: "14 من 18 حصة",
    progress: 75,
  },
  {
    name: "الكيمياء",
    done: "1.5 من 15 حصة",
    progress: 10,
  },
]

const certificates = [
  {
    title: "الجبر والهندسة — رياضيات",
    date: "اتحصل عليها في يونيو 2026",
  },
  {
    title: "الميكانيكا الكلاسيكية — فيزياء",
    date: "اتحصل عليها في أبريل 2026",
  },
]

function ProgressRing({ value }: { value: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const dash = (value / 100) * circumference

  return (
    <div className="ring">
      <svg width="68" height="68" viewBox="0 0 68 68">
        <circle className="ring-bg" cx="34" cy="34" r={radius} />
        <circle
          className="ring-fg"
          cx="34"
          cy="34"
          r={radius}
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <div className="ring-label">{value}%</div>
    </div>
  )
}

export default function StudentDashboard() {
  return (
    <main>
      <SiteHeader />

      <div className="wrap">
        <section className="dashboard-welcome">
          <div className="card welcome-box">
            <h1 className="welcome-title">أهلًا، محمد 👋</h1>
            <p className="muted mt-4 text-lg">
              لسه فاضلك 3 حصص عشان تخلّص باب الجبر. كمّل من مكان ما وقفت.
            </p>

            <div className="mt-7">
              <Link href="/subjects" className="btn">
                اشترك في مادة جديدة
              </Link>
            </div>
          </div>

          <div className="quick-stats">
            {stats.map(([value, label]) => (
              <div className="qstat" key={label}>
                <b>{value}</b>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card continue-card">
          <div>
            <span className="lesson-pill">مذاكرة الرياضيات — قواعد الاشتقاق</span>
            <h2 className="mt-5 font-[var(--display)] text-5xl font-bold leading-none">
              الباب 4: التفاضل والتكامل
            </h2>
            <p className="muted mt-4">
              الحصة 4 من 9 — عندك تدريب قصير بعد الفيديو لتثبيت الفكرة.
            </p>
          </div>

          <div>
            <Link href="/courses/math-grade-one" className="btn">
              كمّل الحصة
            </Link>
          </div>
        </section>
      </div>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">تقدّمك</span>
            <h2 className="h2">مستواك في كل مادة</h2>
          </div>

          <div className="grid-auto">
            {subjects.map((subject) => (
              <div className="card progress-card" key={subject.name}>
                <div className="progress-card-head">
                  <ProgressRing value={subject.progress} />
                  <div>
                    <h3>{subject.name}</h3>
                    <p className="muted">{subject.done}</p>
                  </div>
                </div>

                <div className="progress-track mt-6">
                  <div
                    className="progress-fill"
                    style={{ width: `${subject.progress}%` }}
                  />
                </div>

                <Link href="/subjects" className="btn btn-soft mt-6">
                  كمّل المادة
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section tint-section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">شهاداتك</span>
            <h2 className="h2">آخر الشهادات اللي حصلت عليها</h2>
          </div>

          <div className="grid-auto">
            {certificates.map((certificate) => (
              <div className="card certificate-card" key={certificate.title}>
                <div className="certificate-ribbon" />
                <h3 className="mt-5 text-2xl font-black">{certificate.title}</h3>
                <p className="muted mt-2">{certificate.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
