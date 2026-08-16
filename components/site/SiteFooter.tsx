import Link from "next/link"
import { BrandMark } from "./BrandMark"

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap grid gap-8 md:grid-cols-3">
        <div>
          <BrandMark />
          <p className="muted mt-4">
            An education platform that helps students understand lessons, track progress, and access course content easily.
          </p>
        </div>

        <div>
          <h3 className="font-black">Quick Links</h3>
          <div className="mt-3 grid gap-2 muted">
            <Link href="/subjects">Courses</Link>
            <Link href="/teachers">Teachers</Link>
            <Link href="/certificates">Certificates</Link>
          </div>
        </div>

        <div>
          <h3 className="font-black">Account</h3>
          <div className="mt-3 grid gap-2 muted">
            <Link href="/login">Login</Link>
            <Link href="/student">Student Dashboard</Link>
            <Link href="/teacher">Teacher Dashboard</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
