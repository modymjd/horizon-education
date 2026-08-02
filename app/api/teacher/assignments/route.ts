import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { query } from "@/lib/db"

type TeacherLessonRow = {
  id: number
}

async function verifyTeacherLesson(lessonId: number) {
  const rows = await query<TeacherLessonRow>(
    `
    SELECT l.id
    FROM lessons l
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    JOIN teachers t ON t.id = c.teacher_id
    JOIN users u ON u.id = t.user_id
    WHERE u.email = 'teacher@horizon.test'
      AND l.id = ?
    LIMIT 1
    `,
    [lessonId]
  )

  return rows[0]
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const lessonId = Number(formData.get("lesson_id"))
    const title = String(formData.get("title") || "")
    const description = String(formData.get("description") || "")
    const dueAt = String(formData.get("due_at") || "")
    const file = formData.get("attachment")

    if (!lessonId || Number.isNaN(lessonId)) {
      return NextResponse.json(
        { message: "رقم الحصة غير صحيح" },
        { status: 400 }
      )
    }

    if (!title.trim()) {
      return NextResponse.json(
        { message: "عنوان الواجب مطلوب" },
        { status: 400 }
      )
    }

    const lesson = await verifyTeacherLesson(lessonId)

    if (!lesson) {
      return NextResponse.json(
        { message: "الحصة غير موجودة أو غير تابعة لهذا المدرس" },
        { status: 403 }
      )
    }

    let attachmentUrl: string | null = null

    if (file instanceof File && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const ext = path.extname(file.name) || ".pdf"
      const safeName = `assignment-${lessonId}-${Date.now()}${ext}`

      const uploadDir = path.join(
        process.cwd(),
        "public",
        "uploads",
        "assignments"
      )

      await mkdir(uploadDir, { recursive: true })

      const filePath = path.join(uploadDir, safeName)
      await writeFile(filePath, buffer)

      attachmentUrl = `/uploads/assignments/${safeName}`
    }

    await query(
      `
      INSERT INTO lesson_assignments
        (lesson_id, title, description, attachment_url, due_at, sort_order)
      VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        COALESCE(
          (
            SELECT next_order
            FROM (
              SELECT MAX(sort_order) + 1 AS next_order
              FROM lesson_assignments
              WHERE lesson_id = ?
            ) AS x
          ),
          1
        )
      )
      `,
      [
        lessonId,
        title.trim(),
        description.trim() || null,
        attachmentUrl,
        dueAt || null,
        lessonId,
      ]
    )

    return NextResponse.json({
      success: true,
      message: "تم إضافة الواجب بنجاح",
    })
  } catch (error) {
    console.error("CREATE_ASSIGNMENT_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء إضافة الواجب" },
      { status: 500 }
    )
  }
}