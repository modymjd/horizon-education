import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifySession, type Role } from "@/lib/auth"

export type CurrentUser = {
  id: number
  role: Role
  email: string
  full_name: string
  teacher_id: number | null
  student_id: number | null
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("horizon_session")?.value

  if (!token) return null

  try {
    const payload = await verifySession(token)

    const rows = await query<CurrentUser>(
      `
      SELECT
        u.id,
        r.name AS role,
        u.email,
        u.full_name,
        t.id AS teacher_id,
        s.id AS student_id
      FROM users u
      JOIN roles r ON r.id = u.role_id
      LEFT JOIN teachers t ON t.user_id = u.id
      LEFT JOIN students s ON s.user_id = u.id
      WHERE u.id = ?
        AND u.deleted_at IS NULL
      LIMIT 1
      `,
      [payload.userId]
    )

    const user = rows[0]

    if (!user) return null
    if (user.role !== payload.role) return null

    return user
  } catch {
    return null
  }
}

export async function requireUser() {
  const user = await getCurrentUser()

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { message: "يجب تسجيل الدخول أولًا" },
        { status: 401 }
      ),
    }
  }

  return { user, response: null }
}

export async function requireRole(role: Role) {
  const { user, response } = await requireUser()

  if (response || !user) {
    return { user: null, response }
  }

  if (user.role !== role) {
    return {
      user: null,
      response: NextResponse.json(
        { message: "ليس لديك صلاحية لتنفيذ هذه العملية" },
        { status: 403 }
      ),
    }
  }

  return { user, response: null }
}

export const requireAdmin = () => requireRole("admin")
export const requireTeacher = () => requireRole("teacher")
export const requireStudent = () => requireRole("student")
