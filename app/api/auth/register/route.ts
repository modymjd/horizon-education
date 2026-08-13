import { NextResponse } from "next/server"
import { z } from "zod"
import { pool } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

const registerSchema = z.object({
  full_name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(8),
  whatsapp_phone: z.string().min(8),
  guardian_name: z.string().min(3),
  guardian_phone: z.string().min(8),
  guardian_whatsapp_phone: z.string().optional(),
  national_id: z.string().optional(),
  address: z.string().min(3),
  governorate: z.string().min(2),
  education_type_id: z.number().int().positive(),
  stage_id: z.number().int().positive(),
  grade_id: z.number().int().positive(),
  consent_contact: z.boolean(),
})

function makeStudentCode() {
  const random = Math.floor(100000 + Math.random() * 900000)
  return `STU-${Date.now()}-${random}`
}

export async function POST(req: Request) {
  const conn = await pool.getConnection()

  try {
    const body = registerSchema.parse(await req.json())

    if (!body.consent_contact) {
      return NextResponse.json(
        { message: "يجب الموافقة على تواصل المنصة والمدرس لأغراض تعليمية" },
        { status: 400 }
      )
    }

    await conn.beginTransaction()

    const [roleRows] = await conn.execute<any[]>(
      "SELECT id FROM roles WHERE name = 'student' LIMIT 1"
    )

    const studentRoleId = roleRows[0]?.id

    if (!studentRoleId) {
      await conn.rollback()

      return NextResponse.json(
        { message: "Student role is missing" },
        { status: 500 }
      )
    }

    const passwordHash = await hashPassword(body.password)

    const [userResult] = await conn.execute<any>(
      `
      INSERT INTO users
        (role_id, email, phone, password_hash, full_name, status, max_devices)
      VALUES
        (?, ?, ?, ?, ?, 'active', 3)
      `,
      [
        studentRoleId,
        body.email,
        body.phone,
        passwordHash,
        body.full_name,
      ]
    )

    const userId = userResult.insertId

    const [guardianResult] = await conn.execute<any>(
      `
      INSERT INTO guardians
        (name, phone, whatsapp_phone, alt_phone)
      VALUES
        (?, ?, ?, NULL)
      `,
      [
        body.guardian_name,
        body.guardian_phone,
        body.guardian_whatsapp_phone || body.guardian_phone,
      ]
    )

    const guardianId = guardianResult.insertId

    const studentCode = makeStudentCode()

    await conn.execute(
      `
      INSERT INTO students
        (
          user_id,
          student_code,
          national_id,
          address,
          governorate,
          whatsapp_phone,
          stage_id,
          grade_id,
          education_type_id,
          guardian_id
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        userId,
        studentCode,
        body.national_id || null,
        body.address,
        body.governorate,
        body.whatsapp_phone,
        body.stage_id,
        body.grade_id,
        body.education_type_id,
        guardianId,
      ]
    )

    await conn.commit()

    return NextResponse.json({
      success: true,
      message: "تم إنشاء حساب الطالب بنجاح. يمكنك تسجيل الدخول الآن.",
      student_code: studentCode,
    })
  } catch (error: any) {
    await conn.rollback()

    if (error?.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { message: "البريد الإلكتروني أو الهاتف أو الرقم القومي مستخدم بالفعل" },
        { status: 409 }
      )
    }

    console.error("REGISTER_STUDENT_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء إنشاء حساب الطالب" },
      { status: 500 }
    )
  } finally {
    conn.release()
  }
}
