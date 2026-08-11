import Link from "next/link"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { AccessCodeCreateForm } from "@/components/teacher/AccessCodeCreateForm"

type LessonOption = {
  id: number
  title: string
  course_title: string | null
  chapter_title: string | null
  status: string
}

type AccessCodeRow = {
  id: number
  code_prefix: string | null
  status: string
  lesson_title: string | null
  course_title: string | null
  expires_at: string | null
  created_at: string
  batch_id: string | null
}

async function getTeacherLessons(teacherId: number) {
  return query<LessonOption>(
    `
    SELECT
      l.id,
      l.title,
      l.status,
      c.title AS course_title,
      ch.title AS chapter_title
    FROM lessons l
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    WHERE c.teacher_id = ?
      AND l.deleted_at IS NULL
    ORDER BY c.title ASC, ch.sort_order ASC, l.sort_order ASC, l.id ASC
    `,
    [teacherId]
  )
}

async function getAccessCodes(teacherId: number) {
  return query<AccessCodeRow>(
    `
    SELECT
      ac.id,
      ac.code_prefix,
      ac.status,
      ac.batch_id,
      l.title AS lesson_title,
      c.title AS course_title,
      DATE_FORMAT(ac.expires_at, '%Y-%m-%d') AS expires_at,
      DATE_FORMAT(ac.created_at, '%Y-%m-%d') AS created_at
    FROM access_codes ac
    JOIN lessons l ON l.id = ac.lesson_id
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    WHERE c.teacher_id = ?
    ORDER BY ac.id DESC
    LIMIT 50
    `,
    [teacherId]
  )
}

function getStatusLabel(status: string) {
  if (status === "new") return "جديد"
  if (status === "used") return "مستخدم"
  if (status === "cancelled") return "ملغي"
  return status
}

export default async function TeacherAccessCodesPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher" || !user.teacher_id) {
    redirect("/403")
  }

  const [lessons, codes] = await Promise.all([
    getTeacherLessons(user.teacher_id),
    getAccessCodes(user.teacher_id),
  ])

  return (
    <main>
      <SiteHeader />

      <section className="teacher-page-hero">
        <div className="wrap">
          <span className="eyebrow">لوحة المدرس</span>
          <h1 className="h1">أكواد الوصول</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            أنشئ أكواد وصول للحصص، وراجع حالة الأكواد المستخدمة والجديدة.
          </p>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap grid gap-7 lg:grid-cols-[0.9fr_1.1fr]">
          <AccessCodeCreateForm lessons={lessons} />

          <div>
            <div className="toolbar">
              <div>
                <span className="eyebrow">الأكواد</span>
                <h2 className="h2">آخر الأكواد</h2>
              </div>

              <Link href="/teacher" className="btn btn-outline">
                رجوع للوحة المدرس
              </Link>
            </div>

            <div className="code-table">
              {codes.map((item) => (
                <div className="code-row" key={item.id}>
                  <div>
                    <div className="code-token">
                      {item.code_prefix || "HZ-***"}
                    </div>
                    <p className="muted mt-1">
                      {item.course_title ? `${item.course_title} — ` : ""}
                      {item.lesson_title || "غير محدد"}
                    </p>
                  </div>

                  <span className="badge">{getStatusLabel(item.status)}</span>

                  <div>
                    <p className="font-bold">
                      الدفعة: {item.batch_id?.slice(0, 8) || "—"}
                    </p>
                    <p className="muted text-sm">
                      الإنشاء: {item.created_at}
                      {item.expires_at ? ` · ينتهي: ${item.expires_at}` : ""}
                    </p>
                  </div>
                </div>
              ))}

              {codes.length === 0 ? (
                <div className="card access-code-card">
                  <h3 className="text-xl font-black">لا توجد أكواد بعد</h3>
                  <p className="muted mt-2">
                    أنشئ أول دفعة أكواد من النموذج.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
