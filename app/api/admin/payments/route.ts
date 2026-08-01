import { NextResponse } from "next/server"
import { z } from "zod"
import { nanoid } from "nanoid"
import { query, pool } from "@/lib/db"

const paymentSchema = z.object({
  student_id: z.number().int().positive(),
  lesson_id: z.number().int().positive(),
  amount_paid: z.number().positive(),
  payment_method_id: z.number().int().positive(),
  notes: z.string().optional(),
})

type LessonRow = {
  price: number
  teacher_id: number
  platform_commission_pct: number
}

export async function POST(req: Request) {
  try {
    const body = paymentSchema.parse(await req.json())

    const lessonRows = await query<LessonRow>(
      `
      SELECT
        l.price,
        t.id AS teacher_id,
        t.platform_commission_pct
      FROM lessons l
      JOIN chapters ch ON ch.id = l.chapter_id
      JOIN courses c ON c.id = ch.course_id
      JOIN teachers t ON t.id = c.teacher_id
      WHERE l.id = ?
      LIMIT 1
      `,
      [body.lesson_id]
    )

    const lesson = lessonRows[0]

    if (!lesson) {
      return NextResponse.json(
        { message: "الحصة غير موجودة" },
        { status: 404 }
      )
    }

    const commissionPct = Number(lesson.platform_commission_pct || 0)
    const platformAmount = (Number(body.amount_paid) * commissionPct) / 100
    const teacherAmount = Number(body.amount_paid) - platformAmount
    const invoiceNumber = `INV-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`

    const adminRows = await query<{ id: number }>(
      `
      SELECT u.id
      FROM users u
      JOIN roles r ON r.id = u.role_id
      WHERE r.name = "admin"
        AND u.deleted_at IS NULL
      ORDER BY u.id ASC
      LIMIT 1
      `
    )

    const adminId = adminRows[0]?.id

    if (!adminId) {
      return NextResponse.json(
        { message: "لا يوجد حساب إدارة لتسجيل الدفعة" },
        { status: 400 }
      )
    }

    const conn = await pool.getConnection()

    try {
      await conn.beginTransaction()

      const [result] = await conn.execute(
        `
        INSERT INTO payments
          (
            invoice_number,
            student_id,
            lesson_id,
            amount_paid,
            lesson_price_at_payment,
            platform_amount,
            teacher_amount,
            commission_pct,
            payment_method_id,
            transaction_ref,
            paid_at,
            notes,
            created_by
          )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
        `,
        [
          invoiceNumber,
          body.student_id,
          body.lesson_id,
          body.amount_paid,
          lesson.price,
          platformAmount,
          teacherAmount,
          commissionPct,
          body.payment_method_id,
          null,
          body.notes || null,
          adminId,
        ]
      )

      const paymentId = (result as any).insertId

      await conn.execute(
        `
        UPDATE teachers
        SET total_earnings = total_earnings + ?
        WHERE id = ?
        `,
        [teacherAmount, lesson.teacher_id]
      )

      await conn.execute(
        `
        INSERT IGNORE INTO student_lesson_access
          (student_id, lesson_id, payment_id)
        VALUES (?, ?, ?)
        `,
        [body.student_id, body.lesson_id, paymentId]
      )

      await conn.commit()

      return NextResponse.json({
        success: true,
        payment_id: paymentId,
        invoice_number: invoiceNumber,
        platform_amount: platformAmount,
        teacher_amount: teacherAmount,
      })
    } catch (error) {
      await conn.rollback()
      throw error
    } finally {
      conn.release()
    }
  } catch (error) {
    console.error("CREATE_PAYMENT_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء تسجيل الدفعة" },
      { status: 500 }
    )
  }
}

