import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

const subjects = [
  ["الرياضيات", "من الجبر للتفاضل والتكامل — بأسلوب خطوة بخطوة", "ر"],
  ["الفيزياء", "افهم القوانين بالتجارب والتطبيق العملي", "ف"],
  ["الكيمياء", "من الذرة للمعادلات بطريقة سهلة ومنظمة", "ك"],
]

const features = [
  ["شرح بالصورة الأول", "كل فكرة بتتشاف قبل ما تتحفظ، عشان تفهم إمتى تستخدمها."],
  ["تصحيح فوري للأسئلة", "حل تدريبات وتابع مستواك أول بأول."],
  ["متابعة تقدّمك", "لوحة واضحة لكل طالب تبين الحصص والشهادات والمواد."],
]

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">HORIZON EDUCATION</span>
            <h1 className="h1">كل مادة هي خط تتعلم تشوف اللي وراه</h1>
            <p className="muted mt-6 max-w-2xl text-lg">
              منصة تعليمية عربية بتجمع المدرّسين، المواد، الحصص، أكواد الوصول،
              والشهادات في تجربة واحدة بسيطة للطالب والمدرس والإدارة.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/subjects" className="btn">
                تصفّح المواد
              </Link>
              <Link href="/login" className="btn btn-outline">
                تسجيل الدخول
              </Link>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-floating">
              <span className="badge">متابعة مباشرة</span>
              <h3 className="mt-4 text-2xl font-black">مستواك في كل مادة</h3>
              <p className="mt-2 opacity-80">
                حصص، واجبات، اختبارات، وشهادات في مكان واحد.
              </p>
            </div>
            <div className="hero-arch" />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">طريقة مختلفة في التعلم</span>
            <h2 className="h2">مش بتحفظ الدرس، بتفهم إمتى تستخدمه</h2>
          </div>

          <div className="grid-auto">
            {features.map(([title, text]) => (
              <div className="card subject-card" key={title}>
                <h3 className="text-2xl font-black">{title}</h3>
                <p className="muted mt-3">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">المواد</span>
            <h2 className="h2">مادة واحدة أو كل المواد — القرار ليك</h2>
          </div>

          <div className="grid-auto">
            {subjects.map(([title, text, icon]) => (
              <Link href="/subjects" className="card subject-card" key={title}>
                <div className="icon-circle">{icon}</div>
                <h3 className="mt-5 text-2xl font-black">{title}</h3>
                <p className="muted mt-2">{text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="card p-8 md:p-12">
            <span className="eyebrow">جرب الأول</span>
            <h2 className="h2">أول حصة في أي مادة تجربة، وبعدين تقرر</h2>
            <p className="muted mt-5 max-w-3xl">
              ادخل شوف طريقة الشرح، اختبر نفسك، وبعدها كمل في المادة المناسبة ليك.
            </p>
            <div className="mt-8">
              <Link href="/login" className="btn">
                ابدأ تجربة التعلم
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
