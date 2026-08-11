import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { query } from "@/lib/db"
import { requireTeacher } from "@/lib/session"

type TeacherLessonRow = {
  id: number
}

async function verifyTeacherLesson(lessonId: number, teacherId: number) {
  const lessonRows = await query<TeacherLessonRow>(
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

  return lessonRows[0]
}

export async function POST(req: Request) {
  try {
    const { user, response } = await requireTeacher()

    if (response || !user) {
      return response
    }

    if (!user.teacher_id) {
      return NextResponse.json(
        { message: "لم يتم العثور على حساب المدرس" },
        { status: 403 }
      )
    }

    const formData = await req.formData()

    const lessonIdRaw = formData.get("lesson_id")
    const titleRaw = formData.get("title")
    const file = formData.get("video")

    const lessonId = Number(lessonIdRaw)
    const title = String(titleRaw || "فيديو جديد")

    if (!lessonId || Number.isNaN(lessonId)) {
      return NextResponse.json(
        { message: "رقم الحصة غير صحيح" },
        { status: 400 }
      )
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: "لم يتم اختيار فيديو" },
        { status: 400 }
      )
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { message: "الملف المختار ليس فيديو" },
        { status: 400 }
      )
    }

    const maxSizeMb = 100
    const maxSizeBytes = maxSizeMb * 1024 * 1024

    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { message: `حجم الفيديو يجب ألا يتجاوز ${maxSizeMb}MB` },
        { status: 400 }
      )
    }

    const lesson = await verifyTeacherLesson(lessonId, user.teacher_id)

    if (!lesson) {
      return NextResponse.json(
        { message: "الحصة غير موجودة أو غير تابعة لهذا المدرس" },
        { status: 403 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = path.extname(file.name) || ".mp4"
    const safeName = `lesson-${lessonId}-${Date.now()}${ext}`

    const uploadDir = path.join(process.cwd(), "public", "uploads", "videos")
    await mkdir(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, safeName)
    await writeFile(filePath, buffer)

    const publicUrl = `/uploads/videos/${safeName}`

    await query(
      `
      INSERT INTO lesson_videos
        (lesson_id, title, video_url, sort_order)
      VALUES (
        ?,
        ?,
        ?,
        COALESCE(
          (
            SELECT next_order
            FROM (
              SELECT MAX(sort_order) + 1 AS next_order
              FROM lesson_videos
              WHERE lesson_id = ?
            ) AS x
          ),
          1
        )
      )
      `,
      [lessonId, title, publicUrl, lessonId]
    )

    await query(
      `
      UPDATE lessons
      SET video_url = ?
      WHERE id = ?
        AND video_url IS NULL
      `,
      [publicUrl, lessonId]
    )

    return NextResponse.json({
      success: true,
      message: "تم رفع الفيديو بنجاح",
      video_url: publicUrl,
    })
  } catch (error) {
    console.error("UPLOAD_LESSON_VIDEO_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء رفع الفيديو" },
      { status: 500 }
    )
  }
}
