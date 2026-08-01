import Link from "next/link"
import { BrandMark } from "./BrandMark"

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap grid gap-8 md:grid-cols-3">
        <div>
          <BrandMark />
          <p className="muted mt-4">
            منصة تعليمية عربية تساعد الطالب يفهم، يتابع مستواه، ويوصل لحصصه بسهولة.
          </p>
        </div>

        <div>
          <h3 className="font-black">روابط سريعة</h3>
          <div className="mt-3 grid gap-2 muted">
            <Link href="/subjects">المواد</Link>
            <Link href="/teachers">المدرّسين</Link>
            <Link href="/certificates">الشهادات</Link>
          </div>
        </div>

        <div>
          <h3 className="font-black">الدخول</h3>
          <div className="mt-3 grid gap-2 muted">
            <Link href="/login">تسجيل الدخول</Link>
            <Link href="/student">لوحة الطالب</Link>
            <Link href="/teacher">لوحة المدرس</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
