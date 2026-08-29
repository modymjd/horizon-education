import { NextResponse } from "next/server"
import { z } from "zod"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/session"

const bodySchema = z.object({
  name: z.string().trim().min(1, "Please enter a name."),
  stageId: z.coerce.number().int().positive("Please choose a stage first."),
})

type GradeRow = {
  id: number
  name: string
  stage_id: number
  sort_order: number | null
}

export async function POST(req: Request) {
  try {
    const { response } = await requireAdmin()

    if (response) {
      return response
    }

    const body = bodySchema.parse(await req.json())

    const existing = await query<GradeRow>(
      `SELECT id, name, stage_id, sort_order FROM grades WHERE name = ? AND stage_id = ? LIMIT 1`,
      [body.name, body.stageId]
    )

    if (existing[0]) {
      return NextResponse.json({
        message: "This grade already exists for the selected stage.",
        grade: existing[0],
      })
    }

    const maxRows = await query<{ max_order: number | null }>(
      `SELECT MAX(sort_order) AS max_order FROM grades WHERE stage_id = ?`,
      [body.stageId]
    )

    const nextOrder = (maxRows[0]?.max_order || 0) + 1

    const result = await query<any>(
      `INSERT INTO grades (stage_id, name, sort_order) VALUES (?, ?, ?)`,
      [body.stageId, body.name, nextOrder]
    )

    const insertId = (result as any).insertId

    return NextResponse.json({
      message: "Grade added successfully.",
      grade: { id: insertId, name: body.name, stage_id: body.stageId, sort_order: nextOrder },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0]?.message || "Invalid data." },
        { status: 400 }
      )
    }

    console.error("CREATE_GRADE_ERROR", error)

    return NextResponse.json(
      { message: "Unable to add the grade." },
      { status: 500 }
    )
  }
}

