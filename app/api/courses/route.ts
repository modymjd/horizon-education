import { NextResponse } from 'next/server'
import { courseSchema } from '@/lib/validators'
import { pool } from '@/lib/db'
export async function POST(req:Request){const b=courseSchema.parse(await req.json()); const slug=b.title.toLowerCase().replace(/\s+/g,'-')+'-'+Date.now(); await pool.execute('INSERT INTO courses(slug,title,teacher_id,education_type_id,status,starts_at,ends_at,created_by) VALUES(?,?,?,?,?,?,?,1)',[slug,b.title,b.teacherId,b.educationTypeId||null,b.status,b.startsAt||null,b.endsAt||null]); return NextResponse.json({slug})}
