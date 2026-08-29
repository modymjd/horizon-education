import { redirect } from "next/navigation"
import { query } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import TeachersClient from "./teachers-client"

async function getTeachers() {
  return query<any>(
    `
    SELECT
      t.id,
      u.full_name,
      u.email,
      u.phone,
      u.status,
      t.bio,
      t.address,
      t.platform_commission_pct,
      COUNT(c.id) AS courses_count
    FROM teachers t
    JOIN users u ON u.id = t.user_id
    LEFT JOIN courses c ON c.teacher_id = t.id
    WHERE u.deleted_at IS NULL
    GROUP BY
      t.id,
      u.full_name,
      u.email,
      u.phone,
      u.status,
      t.bio,
      t.address,
      t.platform_commission_pct
    ORDER BY t.id DESC
    `
  )
}

export default async function AdminTeachersPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  if (user.role !== "admin") {
    redirect("/403")
  }

  const teachers = await getTeachers()

  return <TeachersClient initialTeachers={teachers} />
}

