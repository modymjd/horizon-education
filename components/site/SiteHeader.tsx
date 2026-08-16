import Link from "next/link"
import { BrandMark } from "./BrandMark"
import { AuthHeaderActions } from "./AuthHeaderActions"

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="wrap">
        <nav className="nav">
          <BrandMark />

          <div className="nav-links">
            <Link href="/subjects">Courses</Link>
            <Link href="/teachers">Teachers</Link>
            <Link href="/certificates">Certificates</Link>
          </div>

          <AuthHeaderActions />
        </nav>
      </div>
    </header>
  )
}
