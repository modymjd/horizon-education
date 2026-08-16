import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

const certificates = [
  ["Math — Algebra Basics", "Mohamed Mahmoud", "HZ-CERT-1024"],
  ["Physics — Motion and Forces", "Sara Ahmed", "HZ-CERT-1025"],
  ["English — Level One", "Ali Hassan", "HZ-CERT-1026"],
]

export default function CertificatesPage() {
  return (
    <main>
      <SiteHeader />

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">Certificates</span>
            <h1 className="h1">Master a course and earn your certificate</h1>
            <p className="muted mt-6 text-lg">
              Each certificate can be verified by certificate number and linked to the student and course.
            </p>
          </div>

          <div className="card p-6 md:p-8">
            <h2 className="text-3xl font-black">Have a certificate number?</h2>
            <div className="mt-5 flex flex-col gap-3 md:flex-row">
              <input className="input" placeholder="Example: HZ-CERT-1024" />
              <button className="btn">Verify Certificate</button>
            </div>
          </div>

          <div className="mt-8 grid-auto">
            {certificates.map(([title, student, code]) => (
              <div className="card certificate-card" key={code}>
                <span className="badge">{code}</span>
                <h3 className="mt-5 text-2xl font-black">{title}</h3>
                <p className="muted mt-2">Student: {student}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
