import { NextResponse } from "next/server"
import { z } from "zod"
import { query } from "@/lib/db"
import { requireAdmin } from "@/lib/session"

const bodySchema = z.object({
  name: z.string().trim().min(2, "Please enter a name with at least 2 characters."),
})

function makeSlug(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^\u0600-\u06FFa-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "") || `type-${Date.now()}`
  )
}

type EducationTypeRow = {
  id: number
  name: string
  slug: string
}

export async function POST(req: Request) {
  try {
    const { response } = await requireAdmin()

    if (response) {
      return response
    }

    const body = bodySchema.parse(await req.json())
    const slug = makeSlug(body.name)

    const existing = await query<EducationTypeRow>(
      `SELECT id, name, slug FROM education_types WHERE name = ? LIMIT 1`,
      [body.name]
    )

    if (existing[0]) {
      return NextResponse.json({
        message: "This education type already exists.",
        educationType: existing[0],
      })
    }

    const result = await query<any>(
      `INSERT INTO education_types (name, slug) VALUES (?, ?)`,
      [body.name, slug]
    )

    const insertId = (result as any).insertId

    return NextResponse.json({
      message: "Education type added successfully.",
      educationType: { id: insertId, name: body.name, slug },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0]?.message || "Invalid data." },
        { status: 400 }
      )
    }

    console.error("CREATE_EDUCATION_TYPE_ERROR", error)

    return NextResponse.json(
      { message: "Unable to add the education type." },
      { status: 500 }
    )
  }
}

