import { NextResponse } from "next/server"
import { query, pool } from "@/lib/db"
import { hashPassword } from "@/lib/auth"
import { teacherSchema } from "@/lib/validators"

export async function GET() {
  try {
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
      { message: "حدث خطأ أثناء تحميل المدرسين" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
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
        { message: "Teacher role is missing" },
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

    const userId = userResult.insertId

    await conn.execute(
      `
      INSERT INTO teachers
        (user_id, bio, address, platform_commission_pct)
      VALUES
        (?, ?, ?, ?)
      `,
      [
        userId,
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
      [userId, userId, body.email, body.fullName]
    )

    await conn.commit()

    return NextResponse.json({
      message: "تم إنشاء المدرس بنجاح",
    })
  } catch (error: any) {
    await conn.rollback()

    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { message: "البريد الإلكتروني أو الهاتف مستخدم بالفعل" },
        { status: 409 }
      )
    }

    console.error("CREATE_TEACHER_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء إنشاء المدرس" },
      { status: 500 }
    )
  } finally {
    conn.release()
  }
}