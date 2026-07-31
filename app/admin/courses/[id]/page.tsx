import CourseDetailsClient from "./course-details-client"

async function getCourseDetails(id: string) {
  const res = await fetch(
    `http://localhost:3000/api/admin/courses/${id}/chapters`,
    {
      cache: "no-store",
    }
  )

  if (!res.ok) {
    return {
      course: null,
      chapters: [],
    }
  }

  return res.json()
}

export default async function CourseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getCourseDetails(id)

  return (
    <CourseDetailsClient
      course={data.course}
      initialChapters={data.chapters || []}
    />
  )
}