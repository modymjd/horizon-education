import Link from "next/link"
import { BrandMark } from "./BrandMark"

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

          <div className="nav-cta">
            <Link href="/login" className="btn btn-outline btn-sm">
              تسجيل الدخول
            </Link>
            <Link href="/subjects" className="btn btn-sm">
              ابدأ الآن
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
