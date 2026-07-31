import Link from "next/link"

export default function ForbiddenPage() {
  return (
    <main className="grid min-h-screen place-items-center p-5">
      <div className="card max-w-md p-8 text-center">
        <span className="badge">403</span>
        <h1 className="mt-4 text-3xl font-black">غير مصرح بالدخول</h1>
        <p className="mt-3 opacity-70">
          لا تملك الصلاحية للوصول إلى هذه الصفحة.
        </p>
        <Link href="/login" className="btn btn-primary mt-6 inline-block">
          تسجيل الدخول
        </Link>
      </div>
    </main>
  )
}