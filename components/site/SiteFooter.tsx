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

      <div className="wrap footer-credit">
        <span className="footer-credit-text">Development by</span>

        <a
          href="https://linktr.ee/tronixsolutions"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-credit-link"
          aria-label="Tronix"
        >
          <img src="/logos/tronix-logo.png" alt="Tronix" className="footer-credit-logo" />
        </a>

        <span className="footer-credit-text">&amp;</span>

        <a
          href="https://linktr.ee/xoperations.bio"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-credit-link"
          aria-label="Xoperations"
        >
          <img src="/logos/xoperations-logo.png" alt="Xoperations" className="footer-credit-logo" />
        </a>
      </div>
    </footer>
  )
}

