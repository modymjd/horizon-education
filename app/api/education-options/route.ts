import { NextResponse } from "next/server"
import { query } from "@/lib/db"

type EducationTypeRow = {
  id: number
  name: string
  slug: string
}

type StageRow = {
  id: number
  name: string
  education_type_id: number | null
  sort_order: number | null
}

type GradeRow = {
  id: number
  name: string
  stage_id: number
  sort_order: number | null
}

export async function GET() {
  try {
    const [educationTypes, stages, grades] = await Promise.all([
      query<EducationTypeRow>(
        `
        SELECT id, name, slug
        FROM education_types
        ORDER BY id ASC
        `
      ),
      query<StageRow>(
        `
        SELECT id, name, education_type_id, sort_order
        FROM educational_stages
        ORDER BY education_type_id ASC, sort_order ASC, id ASC
        `
      ),
      query<GradeRow>(
        `
        SELECT id, name, stage_id, sort_order
        FROM grades
        ORDER BY stage_id ASC, sort_order ASC, id ASC
        `
      ),
    ])

    return NextResponse.json({
      educationTypes,
      stages,
      grades,
    })
  } catch (error) {
    console.error("GET_EDUCATION_OPTIONS_ERROR", error)

    return NextResponse.json(
      { message: "Unable to load education options." },
      { status: 500 }
    )
  }
}
