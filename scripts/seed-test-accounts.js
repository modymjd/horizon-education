const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")

async function main() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "horizon_education",
    multipleStatements: true,
  })

  console.log("✅ Connected to database")

  await db.beginTransaction()

  try {
    await db.execute(`
      INSERT IGNORE INTO roles (name)
      VALUES ('admin'), ('teacher'), ('student')
    `)

    await db.execute(`
      INSERT IGNORE INTO education_types (name, slug)
      VALUES
        ('عام', 'general'),
        ('أزهري', 'azhari'),
        ('لغات', 'languages')
    `)

    await db.execute(`
      INSERT IGNORE INTO educational_stages (name, education_type_id, sort_order)
      SELECT 'الثانوية', id, 1
      FROM education_types
      WHERE slug = 'general'
    `)

    await db.execute(`
      INSERT IGNORE INTO grades (stage_id, name, sort_order)
      SELECT id, 'الصف الثالث الثانوي', 1
      FROM educational_stages
      WHERE name = 'الثانوية'
      LIMIT 1
    `)

    await db.execute(`
      INSERT IGNORE INTO payment_methods (name, slug, is_active)
      VALUES
        ('نقدي', 'cash', 1),
        ('محفظة إلكترونية', 'wallet', 1),
        ('تحويل بنكي', 'bank_transfer', 1)
    `)

    const [[adminRole]] = await db.execute(
      "SELECT id FROM roles WHERE name = 'admin' LIMIT 1"
    )
    const [[teacherRole]] = await db.execute(
      "SELECT id FROM roles WHERE name = 'teacher' LIMIT 1"
    )
    const [[studentRole]] = await db.execute(
      "SELECT id FROM roles WHERE name = 'student' LIMIT 1"
    )

    const [[educationType]] = await db.execute(
      "SELECT id FROM education_types WHERE slug = 'general' LIMIT 1"
    )

    const [[stage]] = await db.execute(
      "SELECT id FROM educational_stages WHERE education_type_id = ? LIMIT 1",
      [educationType.id]
    )

    const [[grade]] = await db.execute(
      "SELECT id FROM grades WHERE stage_id = ? LIMIT 1",
      [stage.id]
    )

    const adminPassword = await bcrypt.hash("Admin123456", 10)
    const teacherPassword = await bcrypt.hash("Teacher123456", 10)
    const studentPassword = await bcrypt.hash("Student123456", 10)

    await db.execute(
      `
      INSERT INTO users
        (role_id, email, phone, password_hash, full_name, status, max_devices)
      VALUES
        (?, 'admin@horizon.local', '01000000000', ?, 'مسؤول النظام', 'active', 3)
      ON DUPLICATE KEY UPDATE
        role_id = VALUES(role_id),
        password_hash = VALUES(password_hash),
        full_name = VALUES(full_name),
        status = 'active',
        max_devices = 3,
        deleted_at = NULL
      `,
      [adminRole.id, adminPassword]
    )

    await db.execute(
      `
      INSERT INTO users
        (role_id, email, phone, password_hash, full_name, status, max_devices)
      VALUES
        (?, 'teacher@horizon.local', '01000000001', ?, 'أ. أحمد محمد', 'active', 3)
      ON DUPLICATE KEY UPDATE
        role_id = VALUES(role_id),
        password_hash = VALUES(password_hash),
        full_name = VALUES(full_name),
        status = 'active',
        max_devices = 3,
        deleted_at = NULL
      `,
      [teacherRole.id, teacherPassword]
    )

    await db.execute(
      `
      INSERT INTO users
        (role_id, email, phone, password_hash, full_name, status, max_devices)
      VALUES
        (?, 'student@horizon.local', '01000000002', ?, 'محمد علي', 'active', 3)
      ON DUPLICATE KEY UPDATE
        role_id = VALUES(role_id),
        password_hash = VALUES(password_hash),
        full_name = VALUES(full_name),
        status = 'active',
        max_devices = 3,
        deleted_at = NULL
      `,
      [studentRole.id, studentPassword]
    )

    const [[teacherUser]] = await db.execute(
      "SELECT id FROM users WHERE email = 'teacher@horizon.local' LIMIT 1"
    )

    const [[studentUser]] = await db.execute(
      "SELECT id FROM users WHERE email = 'student@horizon.local' LIMIT 1"
    )

    await db.execute(
      `
      INSERT INTO teachers
        (user_id, bio, address, platform_commission_pct)
      VALUES
        (?, 'مدرس تجريبي لاختبار المنصة', 'القاهرة', 20)
      ON DUPLICATE KEY UPDATE
        bio = VALUES(bio),
        address = VALUES(address),
        platform_commission_pct = VALUES(platform_commission_pct)
      `,
      [teacherUser.id]
    )

    await db.execute(
      `
      INSERT INTO guardians
        (name, phone, alt_phone)
      VALUES
        ('ولي أمر تجريبي', '01111111111', NULL)
      ON DUPLICATE KEY UPDATE
        name = VALUES(name)
      `
    ).catch(() => {})

    const [[guardian]] = await db.execute(
      "SELECT id FROM guardians ORDER BY id ASC LIMIT 1"
    )

    await db.execute(
      `
      INSERT INTO students
        (
          user_id,
          student_code,
          national_id,
          address,
          governorate,
          stage_id,
          grade_id,
          education_type_id,
          guardian_id
        )
      VALUES
        (?, 'STU-TEST-001', NULL, 'القاهرة', 'القاهرة', ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        stage_id = VALUES(stage_id),
        grade_id = VALUES(grade_id),
        education_type_id = VALUES(education_type_id),
        guardian_id = VALUES(guardian_id)
      `,
      [
        studentUser.id,
        stage.id,
        grade.id,
        educationType.id,
        guardian?.id || null,
      ]
    )

    const [[teacher]] = await db.execute(
      "SELECT id FROM teachers WHERE user_id = ? LIMIT 1",
      [teacherUser.id]
    )

    await db.execute(
      `
      INSERT INTO courses
        (
          slug,
          title,
          short_description,
          description,
          teacher_id,
          education_type_id,
          status,
          access_duration_days,
          created_by
        )
      VALUES
        (
          'test-math-course',
          'كورس رياضيات تجريبي',
          'كورس للاختبار الداخلي',
          'هذا الكورس مخصص لاختبار صفحات الطالب والمدرس والأدمن.',
          ?,
          ?,
          'published',
          30,
          ?
        )
      ON DUPLICATE KEY UPDATE
        teacher_id = VALUES(teacher_id),
        education_type_id = VALUES(education_type_id),
        status = 'published',
        deleted_at = NULL
      `,
      [teacher.id, educationType.id, teacherUser.id]
    )

    const [[course]] = await db.execute(
      "SELECT id FROM courses WHERE slug = 'test-math-course' LIMIT 1"
    )

    await db.execute(
      `
      INSERT INTO chapters
        (course_id, title, description, sort_order, status, published_at)
      VALUES
        (?, 'الفصل الأول', 'فصل تجريبي للاختبار', 1, 'published', NOW())
      ON DUPLICATE KEY UPDATE
        status = 'published',
        deleted_at = NULL
      `,
      [course.id]
    )

    const [[chapter]] = await db.execute(
      "SELECT id FROM chapters WHERE course_id = ? ORDER BY id ASC LIMIT 1",
      [course.id]
    )

    await db.execute(
      `
      INSERT INTO lessons
        (
          chapter_id,
          title,
          description,
          price,
          sort_order,
          status,
          available_from,
          available_until
        )
      VALUES
        (
          ?,
          'الحصة الأولى التجريبية',
          'حصة مخصصة لاختبار الفيديوهات والامتحانات والواجبات.',
          100,
          1,
          'published',
          NOW(),
          DATE_ADD(NOW(), INTERVAL 30 DAY)
        )
      ON DUPLICATE KEY UPDATE
        status = 'published',
        deleted_at = NULL
      `,
      [chapter.id]
    )

    const [[lesson]] = await db.execute(
      "SELECT id FROM lessons WHERE chapter_id = ? ORDER BY id ASC LIMIT 1",
      [chapter.id]
    )

    const [[student]] = await db.execute(
      "SELECT id FROM students WHERE user_id = ? LIMIT 1",
      [studentUser.id]
    )

    await db.execute(
      `
      INSERT IGNORE INTO student_lesson_access
        (student_id, lesson_id, access_until)
      VALUES
        (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))
      `,
      [student.id, lesson.id]
    )

    await db.execute(
      `
      INSERT INTO lesson_exams
        (
          lesson_id,
          title,
          description,
          pass_score,
          is_required_to_unlock_next,
          sort_order
        )
      VALUES
        (
          ?,
          'امتحان قبل الحصة',
          'امتحان قصير يظهر للطالب قبل مشاهدة محتوى الحصة.',
          60,
          0,
          0
        )
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        description = VALUES(description),
        pass_score = VALUES(pass_score),
        is_required_to_unlock_next = VALUES(is_required_to_unlock_next),
        sort_order = VALUES(sort_order)
      `,
      [lesson.id]
    )

    const [[exam]] = await db.execute(
      "SELECT id FROM lesson_exams WHERE lesson_id = ? ORDER BY sort_order ASC, id ASC LIMIT 1",
      [lesson.id]
    )

    await db.execute(
      `
      INSERT INTO lesson_exam_questions
        (exam_id, question_text, points, sort_order)
      VALUES
        (?, 'ما الهدف من هذه الحصة؟', 1, 1)
      ON DUPLICATE KEY UPDATE
        question_text = VALUES(question_text),
        points = VALUES(points)
      `,
      [exam.id]
    )

    const [[question]] = await db.execute(
      "SELECT id FROM lesson_exam_questions WHERE exam_id = ? ORDER BY id ASC LIMIT 1",
      [exam.id]
    )

    await db.execute(
      `
      INSERT INTO lesson_exam_choices
        (question_id, choice_text, is_correct, sort_order)
      VALUES
        (?, 'اختبار المنصة وتجربة رحلة الطالب', 1, 1),
        (?, 'حذف بيانات الطلاب', 0, 2)
      ON DUPLICATE KEY UPDATE
        choice_text = VALUES(choice_text),
        is_correct = VALUES(is_correct)
      `,
      [question.id, question.id]
    )

    await db.commit()

    console.log("")
    console.log("✅ Test accounts are ready")
    console.log("")
    console.log("Admin:   admin@horizon.local   / Admin123456")
    console.log("Teacher: teacher@horizon.local / Teacher123456")
    console.log("Student: student@horizon.local / Student123456")
    console.log("")
    console.log("Test lesson id:", lesson.id)
    console.log("Test exam id:", exam.id)
    console.log("")
  } catch (error) {
    await db.rollback()
    console.error("❌ Seed failed")
    console.error(error)
    process.exitCode = 1
  } finally {
    await db.end()
  }
}

main()
