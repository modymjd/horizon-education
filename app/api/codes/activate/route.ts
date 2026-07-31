import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { accessCodeSchema } from '@/lib/validators'
import { query, pool } from '@/lib/db'
export async function POST(req:Request){
  const {code}=accessCodeSchema.parse(await req.json())
  const studentId=1 // replace with authenticated student id from session
  const candidates=await query<any>('SELECT ac.*,l.id lesson_id,c.access_duration_days FROM access_codes ac JOIN lessons l ON l.id=ac.lesson_id JOIN chapters ch ON ch.id=l.chapter_id JOIN courses c ON c.id=ch.course_id WHERE ac.status="new" AND (ac.expires_at IS NULL OR ac.expires_at>NOW()) LIMIT 50')
  const match=candidates.find(c=>bcrypt.compareSync(code,c.code_hash))
  if(!match) return NextResponse.json({message:'الكود غير صالح أو منتهي'},{status:422})
  if(match.assigned_student_id && match.assigned_student_id!==studentId) return NextResponse.json({message:'الكود غير مخصص لهذا الطالب'},{status:403})
  const conn=await pool.getConnection(); try{await conn.beginTransaction(); await conn.execute('UPDATE access_codes SET status="used", used_by_student_id=?, used_at=NOW() WHERE id=?',[studentId,match.id]); await conn.execute('INSERT INTO student_lesson_access(student_id,lesson_id,access_code_id,access_until) VALUES(?,?,?,DATE_ADD(NOW(), INTERVAL COALESCE(?,30) DAY)) ON DUPLICATE KEY UPDATE access_until=VALUES(access_until)',[studentId,match.lesson_id,match.id,match.access_duration_days]); await conn.commit(); return NextResponse.json({message:'تم تفعيل الحصة بنجاح'})}catch(e){await conn.rollback(); throw e}finally{conn.release()}
}
