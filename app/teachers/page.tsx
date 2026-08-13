import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { query } from "@/lib/db"

type TeacherRow = {
  id: number
  full_name: string
  bio: string | null
  avatar_url: string | null
  courses_count: number
  lessons_count: number
  students_count: number
}

async function getTeachers() {
  return query<TeacherRow>(
    `
    SELECT
      t.id,
      u.full_name,
      t.bio,
      u.avatar_url,
      COUNT(DISTINCT c.id) AS courses_count,
      COUNT(DISTINCT l.id) AS lessons_count,
      COUNT(DISTINCT sla.student_id) AS students_count
    FROM teachers t
    JOIN users u ON u.id = t.user_id
    LEFT JOIN courses c
      ON c.teacher_id = t.id
      AND c.deleted_at IS NULL
      AND c.status = 'published'
    LEFT JOIN chapters ch
      ON ch.course_id = c.id
      AND ch.deleted_at IS NULL
    LEFT JOIN lessons l
      ON l.chapter_id = ch.id
      AND l.deleted_at IS NULL
    LEFT JOIN student_lesson_access sla
      ON sla.lesson_id = l.id
    WHERE u.deleted_at IS NULL
      AND u.status = 'active'
    GROUP BY
      t.id,
      u.full_name,
      t.bio,
      u.avatar_url
    ORDER BY courses_count DESC, students_count DESC, u.full_name ASC
    `
  )
}

function getInitials(name: string) {
  return name.trim().slice(0, 1) || "م"
}

export default async function TeachersPage() {
  const teachers = await getTeachers()

  return (
    <main>
      <SiteHeader />

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">المدرسون</span>
            <h1 className="h1">اختار المدرس المناسب لك</h1>
            <p className="muted mt-6 text-lg">
              تصفح المدرسين المتاحين على المنصة وشاهد الكورسات والحصص المنشورة لكل مدرس.
            </p>
          </div>

          <div className="grid-auto">
            {teachers.map((teacher) => (
              <Link
                href={`/teachers/${teacher.id}`}
                className="card subject-card"
                key={teacher.id}
              >
                <div className="icon-circle">
                  {teacher.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={teacher.avatar_url}
                      alt={teacher.full_name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    getInitials(teacher.full_name)
                  )}
                </div>

                <h3 className="mt-5 text-2xl font-black">{teacher.full_name}</h3>

                <p className="muted mt-2">
                  {teacher.bio || "مدرس على منصة حورايزون تعليم."}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="badge">{teacher.courses_count} كورس</span>
                  <span className="badge">{teacher.lessons_count} حصة</span>
                  <span className="badge">{teacher.students_count} طالب</span>
                </div>
              </Link>
            ))}

            {teachers.length === 0 ? (
              <div className="card subject-card">
                <div className="icon-circle">م</div>
                <h3 className="mt-5 text-2xl font-black">لا يوجد مدرسون بعد</h3>
                <p className="muted mt-2">
                  عندما يضيف الأدمن مدرسين نشطين، سيظهرون هنا.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
