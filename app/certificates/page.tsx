import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

const certificates = [
  ["رياضيات — أساسيات الجبر", "محمد محمود", "HZ-CERT-1024"],
  ["فيزياء — الحركة والقوى", "سارة أحمد", "HZ-CERT-1025"],
  ["لغة إنجليزية — المستوى الأول", "علي حسن", "HZ-CERT-1026"],
]

export default function CertificatesPage() {
  return (
    <main>
      <SiteHeader />

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">الشهادات</span>
            <h1 className="h1">اتقن أي مادة، وخد شهادتك</h1>
            <p className="muted mt-6 text-lg">
              كل شهادة يمكن التحقق منها برقم شهادة، مع ربطها بالطالب والمادة.
            </p>
          </div>

          <div className="card p-6 md:p-8">
            <h2 className="text-3xl font-black">عندك رقم شهادة؟ اتأكد منها هنا</h2>
            <div className="mt-5 flex flex-col gap-3 md:flex-row">
              <input className="input" placeholder="مثال: HZ-CERT-1024" />
              <button className="btn">تحقق من الشهادة</button>
            </div>
          </div>

          <div className="mt-8 grid-auto">
            {certificates.map(([title, student, code]) => (
              <div className="card certificate-card" key={code}>
                <span className="badge">{code}</span>
                <h3 className="mt-5 text-2xl font-black">{title}</h3>
                <p className="muted mt-2">الطالب: {student}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
