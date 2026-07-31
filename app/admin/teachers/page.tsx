import TeachersClient from "./teachers-client"

async function getTeachers() {
  const res = await fetch("http://localhost:3000/api/admin/teachers", {
    cache: "no-store",
  })

  if (!res.ok) {
    return []
  }

  const data = await res.json()
  return data.teachers || []
}

export default async function AdminTeachersPage() {
  const teachers = await getTeachers()

  return <TeachersClient initialTeachers={teachers} />
}