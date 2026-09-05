import { NextResponse } from "next/server"
import { createReadStream, createWriteStream } from "fs"
import { mkdir, readdir, readFile, rm, stat, writeFile } from "fs/promises"
import path from "path"
import { pipeline } from "stream/promises"
import { query } from "@/lib/db"
import { requireTeacher } from "@/lib/session"
import { VIDEO_RULES, validateFileAgainstRules } from "@/lib/file-security"

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
      AND l.deleted_at IS NULL
    LIMIT 1
    `,
    [teacherId, lessonId]
  )

  return lessonRows[0]
}

function safeUploadId(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]/g, "")
}

function getExtension(fileName: string) {
  if (!fileName.includes(".")) return ""
  return "." + fileName.split(".").pop()!.toLowerCase()
}

function getUploadRoot(uploadId: string) {
  return path.join(process.cwd(), "public", "uploads", "tmp", uploadId)
}

async function appendFileByStream(sourcePath: string, destinationPath: string) {
  await pipeline(
    createReadStream(sourcePath),
    createWriteStream(destinationPath, { flags: "a" })
  )
}

async function getUploadedChunks(uploadRoot: string) {
  try {
    const entries = await readdir(uploadRoot)

    return entries
      .map((entry) => {
        const match = entry.match(/^chunk-(\d+)$/)
        return match ? Number(match[1]) : null
      })
      .filter((value): value is number => value !== null)
      .sort((a, b) => a - b)
  } catch {
    return []
  }
}

async function completeUpload(args: {
  lessonId: number
  title: string
  uploadId: string
  fileName: string
  totalChunks: number
}) {
  const { lessonId, title, uploadId, fileName, totalChunks } = args

  const extension = getExtension(fileName)

  if (!VIDEO_RULES.some((rule) => rule.extension === extension)) {
    return NextResponse.json(
      { message: `File type "${extension || "unknown"}" is not allowed.` },
      { status: 400 }
    )
  }

  const uploadRoot = getUploadRoot(uploadId)
  const uploadedChunks = await getUploadedChunks(uploadRoot)

  if (uploadedChunks.length < totalChunks) {
    return NextResponse.json(
      {
        message: "Upload is not complete yet.",
        uploadedChunks,
        missingChunks: Array.from({ length: totalChunks }, (_, index) => index).filter(
          (index) => !uploadedChunks.includes(index)
        ),
      },
      { status: 400 }
    )
  }

  for (let index = 0; index < totalChunks; index++) {
    const partPath = path.join(uploadRoot, `chunk-${index}`)

    try {
      await stat(partPath)
    } catch {
      return NextResponse.json(
        { message: `Upload chunk ${index + 1} is missing. Please retry.` },
        { status: 400 }
      )
    }
  }

  const firstChunkPath = path.join(uploadRoot, "chunk-0")
  const firstChunkBuffer = await readFile(firstChunkPath)
  const validation = validateFileAgainstRules(firstChunkBuffer, fileName, VIDEO_RULES)

  if (!validation.ok) {
    await rm(uploadRoot, { recursive: true, force: true })

    return NextResponse.json(
      { message: validation.reason },
      { status: 400 }
    )
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", "videos")
  await mkdir(uploadDir, { recursive: true })

  const finalName = `lesson-${lessonId}-${Date.now()}${validation.extension}`
  const finalPath = path.join(uploadDir, finalName)

  await writeFile(finalPath, Buffer.alloc(0))

  for (let index = 0; index < totalChunks; index++) {
    const partPath = path.join(uploadRoot, `chunk-${index}`)
    await appendFileByStream(partPath, finalPath)
  }

  await rm(uploadRoot, { recursive: true, force: true })

  const publicUrl = `/uploads/videos/${finalName}`

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
    done: true,
    message: "Video uploaded successfully.",
    video_url: publicUrl,
  })
}

export async function GET(req: Request) {
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

    const url = new URL(req.url)
    const lessonId = Number(url.searchParams.get("lesson_id"))
    const uploadId = safeUploadId(String(url.searchParams.get("upload_id") || ""))

    if (!lessonId || Number.isNaN(lessonId) || !uploadId) {
      return NextResponse.json(
        { message: "Invalid upload status request." },
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

    const uploadRoot = getUploadRoot(uploadId)
    const uploadedChunks = await getUploadedChunks(uploadRoot)

    return NextResponse.json({
      success: true,
      uploadedChunks,
    })
  } catch (error) {
    console.error("GET_LESSON_VIDEO_CHUNK_STATUS_ERROR", error)

    return NextResponse.json(
      { message: "Unable to get upload status." },
      { status: 500 }
    )
  }
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

    const action = String(formData.get("action") || "chunk")
    const lessonId = Number(formData.get("lesson_id"))
    const title = String(formData.get("title") || "New video")
    const uploadId = safeUploadId(String(formData.get("upload_id") || ""))
    const fileName = String(formData.get("file_name") || "")
    const totalChunks = Number(formData.get("total_chunks"))

    if (!lessonId || Number.isNaN(lessonId)) {
      return NextResponse.json({ message: "Invalid lesson ID." }, { status: 400 })
    }

    if (!uploadId) {
      return NextResponse.json({ message: "Invalid upload ID." }, { status: 400 })
    }

    if (!fileName) {
      return NextResponse.json({ message: "Missing file name." }, { status: 400 })
    }

    if (Number.isNaN(totalChunks) || totalChunks <= 0) {
      return NextResponse.json({ message: "Invalid total chunks." }, { status: 400 })
    }

    const lesson = await verifyTeacherLesson(lessonId, user.teacher_id)

    if (!lesson) {
      return NextResponse.json(
        { message: "Lesson not found or does not belong to this teacher." },
        { status: 403 }
      )
    }

    if (action === "complete") {
      return completeUpload({
        lessonId,
        title,
        uploadId,
        fileName,
        totalChunks,
      })
    }

    const chunkIndex = Number(formData.get("chunk_index"))
    const chunk = formData.get("chunk")

    if (
      Number.isNaN(chunkIndex) ||
      chunkIndex < 0 ||
      chunkIndex >= totalChunks
    ) {
      return NextResponse.json({ message: "Invalid upload chunk." }, { status: 400 })
    }

    if (!(chunk instanceof File)) {
      return NextResponse.json(
        { message: "No upload chunk was received." },
        { status: 400 }
      )
    }

    const extension = getExtension(fileName)

    if (!VIDEO_RULES.some((rule) => rule.extension === extension)) {
      return NextResponse.json(
        { message: `File type "${extension || "unknown"}" is not allowed.` },
        { status: 400 }
      )
    }

    const uploadRoot = getUploadRoot(uploadId)
    await mkdir(uploadRoot, { recursive: true })

    const chunkPath = path.join(uploadRoot, `chunk-${chunkIndex}`)

    try {
      const existing = await stat(chunkPath)

      if (existing.size === chunk.size) {
        return NextResponse.json({
          success: true,
          done: false,
          uploadedChunk: chunkIndex,
          skipped: true,
        })
      }
    } catch {
      // Chunk does not exist yet.
    }

    const chunkBuffer = Buffer.from(await chunk.arrayBuffer())
    await writeFile(chunkPath, chunkBuffer)

    return NextResponse.json({
      success: true,
      done: false,
      uploadedChunk: chunkIndex,
    })
  } catch (error) {
    console.error("UPLOAD_LESSON_VIDEO_CHUNK_ERROR", error)

    return NextResponse.json(
      { message: "Unable to upload the video chunk." },
      { status: 500 }
    )
  }
}
