import CoursesClient from "./courses-client"

async function getCoursesData() {
  const res = await fetch("http://localhost:3000/api/admin/courses", {
    cache: "no-store",
  })

  if (!res.ok) {
    return {
      courses: [],
      teachers: [],
      educationTypes: [],
    }
  }

  return res.json()
}

export default async function AdminCoursesPage() {
  const data = await getCoursesData()

  return (
    <CoursesClient
      initialCourses={data.courses || []}
      teachers={data.teachers || []}
      educationTypes={data.educationTypes || []}
    />
  )
}