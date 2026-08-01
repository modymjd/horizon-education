import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"

const students = [
  ["م", "محمد محمود", "student@horizon.test", "الصف الأول الثانوي", "نشط", "3 مواد"],
  ["س", "سارة أحمد", "sara@student.test", "الصف الأول الثانوي", "نشط", "2 مواد"],
  ["ع", "علي حسن", "ali@student.test", "الصف الثاني الثانوي", "يحتاج متابعة", "1 مادة"],
  ["ن", "نور خالد", "nour@student.test", "الصف الثالث الثانوي", "نشط", "4 مواد"],
]

export default function AdminStudentsPage() {
  return (
    <main>
      <SiteHeader />

      <section className="admin-page-hero">
        <div className="wrap">
          <span className="eyebrow">لوحة الإدارة</span>
          <h1 className="h1">إدارة الطلاب</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            تابع حسابات الطلاب، المراحل الدراسية، وحالة الاشتراكات والتقدم.
          </p>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap">
          <div className="admin-summary-grid">
            <div className="card summary-card">
              <b>128</b>
              <span className="muted font-bold">إجمالي الطلاب</span>
            </div>
            <div className="card summary-card">
              <b>92</b>
              <span className="muted font-bold">طلاب نشطون</span>
            </div>
            <div className="card summary-card">
              <b>11</b>
              <span className="muted font-bold">يحتاجون متابعة</span>
            </div>
          </div>

          <div className="toolbar">
            <div className="search-row">
              <input className="input" placeholder="ابحث باسم الطالب أو البريد..." />
              <select className="input" defaultValue="all">
                <option value="all">كل الحالات</option>
                <option value="active">نشط</option>
                <option value="follow">يحتاج متابعة</option>
              </select>
            </div>

            <Link href="/admin" className="btn btn-outline">
              رجوع للوحة الإدارة
            </Link>
          </div>

          <div className="card admin-table-card">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>الطالب</th>
                  <th>البريد</th>
                  <th>المرحلة</th>
                  <th>الحالة</th>
                  <th>الاشتراكات</th>
                </tr>
              </thead>
              <tbody>
                {students.map(([letter, name, email, grade, status, subs]) => (
                  <tr key={email}>
                    <td>
                      <div className="table-user">
                        <div className="table-avatar">{letter}</div>
                        <b>{name}</b>
                      </div>
                    </td>
                    <td>{email}</td>
                    <td>{grade}</td>
                    <td><span className="badge">{status}</span></td>
                    <td>{subs}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
