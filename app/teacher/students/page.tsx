import Link from "next/link"
import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"

type TeacherStudentRow = {
  student_id: number
  student_code: string
  student_name: string
  student_email: string
  student_phone: string | null
  student_whatsapp_phone: string | null
  national_id: string | null
  address: string | null
  governorate: string | null
  guardian_name: string | null
  guardian_phone: string | null
  guardian_whatsapp_phone: string | null
  education_type_name: string | null
  stage_name: string | null
  grade_name: string | null
  accepted_courses: string
  accepted_courses_count: number
  unlocked_lessons_count: number
}

async function getTeacherStudents(teacherId: number) {
  return query<TeacherStudentRow>(
    `
    SELECT
      s.id AS student_id,
      s.student_code,
      u.full_name AS student_name,
      u.email AS student_email,
      u.phone AS student_phone,
      s.whatsapp_phone AS student_whatsapp_phone,
      s.national_id,
      s.address,
      s.governorate,
      gr.name AS guardian_name,
      gr.phone AS guardian_phone,
      gr.whatsapp_phone AS guardian_whatsapp_phone,
      et.name AS education_type_name,
      es.name AS stage_name,
      g.name AS grade_name,
      GROUP_CONCAT(DISTINCT c.title ORDER BY c.title SEPARATOR '، ') AS accepted_courses,
      COUNT(DISTINCT c.id) AS accepted_courses_count,
      COUNT(DISTINCT sla.lesson_id) AS unlocked_lessons_count
    FROM student_course_requests r
    JOIN courses c ON c.id = r.course_id
    JOIN students s ON s.id = r.student_id
    JOIN users u ON u.id = s.user_id
    LEFT JOIN guardians gr ON gr.id = s.guardian_id
    LEFT JOIN education_types et ON et.id = s.education_type_id
    LEFT JOIN educational_stages es ON es.id = s.stage_id
    LEFT JOIN grades g ON g.id = s.grade_id
    LEFT JOIN chapters ch ON ch.course_id = c.id AND ch.deleted_at IS NULL
    LEFT JOIN lessons l ON l.chapter_id = ch.id AND l.deleted_at IS NULL
    LEFT JOIN student_lesson_access sla
      ON sla.lesson_id = l.id
      AND sla.student_id = s.id
    WHERE c.teacher_id = ?
      AND c.deleted_at IS NULL
      AND r.status = 'accepted'
      AND u.deleted_at IS NULL
    GROUP BY
      s.id,
      s.student_code,
      u.full_name,
      u.email,
      u.phone,
      s.whatsapp_phone,
      s.national_id,
      s.address,
      s.governorate,
      gr.name,
      gr.phone,
      gr.whatsapp_phone,
      et.name,
      es.name,
      g.name
    ORDER BY u.full_name ASC
    `,
    [teacherId]
  )
}

export default async function TeacherStudentsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "teacher" || !user.teacher_id) {
    redirect("/403")
  }

  const students = await getTeacherStudents(user.teacher_id)

  return (
    <main>
      <SiteHeader />

      <section className="teacher-page-hero">
        <div className="wrap">
          <span className="eyebrow">لوحة المدرس</span>
          <h1 className="h1">طلابي</h1>
          <p className="muted mt-5 max-w-2xl text-lg">
            الطلاب الذين تم قبول طلباتهم في كورساتك، مع بيانات التواصل وولي الأمر.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/teacher" className="btn">
              رجوع للوحة المدرس
            </Link>

            <Link href="/teacher/requests" className="btn btn-outline">
              طلبات الانضمام
            </Link>

            <Link href="/teacher/access-codes" className="btn btn-outline">
              إنشاء أكواد وصول
            </Link>
          </div>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap">
          <div className="teacher-stat-grid mb-6">
            <div className="card teacher-stat-card">
              <b>{students.length}</b>
              <span className="muted font-bold">طلاب مقبولون</span>
            </div>

            <div className="card teacher-stat-card">
              <b>
                {students.reduce(
                  (sum, student) => sum + Number(student.accepted_courses_count || 0),
                  0
                )}
              </b>
              <span className="muted font-bold">اشتراكات كورسات</span>
            </div>

            <div className="card teacher-stat-card">
              <b>
                {students.reduce(
                  (sum, student) => sum + Number(student.unlocked_lessons_count || 0),
                  0
                )}
              </b>
              <span className="muted font-bold">حصص مفعّلة</span>
            </div>
          </div>

          <div className="grid gap-5">
            {students.map((student) => (
              <div className="card course-management-card" key={student.student_id}>
                <div className="course-management-head">
                  <div>
                    <span className="badge">{student.student_code || "بدون كود"}</span>

                    <div className="mt-4">
                      <h2 className="text-3xl font-black">{student.student_name}</h2>
                      <p className="muted mt-1">
                        {student.accepted_courses || "لا توجد كورسات مقبولة"}
                      </p>
                      <p className="muted mt-2 text-sm">
                        التعليم: {student.education_type_name || "غير محدد"} —{" "}
                        {student.stage_name || "غير محدد"} —{" "}
                        {student.grade_name || "غير محدد"}
                      </p>
                    </div>
                  </div>

                  <div className="course-actions">
                    <Link href="/teacher/access-codes" className="btn btn-outline">
                      إنشاء كود
                    </Link>
                  </div>
                </div>

                <div className="course-metrics">
                  <div className="metric-mini">
                    <b>{student.student_phone || "—"}</b>
                    <span className="muted">هاتف الطالب</span>
                  </div>

                  <div className="metric-mini">
                    <b>{student.student_whatsapp_phone || "—"}</b>
                    <span className="muted">واتساب الطالب</span>
                  </div>

                  <div className="metric-mini">
                    <b>{student.guardian_phone || "—"}</b>
                    <span className="muted">هاتف ولي الأمر</span>
                  </div>

                  <div className="metric-mini">
                    <b>{student.guardian_whatsapp_phone || "—"}</b>
                    <span className="muted">واتساب ولي الأمر</span>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 text-sm font-bold md:grid-cols-2">
                  <p>البريد: {student.student_email}</p>
                  <p>الرقم القومي: {student.national_id || "غير محدد"}</p>
                  <p>المحافظة: {student.governorate || "غير محدد"}</p>
                  <p>العنوان: {student.address || "غير محدد"}</p>
                  <p>ولي الأمر: {student.guardian_name || "غير محدد"}</p>
                  <p>حصص مفعّلة: {student.unlocked_lessons_count}</p>
                </div>
              </div>
            ))}

            {students.length === 0 ? (
              <div className="card course-management-card">
                <h2 className="text-2xl font-black">لا يوجد طلاب مقبولون بعد</h2>
                <p className="muted mt-2">
                  عندما تقبل طلب انضمام طالب إلى أحد كورساتك، سيظهر هنا.
                </p>

                <div className="mt-6">
                  <Link href="/teacher/requests" className="btn">
                    مراجعة طلبات الانضمام
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
