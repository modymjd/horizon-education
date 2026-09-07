import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { SiteHeader } from "@/components/site/SiteHeader"
import { SiteFooter } from "@/components/site/SiteFooter"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { StudentAssignmentSubmitForm } from "@/components/student/StudentAssignmentSubmitForm"

type LessonRow = {
  lesson_id: number
  lesson_title: string
  lesson_description: string | null
  price: number
  course_title: string
  course_slug: string
  chapter_title: string
  access_until: string | null
  activated_at: string | null
}

type LessonVideoRow = {
  id: number
  title: string
  video_url: string
  sort_order: number
}

type AssignmentRow = {
  id: number
  title: string
  description: string | null
  attachment_url: string | null
  due_at: string | null
  submission_url: string | null
  submitted_at: string | null
}

type ExamPlacement = "before_content" | "after_content"

type ExamRow = {
  id: number
  title: string
  description: string | null
  pass_score: number
  is_required_to_unlock_next: number
  placement: ExamPlacement
  attempted: number
  score: number | null
  passed: number | null
  questions_count: number
}

async function getLesson(id: string, studentId: number) {
  const rows = await query<LessonRow>(
    `
    SELECT
      l.id AS lesson_id,
      l.title AS lesson_title,
      l.description AS lesson_description,
      l.price,
      c.title AS course_title,
      c.slug AS course_slug,
      ch.title AS chapter_title,
      DATE_FORMAT(sla.access_until, '%Y-%m-%d') AS access_until,
      DATE_FORMAT(sla.created_at, '%Y-%m-%d') AS activated_at
    FROM student_lesson_access sla
    JOIN lessons l ON l.id = sla.lesson_id
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    WHERE sla.student_id = ?
      AND l.id = ?
    LIMIT 1
    `,
    [studentId, id]
  )

  return rows[0]
}

async function getLessonVideos(id: string) {
  return query<LessonVideoRow>(
    `
    SELECT
      id,
      title,
      video_url,
      sort_order
    FROM lesson_videos
    WHERE lesson_id = ?
    ORDER BY sort_order ASC, id ASC
    `,
    [id]
  )
}

async function getAssignments(id: string, studentId: number) {
  return query<AssignmentRow>(
    `
    SELECT
      a.id,
      a.title,
      a.description,
      a.attachment_url,
      DATE_FORMAT(a.due_at, '%Y-%m-%d %H:%i') AS due_at,
      s.submission_url,
      DATE_FORMAT(s.submitted_at, '%Y-%m-%d %H:%i') AS submitted_at
    FROM lesson_assignments a
    LEFT JOIN lesson_assignment_submissions s
      ON s.assignment_id = a.id
      AND s.student_id = ?
    WHERE a.lesson_id = ?
    ORDER BY a.sort_order ASC, a.id ASC
    `,
    [studentId, id]
  )
}

async function getExams(id: string, studentId: number) {
  return query<ExamRow>(
    `
    SELECT
      e.id,
      e.title,
      e.description,
      e.pass_score,
      e.is_required_to_unlock_next,
      COALESCE(e.placement, 'after_content') AS placement,
      CASE WHEN a.id IS NULL THEN 0 ELSE 1 END AS attempted,
      a.score,
      a.passed,
      COUNT(DISTINCT q.id) AS questions_count
    FROM lesson_exams e
    JOIN lessons l ON l.id = e.lesson_id
    JOIN student_lesson_access sla
      ON sla.lesson_id = l.id
      AND sla.student_id = ?
    LEFT JOIN lesson_exam_attempts a
      ON a.exam_id = e.id
      AND a.student_id = sla.student_id
    LEFT JOIN lesson_exam_questions q ON q.exam_id = e.id
    WHERE e.lesson_id = ?
    GROUP BY
      e.id,
      e.title,
      e.description,
      e.pass_score,
      e.is_required_to_unlock_next,
      e.placement,
      attempted,
      a.score,
      a.passed
    ORDER BY e.placement ASC, e.sort_order ASC, e.id ASC
    `,
    [studentId, id]
  )
}

function ExamCard({ exam }: { exam: ExamRow }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--cream-2)] p-4">
      <h3 className="text-xl font-black">{exam.title}</h3>

      {exam.description ? (
        <p className="muted mt-2">{exam.description}</p>
      ) : null}

      <p className="muted mt-2 text-sm">Passing score: {exam.pass_score}%</p>

      <p className="muted mt-1 text-sm">Questions: {exam.questions_count}</p>

      <p className="muted mt-1 text-sm">
        Required to unlock next lesson: {exam.is_required_to_unlock_next ? "Yes" : "No"}
      </p>

      {exam.attempted ? (
        <div className="alert-success mt-4">
          <p>
            Exam submitted — score: {exam.score}% —{" "}
            {exam.passed ? "Passed" : "Not passed"}
          </p>

          <Link
            href={`/student/exams/${exam.id}?showAnswers=1`}
            className="btn btn-outline mt-4"
          >
            View My Answers
          </Link>
        </div>
      ) : (
        <Link href={`/student/exams/${exam.id}`} className="btn mt-4">
          Start Exam
        </Link>
      )}
    </div>
  )
}

export default async function StudentLessonPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "student" || !user.student_id) {
    redirect("/403")
  }

  const { id } = await params

  const [lesson, videos, assignments, exams] = await Promise.all([
    getLesson(id, user.student_id),
    getLessonVideos(id),
    getAssignments(id, user.student_id),
    getExams(id, user.student_id),
  ])

  if (!lesson) {
    notFound()
  }

  const beforeExams = exams.filter((exam) => exam.placement === "before_content")
  const afterExams = exams.filter((exam) => exam.placement !== "before_content")
  const firstVideo = videos[0]

  return (
    <main>
      <SiteHeader />

      <section className="course-hero">
        <div className="wrap course-hero-grid">
          <div className="card course-panel">
            <div className="course-meta">
              <span className="badge">{lesson.course_title}</span>
              <span className="badge">{lesson.chapter_title}</span>
              <span className="badge">
                Activated: {lesson.activated_at || "Not specified"}
              </span>
              <span className="badge">{videos.length} videos</span>
              <span className="badge">{assignments.length} assignments</span>
              <span className="badge">{exams.length} exams</span>
            </div>

            <h1 className="h1 mt-6">{lesson.lesson_title}</h1>

            <p className="muted mt-6 text-lg">
              {lesson.lesson_description ||
                "This lesson is available now. Start with any pre-lesson exams, then watch videos and review assignments and exams."}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/student" className="btn">
                Back to Student Dashboard
              </Link>

              <Link href={`/courses/${lesson.course_slug}`} className="btn btn-outline">
                Open Course Page
              </Link>
            </div>
          </div>

          <aside className="course-preview">
            <span className="lesson-pill">Activated Lesson</span>
            <h2 className="mt-5 font-[var(--display)] text-6xl font-bold leading-none">
              {beforeExams.length > 0 ? "Start with a pre-lesson exam" : "Ready to start?"}
            </h2>
            <p className="mt-4 max-w-sm opacity-80">
              Follow the lesson content in order: pre-lesson exam if available, then videos, assignments, and exams.
            </p>
          </aside>
        </div>
      </section>

      <section className="section pt-6">
        <div className="wrap grid gap-7 lg:grid-cols-[1fr_340px]">
          <div className="grid gap-6">
            {beforeExams.length > 0 ? (
              <div className="card p-6 md:p-8">
                <span className="eyebrow">Before Lesson</span>
                <h2 className="text-3xl font-black">Pre-lesson Exam</h2>
                <p className="muted mt-2">
                  Take the pre-lesson exam before watching the lesson content to measure your current level.
                </p>

                <div className="mt-6 grid gap-4">
                  {beforeExams.map((exam) => (
                    <ExamCard key={exam.id} exam={exam} />
                  ))}
                </div>
              </div>
            ) : null}

            {videos.map((video, index) => (
              <div
                className="card p-6 md:p-8"
                key={video.id}
                id={`video-${video.id}`}
              >
                <span className="eyebrow">Video {index + 1}</span>
                <h2 className="text-3xl font-black">{video.title}</h2>

                <div className="mt-6 overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--ember)]">
                  <video controls controlsList="nodownload" className="w-full" src={video.video_url}>
                    Your browser does not support video playback.
                  </video>
                </div>
              </div>
            ))}

            {videos.length === 0 ? (
              <div className="card p-6 md:p-8">
                <span className="eyebrow">Watch Lesson</span>
                <h2 className="text-3xl font-black">Lesson Video</h2>

                <div className="mt-6 overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--ember)]">
                  <div className="grid min-h-[320px] place-items-center p-8 text-center text-[var(--cream)]">
                    <div>
                      <div className="mx-auto mb-5 h-24 w-24 rounded-full border-[18px] border-[var(--orange)] border-b-0" />
                      <h3 className="text-3xl font-black">No videos yet</h3>
                      <p className="mt-3 opacity-80">
                        No videos have been uploaded for this lesson yet. They will appear here after the teacher adds them.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="card p-6 md:p-8">
              <span className="eyebrow">Lesson Assignments</span>
              <h2 className="text-3xl font-black">What you need to do</h2>

              <div className="mt-6 grid gap-4">
                {assignments.map((assignment) => (
                  <div
                    className="rounded-2xl border border-[var(--line)] bg-[var(--cream-2)] p-4"
                    key={assignment.id}
                  >
                    <h3 className="text-xl font-black">{assignment.title}</h3>

                    {assignment.description ? (
                      <p className="muted mt-2">{assignment.description}</p>
                    ) : null}

                    <p className="muted mt-2 text-sm">
                      Due date: {assignment.due_at || "Not specified"}
                    </p>

                    {assignment.attachment_url ? (
                      <a
                        href={assignment.attachment_url}
                        className="btn btn-soft mt-4"
                        target="_blank"
                      >
                        Download Assignment File
                      </a>
                    ) : null}

                    {assignment.submission_url ? (
                      <p className="muted mt-3 text-sm">
                        Submitted: {assignment.submitted_at || "Received"}
                      </p>
                    ) : null}

                    <StudentAssignmentSubmitForm
                      assignmentId={assignment.id}
                      existingSubmissionUrl={assignment.submission_url}
                    />
                  </div>
                ))}

                {assignments.length === 0 ? (
                  <p className="muted">There are no assignments for this lesson yet.</p>
                ) : null}
              </div>
            </div>

            <div className="card p-6 md:p-8">
              <span className="eyebrow">After Lesson</span>
              <h2 className="text-3xl font-black">Lesson Exams</h2>

              <div className="mt-6 grid gap-4">
                {afterExams.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}

                {afterExams.length === 0 ? (
                  <p className="muted">There are no after-lesson exams yet.</p>
                ) : null}
              </div>
            </div>
          </div>

          <aside className="card price-card">
            <span className="eyebrow">Access Details</span>
            <h2 className="text-3xl font-black">Lesson available</h2>

            <div className="mt-5 grid gap-3 text-sm font-bold">
              <p>✓ Access is active for this lesson</p>
              <p>✓ Course: {lesson.course_title}</p>
              <p>✓ Chapter: {lesson.chapter_title}</p>
              <p>✓ Before-lesson exams: {beforeExams.length}</p>
              <p>✓ Videos: {videos.length}</p>
              <p>✓ Assignments: {assignments.length}</p>
              <p>✓ After-lesson exams: {afterExams.length}</p>
              <p>
                ✓ Available until: {lesson.access_until ? lesson.access_until : "No expiry date"}
              </p>
            </div>

            {beforeExams.length > 0 ? (
              <Link href={`/student/exams/${beforeExams[0].id}`} className="btn btn-block mt-6">
                Start Pre-lesson Exam
              </Link>
            ) : firstVideo ? (
              <a href={`#video-${firstVideo.id}`} className="btn btn-block mt-6">
                Start Watching
              </a>
            ) : (
              <Link href="/student/activate" className="btn btn-block mt-6">
                Activate Another Code
              </Link>
            )}
          </aside>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}
