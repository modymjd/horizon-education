import Link from "next/link"
import { BrandMark } from "./BrandMark"
import { AuthHeaderActions } from "./AuthHeaderActions"
import { MobileNavToggle } from "./MobileNavToggle"

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

          <div className="nav-end">
            <AuthHeaderActions />
            <MobileNavToggle />
          </div>
        </nav>
      </div>
    </header>
  )
}

