import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { query } from "@/lib/db"
import { requireTeacher } from "@/lib/session"
import { ASSIGNMENT_RULES, validateFileAgainstRules } from "@/lib/file-security"

type TeacherLessonRow = {
  id: number
}

async function verifyTeacherLesson(lessonId: number, teacherId: number) {
  const rows = await query<TeacherLessonRow>(
    `
    SELECT l.id
    FROM lessons l
    JOIN chapters ch ON ch.id = l.chapter_id
    JOIN courses c ON c.id = ch.course_id
    WHERE c.teacher_id = ?
      AND l.id = ?
    LIMIT 1
    `,
    [teacherId, lessonId]
  )

  return rows[0]
}

export async function POST(req: Request) {
  try {
    const { user, response } = await requireTeacher()

    if (response || !user) {
      return response
    }

    if (!user.teacher_id) {
      return NextResponse.json(
        { message: "Teacher account was not found." },
        { status: 403 }
      )
    }

    const formData = await req.formData()

    const lessonId = Number(formData.get("lesson_id"))
    const title = String(formData.get("title") || "")
    const description = String(formData.get("description") || "")
    const dueAt = String(formData.get("due_at") || "")
    const file = formData.get("attachment")

    if (!lessonId || Number.isNaN(lessonId)) {
      return NextResponse.json(
        { message: "Invalid lesson ID." },
        { status: 400 }
      )
    }

    if (!title.trim()) {
      return NextResponse.json(
        { message: "Assignment title is required." },
        { status: 400 }
      )
    }

    const lesson = await verifyTeacherLesson(lessonId, user.teacher_id)

    if (!lesson) {
      return NextResponse.json(
        { message: "Lesson not found or does not belong to this teacher." },
        { status: 403 }
      )
    }

    let attachmentUrl: string | null = null

    if (file instanceof File && file.size > 0) {
      const maxSizeMb = 50
      const maxSizeBytes = maxSizeMb * 1024 * 1024

      if (file.size > maxSizeBytes) {
        return NextResponse.json(
          { message: `Attachment size must not exceed ${maxSizeMb}MB.` },
          { status: 400 }
        )
      }

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const validation = validateFileAgainstRules(
        buffer,
        file.name,
        ASSIGNMENT_RULES
      )

      if (!validation.ok) {
        return NextResponse.json(
          { message: validation.reason },
          { status: 400 }
        )
      }

      const safeName = `assignment-${lessonId}-${Date.now()}${validation.extension}`

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
      message: "Assignment added successfully.",
    })
  } catch (error) {
    console.error("CREATE_ASSIGNMENT_ERROR", error)

    return NextResponse.json(
      { message: "Unable to add the assignment." },
      { status: 500 }
    )
  }
}
