import { redirect } from "next/navigation"

export default function LegacyTeacherLessonPage() {
  redirect("/teacher/courses")
}
