import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

const subjects = [
  ["Mathematics", "From algebra to calculus with a clear step-by-step approach.", "M"],
  ["Physics", "Understand laws through experiments and practical applications.", "P"],
  ["Chemistry", "From atoms to equations in a simple and organized way.", "C"],
]

const features = [
  [
    "Visual-first explanations",
    "Every idea is shown before it is memorized, so students understand when and how to use it.",
  ],
  [
    "Instant question practice",
    "Solve exercises and track progress step by step.",
  ],
  [
    "Clear progress tracking",
    "A simple dashboard for students to follow lessons, certificates, subjects, and performance.",
  ],
]

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">HORIZON EDUCATION</span>
            <h2 className="h2">Learn every subject with clarity and confidence</h2>
            <p className="muted mt-6 max-w-2xl text-lg">
              Horizon Education makes learning feel easier, 
              more engaging, and more enjoyable — helping students 
              learn with confidence and reach their full potential.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/subjects" className="btn">
                Browse subjects
              </Link>
              <Link href="/login" className="btn btn-outline">
                Sign in
              </Link>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-arch" />
            <div className="hero-floating">
              <span className="badge">Live progress</span>
              <h3 className="mt-4 text-2xl font-black">Your level in every subject</h3>
              <p className="mt-2 opacity-80">
                Lessons, assignments, exams, and certificates in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">A different way to learn</span>
            <h2 className="h2">Do not just memorize lessons. Understand how to use them.</h2>
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
            <span className="eyebrow">Subjects</span>
            <h2 className="h2">Choose one subject or build your full learning path</h2>
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
            <span className="eyebrow">Start first</span>
            <h2 className="h2">Try the first lesson, then decide your next step</h2>
            <p className="muted mt-5 max-w-3xl">
              Explore the teaching style, test yourself, and continue with the subject that fits your goals.
            </p>
            <div className="mt-8">
              <Link href="/login" className="btn">
                Start learning
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

