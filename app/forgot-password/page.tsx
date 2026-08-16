import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

export default function ForgotPasswordPage() {
  return (
    <main>
      <SiteHeader />

      <section className="auth-section">
        <div className="wrap">
          <div className="card mx-auto w-full max-w-md p-8">
            <span className="eyebrow">Password Recovery</span>
            <h1 className="mt-4 text-3xl font-black">Forgot your password?</h1>
            <p className="muted mt-3">
              Password reset is not available yet. Please contact platform support.
            </p>
            <Link href="/login" className="btn mt-6">
              Back to Login
            </Link>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
