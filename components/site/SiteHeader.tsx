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
            <Link href="/subjects">المواد</Link>
            <Link href="/teachers">المدرّسين</Link>
            <Link href="/certificates">الشهادات</Link>
          </div>

          <AuthHeaderActions />
        </nav>
      </div>
    </header>
  )
}
