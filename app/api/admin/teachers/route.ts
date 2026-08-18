import { NextResponse } from "next/server"
import { query, pool } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { teacherSchema } from "@/lib/validators"
import { requireAdmin } from "@/lib/session"

export async function GET() {
  try {
    const { response } = await requireAdmin()

    if (response) {
      return response
    }

    const teachers = await query<any>(
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

    return NextResponse.json({ teachers })
  } catch (error) {
    console.error("GET_TEACHERS_ERROR", error)

    return NextResponse.json(
      { message: "Unable to load teachers." },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const { user, response } = await requireAdmin()

  if (response || !user) {
    return response
  }

  const body = teacherSchema.parse(await req.json())
  const passwordHash = await hashPassword(body.password)
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [roleRows] = await conn.execute<any[]>(
      "SELECT id FROM roles WHERE name = 'teacher' LIMIT 1"
    )

    const teacherRoleId = roleRows[0]?.id

    if (!teacherRoleId) {
      await conn.rollback()

      return NextResponse.json(
        { message: "Teacher role is missing. Please contact support." },
        { status: 500 }
      )
    }

    const [userResult] = await conn.execute<any>(
      `
      INSERT INTO users
        (role_id, email, phone, password_hash, full_name, status)
      VALUES
        (?, ?, ?, ?, ?, ?)
      `,
      [
        teacherRoleId,
        body.email,
        body.phone,
        passwordHash,
        body.fullName,
        body.status,
      ]
    )

    const teacherUserId = userResult.insertId

    await conn.execute(
      `
      INSERT INTO teachers
        (user_id, bio, address, platform_commission_pct)
      VALUES
        (?, ?, ?, ?)
      `,
      [
        teacherUserId,
        body.bio || null,
        body.address || null,
        body.commission,
      ]
    )

    await conn.execute(
      `
      INSERT INTO audit_logs
        (user_id, action, entity_type, entity_id, new_values)
      VALUES
        (?, 'create_teacher', 'teacher', ?, JSON_OBJECT('email', ?, 'full_name', ?))
      `,
      [user.id, teacherUserId, body.email, body.fullName]
    )

    await conn.commit()

    return NextResponse.json({
      message: "Teacher created successfully.",
    })
  } catch (error: any) {
    await conn.rollback()

    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { message: "Email or phone number is already registered." },
        { status: 409 }
      )
    }

    console.error("CREATE_TEACHER_ERROR", error)

    return NextResponse.json(
      { message: "Unable to create the teacher." },
      { status: 500 }
    )
  } finally {
    conn.release()
  }
}
