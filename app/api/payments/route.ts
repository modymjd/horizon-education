import { NextResponse } from 'next/server'
import { paymentSchema } from '@/lib/validators'
import { query, pool } from '@/lib/db'
export async function POST(req:Request){
 const body=paymentSchema.parse(await req.json()); const adminId=1
 const lesson=(await query<any>('SELECT l.price,t.platform_commission_pct FROM lessons l JOIN chapters ch ON ch.id=l.chapter_id JOIN courses c ON c.id=ch.course_id JOIN teachers t ON t.id=c.teacher_id WHERE l.id=?',[body.lessonId]))[0]
 if(!lesson) return NextResponse.json({message:'الحصة غير موجودة'},{status:404})
 const commission=Number(lesson.platform_commission_pct); const platform=body.amountPaid*commission/100; const teacher=body.amountPaid-platform; const invoice='HZN-'+Date.now()
 await pool.execute('INSERT INTO payments(invoice_number,student_id,lesson_id,amount_paid,lesson_price_at_payment,platform_amount,teacher_amount,commission_pct,payment_method_id,paid_at,transaction_ref,notes,created_by) VALUES(?,?,?,?,?,?,?,?,?,NOW(),?,?,?)',[invoice,body.studentId,body.lessonId,body.amountPaid,lesson.price,platform,teacher,commission,body.paymentMethodId,body.transactionRef||null,body.notes||null,adminId])
 return NextResponse.json({invoiceNumber:invoice,platformAmount:platform,teacherAmount:teacher})
}
