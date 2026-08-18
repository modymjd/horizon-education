import { NextResponse } from "next/server"
import { z } from "zod"
import { pool } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

const registerSchema = z.object({
  full_name: z.string().trim().min(3, "Full name must be at least 3 characters."),
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  phone: z.string().trim().min(8, "Phone number must be at least 8 digits."),
  whatsapp_phone: z.string().trim().min(8, "Student WhatsApp number must be at least 8 digits."),
  guardian_name: z.string().trim().min(3, "Guardian name must be at least 3 characters."),
  guardian_phone: z.string().trim().min(8, "Guardian phone must be at least 8 digits."),
  guardian_whatsapp_phone: z.string().trim().optional(),
  national_id: z.string().trim().optional(),
  address: z.string().trim().min(3, "Address must be at least 3 characters."),
  governorate: z.string().trim().min(2, "Governorate must be at least 2 characters."),
  education_type_id: z.number().int().positive("Please select an education type."),
  stage_id: z.number().int().positive("Please select a stage."),
  grade_id: z.number().int().positive("Please select a grade."),
  consent_contact: z.boolean(),
})

function makeStudentCode() {
  const random = Math.floor(100000 + Math.random() * 900000)
  return `STU-${Date.now()}-${random}`
}

function formatZodErrors(error: z.ZodError) {
  const errors: Record<string, string> = {}

  for (const issue of error.issues) {
    const field = String(issue.path[0] || "form")
    if (!errors[field]) {
      errors[field] = issue.message
    }
  }

  return errors
}

export async function POST(req: Request) {
  const conn = await pool.getConnection()

  try {
    const parsed = registerSchema.safeParse(await req.json())

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Please review the highlighted fields.",
          errors: formatZodErrors(parsed.error),
        },
        { status: 400 }
      )
    }

    const body = parsed.data

    if (!body.consent_contact) {
      return NextResponse.json(
        {
          message: "Please agree to educational and administrative contact.",
          errors: {
            consent_contact:
              "You must agree that the platform and teachers may contact you or your guardian for educational and administrative purposes.",
          },
        },
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
        { message: "Student role is missing. Please contact support." },
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
      message: "Student account created successfully. You can sign in now.",
      student_code: studentCode,
    })
  } catch (error: any) {
    await conn.rollback()

    if (error?.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        {
          message: "Email, phone number, or national ID is already registered.",
        },
        { status: 409 }
      )
    }

    console.error("REGISTER_STUDENT_ERROR", error)

    return NextResponse.json(
      { message: "Unable to create the student account. Please try again." },
      { status: 500 }
    )
  } finally {
    conn.release()
  }
}
