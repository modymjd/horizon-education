# Horizon Education — Organize Lesson Upload Files
# Run from project root: C:\xampp\htdocs\horizon-education-starter

Write-Host "Creating folders..." -ForegroundColor Cyan

$folders = @(
  "app\admin\lessons\[id]",
  "app\api\admin\lessons\[id]\videos",
  "app\api\admin\lessons\[id]\attachments",
  "app\api\admin\uploads\videos",
  "public\uploads\videos"
)

foreach ($folder in $folders) {
  New-Item -ItemType Directory -Force -Path $folder | Out-Null
}

Write-Host "Removing wrong folders if exist..." -ForegroundColor Yellow

$wrongFolders = @(
  "app\admin\lesson",
  "app\api\admin\upload",
  "app\api\admin\chapters\[id]\lessons\[id]",
  "app\api\admin\courses\[id]\lessons",
  "app\api\admin\courses\[id]\chapters\lessons"
)

foreach ($folder in $wrongFolders) {
  if (Test-Path $folder) {
    Remove-Item -Recurse -Force $folder
    Write-Host "Removed $folder" -ForegroundColor DarkYellow
  }
}

Write-Host "Writing upload video API..." -ForegroundColor Cyan

@'
import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { message: "لم يتم اختيار ملف" },
        { status: 400 }
      )
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { message: "الملف يجب أن يكون فيديو" },
        { status: 400 }
      )
    }

    const maxSizeMb = 500
    const maxSizeBytes = maxSizeMb * 1024 * 1024

    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { message: `حجم الفيديو يجب ألا يتجاوز ${maxSizeMb}MB` },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), "public", "uploads", "videos")
    await mkdir(uploadDir, { recursive: true })

    const safeName = file.name
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.\-_]/g, "")

    const fileName = `${Date.now()}-${safeName}`
    const filePath = path.join(uploadDir, fileName)

    await writeFile(filePath, buffer)

    const publicUrl = `/uploads/videos/${fileName}`

    return NextResponse.json({
      message: "تم رفع الفيديو بنجاح",
      fileName,
      fileUrl: publicUrl,
      storagePath: publicUrl,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("UPLOAD_VIDEO_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء رفع الفيديو" },
      { status: 500 }
    )
  }
}
'@ | Set-Content -Encoding UTF8 "app\api\admin\uploads\videos\route.ts"

Write-Host "Writing lesson videos API..." -ForegroundColor Cyan

@'
import { NextResponse } from "next/server"
import { query, pool } from "@/lib/db"
import { lessonVideoSchema } from "@/lib/validators"

type Params = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_req: Request, context: Params) {
  try {
    const { id } = await context.params
    const lessonId = Number(id)

    const lessonRows = await query<any>(
      `
      SELECT
        l.id,
        l.title,
        l.description,
        l.thumbnail_url,
        l.price,
        l.sort_order,
        l.status,
        l.available_from,
        l.available_until,
        ch.id AS chapter_id,
        ch.title AS chapter_title,
        c.id AS course_id,
        c.title AS course_title,
        u.full_name AS teacher_name
      FROM lessons l
      JOIN chapters ch ON ch.id = l.chapter_id
      JOIN courses c ON c.id = ch.course_id
      JOIN teachers t ON t.id = c.teacher_id
      JOIN users u ON u.id = t.user_id
      WHERE l.id = ?
        AND l.deleted_at IS NULL
      LIMIT 1
      `,
      [lessonId]
    )

    const lesson = lessonRows[0]

    if (!lesson) {
      return NextResponse.json(
        { message: "الحصة غير موجودة" },
        { status: 404 }
      )
    }

    const videos = await query<any>(
      `
      SELECT
        id,
        lesson_id,
        title,
        video_url,
        storage_path,
        duration_seconds,
        sort_order,
        available_from,
        available_until
      FROM lesson_videos
      WHERE lesson_id = ?
      ORDER BY sort_order ASC, id ASC
      `,
      [lessonId]
    )

    return NextResponse.json({
      lesson,
      videos,
    })
  } catch (error) {
    console.error("GET_LESSON_VIDEOS_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء تحميل فيديوهات الحصة" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request, context: Params) {
  const { id } = await context.params
  const lessonId = Number(id)
  const body = lessonVideoSchema.parse(await req.json())

  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [lessonRows] = await conn.execute<any[]>(
      "SELECT id FROM lessons WHERE id = ? AND deleted_at IS NULL LIMIT 1",
      [lessonId]
    )

    if (!lessonRows[0]) {
      await conn.rollback()

      return NextResponse.json(
        { message: "الحصة غير موجودة" },
        { status: 404 }
      )
    }

    await conn.execute(
      `
      INSERT INTO lesson_videos
        (
          lesson_id,
          title,
          video_url,
          storage_path,
          duration_seconds,
          sort_order,
          available_from,
          available_until
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        lessonId,
        body.title,
        body.videoUrl || null,
        body.storagePath || null,
        body.durationSeconds || 0,
        body.sortOrder || 0,
        body.availableFrom || null,
        body.availableUntil || null,
      ]
    )

    await conn.execute(
      `
      INSERT INTO audit_logs
        (user_id, action, entity_type, entity_id, new_values)
      VALUES
        (1, 'create_lesson_video', 'lesson_video', LAST_INSERT_ID(), JSON_OBJECT('title', ?, 'lesson_id', ?))
      `,
      [body.title, lessonId]
    )

    await conn.commit()

    return NextResponse.json({
      message: "تم إضافة الفيديو بنجاح",
    })
  } catch (error) {
    await conn.rollback()

    console.error("CREATE_LESSON_VIDEO_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء إضافة الفيديو" },
      { status: 500 }
    )
  } finally {
    conn.release()
  }
}
'@ | Set-Content -Encoding UTF8 "app\api\admin\lessons\[id]\videos\route.ts"

Write-Host "Writing lesson attachments API..." -ForegroundColor Cyan

@'
import { NextResponse } from "next/server"
import { query, pool } from "@/lib/db"
import { lessonAttachmentSchema } from "@/lib/validators"

type Params = {
  params: Promise<{
    id: string
  }>
}

export async function GET(_req: Request, context: Params) {
  try {
    const { id } = await context.params
    const lessonId = Number(id)

    const attachments = await query<any>(
      `
      SELECT
        id,
        lesson_id,
        title,
        description,
        file_url,
        file_type,
        file_size_kb,
        allow_download,
        available_until
      FROM attachments
      WHERE lesson_id = ?
      ORDER BY id DESC
      `,
      [lessonId]
    )

    return NextResponse.json({
      attachments,
    })
  } catch (error) {
    console.error("GET_LESSON_ATTACHMENTS_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء تحميل المرفقات" },
      { status: 500 }
    )
  }
}

export async function POST(req: Request, context: Params) {
  const { id } = await context.params
  const lessonId = Number(id)
  const body = lessonAttachmentSchema.parse(await req.json())

  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    const [lessonRows] = await conn.execute<any[]>(
      "SELECT id FROM lessons WHERE id = ? AND deleted_at IS NULL LIMIT 1",
      [lessonId]
    )

    if (!lessonRows[0]) {
      await conn.rollback()

      return NextResponse.json(
        { message: "الحصة غير موجودة" },
        { status: 404 }
      )
    }

    await conn.execute(
      `
      INSERT INTO attachments
        (
          lesson_id,
          title,
          description,
          file_url,
          file_type,
          file_size_kb,
          allow_download,
          available_until
        )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        lessonId,
        body.title,
        body.description || null,
        body.fileUrl,
        body.fileType,
        body.fileSizeKb || null,
        body.allowDownload || false,
        body.availableUntil || null,
      ]
    )

    await conn.execute(
      `
      INSERT INTO audit_logs
        (user_id, action, entity_type, entity_id, new_values)
      VALUES
        (1, 'create_lesson_attachment', 'attachment', LAST_INSERT_ID(), JSON_OBJECT('title', ?, 'lesson_id', ?))
      `,
      [body.title, lessonId]
    )

    await conn.commit()

    return NextResponse.json({
      message: "تم إضافة المرفق بنجاح",
    })
  } catch (error) {
    await conn.rollback()

    console.error("CREATE_LESSON_ATTACHMENT_ERROR", error)

    return NextResponse.json(
      { message: "حدث خطأ أثناء إضافة المرفق" },
      { status: 500 }
    )
  } finally {
    conn.release()
  }
}
'@ | Set-Content -Encoding UTF8 "app\api\admin\lessons\[id]\attachments\route.ts"

Write-Host "Writing lesson page..." -ForegroundColor Cyan

@'
import LessonDetailsClient from "./lesson-details-client"

async function getLessonDetails(id: string) {
  const videosRes = await fetch(
    `http://localhost:3000/api/admin/lessons/${id}/videos`,
    {
      cache: "no-store",
    }
  )

  const attachmentsRes = await fetch(
    `http://localhost:3000/api/admin/lessons/${id}/attachments`,
    {
      cache: "no-store",
    }
  )

  const videosData = videosRes.ok
    ? await videosRes.json()
    : { lesson: null, videos: [] }

  const attachmentsData = attachmentsRes.ok
    ? await attachmentsRes.json()
    : { attachments: [] }

  return {
    lesson: videosData.lesson,
    videos: videosData.videos || [],
    attachments: attachmentsData.attachments || [],
  }
}

export default async function LessonDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const data = await getLessonDetails(id)

  return (
    <LessonDetailsClient
      lesson={data.lesson}
      initialVideos={data.videos}
      initialAttachments={data.attachments}
    />
  )
}
'@ | Set-Content -Encoding UTF8 "app\admin\lessons\[id]\page.tsx"

Write-Host "Done. Files organized." -ForegroundColor Green
Write-Host "Now run: rmdir /s /q .next && npm run dev" -ForegroundColor Green