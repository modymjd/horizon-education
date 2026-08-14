import { NextResponse } from "next/server"
import { z } from "zod"
import { pool } from "@/lib/db"
import { requireAdmin } from "@/lib/session"

type Params = {
  params: Promise<{
    id: string
  }>
}

const patchSchema = z.object({
  action: z.enum(["activate", "suspend"]),
})

export async function PATCH(req: Request, context: Params) {
  const { user, response } = await requireAdmin()

  if (response || !user) {
    return response
  }

  const { id } = await context.params
  const userId = Number(id)

  if (!userId || Number.isNaN(userId)) {
    return NextResponse.json(
      { message: "رقم الطالب غير صحيح" },
      { status: 400 }
    )
  }

  const body = patchSchema.parse(await req.json())
  const nextStatus = body.action === "activate" ? "active" : "suspended"
  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [result] = await conn.execute<any>(
      `
      UPDATE users u
      JOIN roles r ON r.id = u.role_id
      SET u.status = ?
      WHERE u.id = ?
        AND r.name = 'student'
        AND u.deleted_at IS NULL
      `,
      [nextStatus, userId]
    )

    if (result.affectedRows === 0) {
      await conn.rollback()

      return NextResponse.json(
        { message: "الطالب غير موجود" },
        { status: 404 }
      )
    }

    await conn.execute(
      `
      INSERT INTO audit_logs
        (user_id, action, entity_type, entity_id, new_values)
      VALUES
        (?, ?, 'student', ?, JSON_OBJECT('status', ?))
      `,
      [
        user.id,
        body.action === "activate" ? "activate_student" : "suspend_student",
        userId,
        nextStatus,
      ]
    )

    await conn.commit()

    return NextResponse.json({
      message: body.action === "activate" ? "تم تفعيل الطالب" : "تم تعطيل الطالب",
      status: nextStatus,
    })
  } catch (error) {
    await conn.rollback()

    console.error("UPDATE_STUDENT_STATUS_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء تحديث حالة الطالب" },
      { status: 500 }
    )
  } finally {
    conn.release()
  }
}

export async function DELETE(_req: Request, context: Params) {
  const { user, response } = await requireAdmin()

  if (response || !user) {
    return response
  }

  const { id } = await context.params
  const userId = Number(id)

  if (!userId || Number.isNaN(userId)) {
    return NextResponse.json(
      { message: "رقم الطالب غير صحيح" },
      { status: 400 }
    )
  }

  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [result] = await conn.execute<any>(
      `
      UPDATE users u
      JOIN roles r ON r.id = u.role_id
      SET
        u.status = 'suspended',
        u.deleted_at = NOW()
      WHERE u.id = ?
        AND r.name = 'student'
        AND u.deleted_at IS NULL
      `,
      [userId]
    )

    if (result.affectedRows === 0) {
      await conn.rollback()

      return NextResponse.json(
        { message: "الطالب غير موجود" },
        { status: 404 }
      )
    }

    await conn.execute(
      `
      INSERT INTO audit_logs
        (user_id, action, entity_type, entity_id, new_values)
      VALUES
        (?, 'delete_student', 'student', ?, JSON_OBJECT('deleted', true))
      `,
      [user.id, userId]
    )

    await conn.commit()

    return NextResponse.json({
      message: "تم حذف الطالب بنجاح",
    })
  } catch (error) {
    await conn.rollback()

    console.error("DELETE_STUDENT_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء حذف الطالب" },
      { status: 500 }
    )
  } finally {
    conn.release()
  }
}
