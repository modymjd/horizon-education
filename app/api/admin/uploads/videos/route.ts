import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { requireAdmin } from "@/lib/session"

export async function POST(req: Request) {
  try {
    const { response } = await requireAdmin()

    if (response) {
      return response
    }

    const formData = await req.formData()
    const file = formData.get("file") as File | null

    if (!file) {
      return NextResponse.json(
        { message: "No file was selected." },
        { status: 400 }
      )
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        { message: "The selected file must be a video." },
        { status: 400 }
      )
    }

    const maxSizeMb = 50
    const maxSizeBytes = maxSizeMb * 1024 * 1024

    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { message: `Video size must not exceed ${maxSizeMb}MB.` },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = path.join(process.cwd(), "public", "uploads", "videos")
    await mkdir(uploadDir, { recursive: true })

    const extension = path.extname(file.name) || ".mp4"
    const fileName = `video-${Date.now()}${extension}`
    const filePath = path.join(uploadDir, fileName)

    await writeFile(filePath, buffer)

    const publicUrl = `/uploads/videos/${fileName}`

    return NextResponse.json({
      message: "Video uploaded successfully.",
      fileName,
      fileUrl: publicUrl,
      storagePath: publicUrl,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error("UPLOAD_VIDEO_ERROR", error)

    return NextResponse.json(
      { message: "Unable to upload the video." },
      { status: 500 }
    )
  }
}
