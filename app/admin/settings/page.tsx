import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

export default function AdminSettingsPage() {
  return (
    <main>
      <SiteHeader />

      <section className="section">
        <div className="wrap">
          <div className="card p-6 md:p-10">
            <span className="eyebrow">Admin Dashboard</span>
            <h1 className="h2">Platform Settings</h1>
            <p className="muted mt-4">
              General platform settings. Do not expose test login details in production.
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <label>
                Platform Name
                <input className="input mt-2" defaultValue="Horizon Education" />
              </label>

              <label>
                Official Email
                <input className="input mt-2" defaultValue="support@horizon-education.com" />
              </label>

              <label>
                Currency
                <input className="input mt-2" defaultValue="EGP" />
              </label>

              <label>
                Default Platform Percentage
                <input className="input mt-2" defaultValue="20" />
              </label>
            </div>

            <div className="mt-8 flex gap-3">
              <button className="btn" type="button">
                Save Settings
              </button>

              <Link href="/admin" className="btn btn-outline">
                Back to Admin Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
