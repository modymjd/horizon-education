import { NextResponse } from "next/server"
import { z } from "zod"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/session"

const bodySchema = z.object({
  name: z.string().trim().min(2, "Please enter a name with at least 2 characters."),
})

type StageRow = {
  id: number
  name: string
  sort_order: number | null
}

export async function POST(req: Request) {
  try {
    const { response } = await requireAdmin()

    if (response) {
      return response
    }

    const body = bodySchema.parse(await req.json())

    const existing = await query<StageRow>(
      `SELECT id, name, sort_order FROM educational_stages WHERE name = ? LIMIT 1`,
      [body.name]
    )

    if (existing[0]) {
      return NextResponse.json({
        message: "This stage already exists.",
        stage: existing[0],
      })
    }

    const maxRows = await query<{ max_order: number | null }>(
      `SELECT MAX(sort_order) AS max_order FROM educational_stages`
    )

    const nextOrder = (maxRows[0]?.max_order || 0) + 1

    const result = await query<any>(
      `INSERT INTO educational_stages (name, sort_order) VALUES (?, ?)`,
      [body.name, nextOrder]
    )

    const insertId = (result as any).insertId

    return NextResponse.json({
      message: "Stage added successfully.",
      stage: { id: insertId, name: body.name, sort_order: nextOrder },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0]?.message || "Invalid data." },
        { status: 400 }
      )
    }

    console.error("CREATE_STAGE_ERROR", error)

    return NextResponse.json(
      { message: "Unable to add the stage." },
      { status: 500 }
    )
  }
}

