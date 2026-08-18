import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { nanoid } from "nanoid"
import { query, pool } from "@/lib/db"
import { requireStudent } from "@/lib/session"

type AssignmentAccessRow = {
  id: number
}

export async function POST(req: Request) {
  try {
    const { user, response } = await requireStudent()

    if (response || !user) {
      return response
    }

    if (!user.student_id) {
      return NextResponse.json(
        { message: "Student account was not found." },
        { status: 403 }
      )
    }

    const formData = await req.formData()

    const assignmentId = Number(formData.get("assignment_id"))
    const notes = String(formData.get("notes") || "").trim()
    const file = formData.get("submission") as File | null

    if (!assignmentId || Number.isNaN(assignmentId)) {
      return NextResponse.json(
        { message: "Invalid assignment ID." },
        { status: 400 }
      )
    }

    if (!file) {
      return NextResponse.json(
        { message: "Please select a submission file first." },
        { status: 400 }
      )
    }

    const accessRows = await query<AssignmentAccessRow>(
      `
      SELECT a.id
      FROM lesson_assignments a
      JOIN lessons l ON l.id = a.lesson_id
      JOIN student_lesson_access sla ON sla.lesson_id = l.id
      WHERE a.id = ?
        AND sla.student_id = ?
      LIMIT 1
      `,
      [assignmentId, user.student_id]
    )

    if (!accessRows[0]) {
      return NextResponse.json(
        { message: "You do not have permission to submit this assignment." },
        { status: 403 }
      )
    }

    const maxSizeMb = 50
    const maxSizeBytes = maxSizeMb * 1024 * 1024

    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { message: `File size must not exceed ${maxSizeMb}MB.` },
        { status: 400 }
      )
    }

    const allowedExtensions = [
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".png",
      ".jpg",
      ".jpeg",
    ]

    const extension = path.extname(file.name).toLowerCase()

    if (!allowedExtensions.includes(extension)) {
      return NextResponse.json(
        {
          message:
            "Unsupported file type. Please use PDF, Word, Excel, or an image file.",
        },
        { status: 400 }
      )
    }

    const uploadDir = path.join(
      process.cwd(),
      "public",
      "uploads",
      "assignment-submissions"
    )

    await mkdir(uploadDir, { recursive: true })

    const fileName = `submission-${assignmentId}-${user.student_id}-${nanoid(8)}${extension}`
    const filePath = path.join(uploadDir, fileName)

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    await writeFile(filePath, buffer)

    const publicUrl = `/uploads/assignment-submissions/${fileName}`
    const conn = await pool.getConnection()

    try {
      await conn.beginTransaction()

      await conn.execute(
        `
        INSERT INTO lesson_assignment_submissions
          (
            assignment_id,
            student_id,
            submission_url,
            notes,
            status,
            submitted_at
          )
        VALUES
          (?, ?, ?, ?, 'submitted', NOW())
        ON DUPLICATE KEY UPDATE
          submission_url = VALUES(submission_url),
          notes = VALUES(notes),
          status = 'submitted',
          submitted_at = NOW(),
          reviewed_at = NULL,
          teacher_notes = NULL
        `,
        [
          assignmentId,
          user.student_id,
          publicUrl,
          notes || null,
        ]
      )

      await conn.commit()
    } catch (error) {
      await conn.rollback()
      throw error
    } finally {
      conn.release()
    }

    return NextResponse.json({
      success: true,
      message: "Assignment submitted successfully.",
      submission_url: publicUrl,
    })
  } catch (error) {
    console.error("SUBMIT_ASSIGNMENT_ERROR", error)

    return NextResponse.json(
      { message: "Unable to submit the assignment." },
      { status: 500 }
    )
  }
}
