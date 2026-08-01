import Link from "next/link"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { query } from "@/lib/db"

type StudentSummary = {
  student_id: number
  full_name: string
  active_lessons: number
  active_courses: number
}

type StudentLesson = {
  lesson_id: number
  lesson_title: string
  course_title: string
  course_slug: string
  chapter_title: string
  access_until: string | null
  created_at: string
}

type CourseProgress = {
  course_id: number
  course_title: string
  course_slug: string
  total_lessons: number
  unlocked_lessons: number
}

type CertificateRow = {
  title: string
  issued_at: string
}

async function getStudentSummary() {
  const rows = await query<StudentSummary>(`
    SELECT
      s.id AS student_id,
      u.full_name,
      COUNT(DISTINCT sla.lesson_id) AS active_lessons,
      COUNT(DISTINCT c.id) AS active_courses
    FROM students s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN student_lesson_access sla ON sla.student_id = s.id
    LEFT JOIN lessons l ON l.id = sla.lesson_id
    LEFT JOIN chapters ch ON ch.id = l.chapter_id
    LEFT JOIN courses c ON c.id = ch.course_id
    WHERE u.email = 'student@horizon.test'
    GROUP BY s.id, u.full_name
    LIMIT 1
  `)

  return rows[0]
}

async function getStudentLessons() {
  return query<StudentLesson>(`
    SELECT
      l.id AS lesson_id,
      l.title AS lesson_title,
      c.title AS course_title,
      c.slug AS course_slug,
      ch.title AS chapter_title,
      DATE_FORMAT(sla.access_until, '%Y-%m-%d') AS access_until,
      DATE_FORMAT(sla.created_at, '%Y-%m-%d') AS created_at
    FROM student_lesson_access sla
    JOIN students s ON s.id = sla.student_id
    JOIN users u ON u.id = s.user_id
    JOIN lessons l ON l.id = sla.lesson_id
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    WHERE u.email = 'student@horizon.test'
    ORDER BY sla.id DESC
    LIMIT 6
  `)
}

async function getCourseProgress() {
  return query<CourseProgress>(`
    SELECT
      c.id AS course_id,
      c.title AS course_title,
      c.slug AS course_slug,
      COUNT(DISTINCT l.id) AS total_lessons,
      COUNT(DISTINCT sla.lesson_id) AS unlocked_lessons
    FROM courses c
    JOIN chapters ch ON ch.course_id = c.id
    JOIN lessons l ON l.chapter_id = ch.id
    JOIN student_lesson_access sla ON sla.lesson_id = l.id
    JOIN students s ON s.id = sla.student_id
    JOIN users u ON u.id = s.user_id
    WHERE u.email = 'student@horizon.test'
    GROUP BY c.id, c.title, c.slug
    ORDER BY c.id DESC
  `)
}

function getProgressPercent(unlocked: number, total: number) {
  if (!total) return 0
  return Math.round((Number(unlocked) / Number(total)) * 100)
}

function ProgressRing({ value }: { value: number }) {
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const dash = (value / 100) * circumference

  return (
    <div className="ring">
      <svg width="68" height="68" viewBox="0 0 68 68">
        <circle className="ring-bg" cx="34" cy="34" r={radius} />
        <circle
          className="ring-fg"
          cx="34"
          cy="34"
          r={radius}
          strokeDasharray={`${dash} ${circumference - dash}`}
        />
      </svg>
      <div className="ring-label">{value}%</div>
    </div>
  )
}

export default async function StudentDashboard() {
  const [summary, lessons, progress] = await Promise.all([
    getStudentSummary(),
    getStudentLessons(),
    getCourseProgress(),
  ])

  const latestLesson = lessons[0]
  const studentName = summary?.full_name || "الطالب"
  const activeLessons = Number(summary?.active_lessons || 0)
  const activeCourses = Number(summary?.active_courses || 0)

  const stats = [
    [String(activeCourses), "كورسات مفعّلة"],
    [String(activeLessons), "حصص متاحة"],
    [String(progress.length), "مواد قيد الدراسة"],
    [latestLesson ? "1" : "0", "آخر حصة جديدة"],
  ]

  return (
    <main>
      <SiteHeader />

      <div className="wrap">
        <section className="dashboard-welcome">
          <div className="card welcome-box">
            <h1 className="welcome-title">أهلًا، {studentName} 👋</h1>
            <p className="muted mt-4 text-lg">
              {latestLesson
                ? `آخر حصة اتفعلت لك: ${latestLesson.lesson_title}.`
                : "فعّل أول كود وصول عشان تبدأ مذاكرتك."}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/student/activate" className="btn">
                تفعيل كود جديد
              </Link>
              <Link href="/subjects" className="btn btn-outline">
                تصفح المواد
              </Link>
            </div>
          </div>

          <div className="quick-stats">
            {stats.map(([value, label]) => (
              <div className="qstat" key={label}>
                <b>{value}</b>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="card continue-card">
          <div>
            <span className="lesson-pill">
              {latestLesson ? latestLesson.course_title : "ابدأ الآن"}
            </span>
            <h2 className="mt-5 font-[var(--display)] text-5xl font-bold leading-none">
              {latestLesson ? latestLesson.lesson_title : "فعّل أول حصة"}
            </h2>
            <p className="muted mt-4">
              {latestLesson
                ? `${latestLesson.chapter_title} — تم التفعيل في ${latestLesson.created_at}`
                : "استخدم كود الوصول الذي حصلت عليه من المدرس أو الإدارة."}
            </p>
          </div>

          <div>
            {latestLesson ? (
              <Link href={`/courses/${latestLesson.course_slug}`} className="btn">
                فتح الكورس
              </Link>
            ) : (
              <Link href="/student/activate" className="btn">
                تفعيل كود
              </Link>
            )}
          </div>
        </section>
      </div>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">تقدّمك</span>
            <h2 className="h2">مستواك في كل كورس</h2>
          </div>

          <div className="grid-auto">
            {progress.map((course) => {
              const percent = getProgressPercent(
                Number(course.unlocked_lessons),
                Number(course.total_lessons)
              )

              return (
                <div className="card progress-card" key={course.course_id}>
                  <div className="progress-card-head">
                    <ProgressRing value={percent} />
                    <div>
                      <h3>{course.course_title}</h3>
                      <p className="muted">
                        {course.unlocked_lessons} من {course.total_lessons} حصة مفعّلة
                      </p>
                    </div>
                  </div>

                  <div className="progress-track mt-6">
                    <div
                      className="progress-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <Link href={`/courses/${course.course_slug}`} className="btn btn-soft mt-6">
                    فتح الكورس
                  </Link>
                </div>
              )
            })}

            {progress.length === 0 ? (
              <div className="card progress-card">
                <h3>لا توجد كورسات مفعّلة بعد</h3>
                <p className="muted mt-2">
                  فعّل كود وصول لبدء ظهور تقدمك هنا.
                </p>
                <Link href="/student/activate" className="btn mt-6">
                  تفعيل كود
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section tint-section">
        <div className="wrap">
          <div className="section-head">
            <span className="eyebrow">حصصك</span>
            <h2 className="h2">آخر الحصص المفعّلة</h2>
          </div>

          <div className="grid gap-4">
            {lessons.map((lesson) => (
              <div className="teacher-course-row" key={lesson.lesson_id}>
                <div className="course-letter">
                  {lesson.course_title.slice(0, 1)}
                </div>

                <div>
                  <h3 className="text-xl font-black">{lesson.lesson_title}</h3>
                  <p className="muted">
                    {lesson.course_title} — {lesson.chapter_title}
                  </p>
                  <p className="muted text-sm">
                    تم التفعيل: {lesson.created_at}
                    {lesson.access_until ? ` · متاح حتى: ${lesson.access_until}` : ""}
                  </p>
                </div>

                <Link href={`/courses/${lesson.course_slug}`} className="btn btn-soft">
                  فتح
                </Link>
              </div>
            ))}

            {lessons.length === 0 ? (
              <div className="card course-management-card">
                <h3 className="text-2xl font-black">لا توجد حصص مفعّلة بعد</h3>
                <p className="muted mt-2">
                  بمجرد تفعيل كود، ستظهر الحصة هنا.
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
