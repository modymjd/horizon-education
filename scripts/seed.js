const mysql = require("mysql2/promise")
const bcrypt = require("bcryptjs")

async function main() {
  const db = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "horizon_education",
    multipleStatements: true,
  })

  console.log("Connected to MySQL")

  await db.query(`
    INSERT IGNORE INTO roles (name) VALUES
    ('admin'),
    ('teacher'),
    ('student');

    INSERT IGNORE INTO education_types (name, slug) VALUES
    ('عام', 'general'),
    ('أزهري', 'azhari'),
    ('لغات', 'languages'),
    ('دولي', 'international'),
    ('فني', 'technical');

    INSERT IGNORE INTO educational_stages (name, education_type_id, sort_order)
    SELECT 'المرحلة الثانوية', id, 1 FROM education_types WHERE slug = 'general';

    INSERT IGNORE INTO grades (stage_id, name, sort_order)
    SELECT id, 'الصف الأول الثانوي', 1 FROM educational_stages WHERE name = 'المرحلة الثانوية' LIMIT 1;

    INSERT IGNORE INTO payment_methods (name, slug) VALUES
    ('نقدي', 'cash'),
    ('محفظة إلكترونية', 'wallet'),
    ('تحويل بنكي', 'bank_transfer'),
    ('بطاقة دفع', 'card'),
    ('وسيلة أخرى', 'other');
  `)

  const adminHash = await bcrypt.hash("Admin123456", 10)
  const teacherHash = await bcrypt.hash("Teacher123456", 10)
  const studentHash = await bcrypt.hash("Student123456", 10)

  await db.execute(
    `
    INSERT IGNORE INTO users 
      (role_id, email, phone, password_hash, full_name, status)
    SELECT id, ?, ?, ?, ?, 'active'
    FROM roles
    WHERE name = 'admin'
    `,
    ["admin@horizon.test", "01000000001", adminHash, "مدير النظام"]
  )

  await db.execute(
    `
    INSERT IGNORE INTO users 
      (role_id, email, phone, password_hash, full_name, status)
    SELECT id, ?, ?, ?, ?, 'active'
    FROM roles
    WHERE name = 'teacher'
    `,
    ["teacher@horizon.test", "01000000002", teacherHash, "د. أحمد درويش"]
  )

  await db.execute(
    `
    INSERT IGNORE INTO users 
      (role_id, email, phone, password_hash, full_name, status)
    SELECT id, ?, ?, ?, ?, 'active'
    FROM roles
    WHERE name = 'student'
    `,
    ["student@horizon.test", "01000000003", studentHash, "محمد محمود"]
  )

  await db.execute(
    `
    INSERT IGNORE INTO teachers 
      (user_id, bio, address, platform_commission_pct)
    SELECT id, 'مدرس رياضيات بخبرة 10 سنوات', 'القاهرة', 20.00
    FROM users
    WHERE email = 'teacher@horizon.test'
    `
  )

  await db.execute(
    `
    INSERT IGNORE INTO guardians 
      (name, phone, alt_phone)
    VALUES
      ('ولي أمر الطالب', '01000000004', '01000000005')
    `
  )

  await db.execute(
    `
    INSERT IGNORE INTO students 
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
    SELECT 
      u.id,
      'STU-0001',
      '30001010101010',
      'القاهرة',
      'القاهرة',
      (SELECT id FROM educational_stages LIMIT 1),
      (SELECT id FROM grades LIMIT 1),
      (SELECT id FROM education_types WHERE slug = 'general' LIMIT 1),
      (SELECT id FROM guardians LIMIT 1)
    FROM users u
    WHERE u.email = 'student@horizon.test'
    `
  )

  await db.execute(
    `
    INSERT IGNORE INTO courses 
      (
        slug,
        title,
        short_description,
        description,
        teacher_id,
        education_type_id,
        status,
        starts_at,
        ends_at,
        access_duration_days,
        created_by
      )
    SELECT
      'math-grade-one',
      'الرياضيات للصف الأول الثانوي',
      'كورس تأسيسي مبسط في الرياضيات',
      'شرح منظم للحصص مع واجبات واختبارات ومتابعة نتائج.',
      t.id,
      (SELECT id FROM education_types WHERE slug = 'general' LIMIT 1),
      'published',
      CURDATE(),
      DATE_ADD(CURDATE(), INTERVAL 90 DAY),
      30,
      (SELECT id FROM users WHERE email = 'admin@horizon.test' LIMIT 1)
    FROM teachers t
    JOIN users u ON u.id = t.user_id
    WHERE u.email = 'teacher@horizon.test'
    `
  )

  await db.execute(
    `
    INSERT IGNORE INTO chapters
      (course_id, title, description, sort_order, status, published_at)
    SELECT
      id,
      'الجبر — البداية',
      'مقدمة في أساسيات الجبر',
      1,
      'published',
      NOW()
    FROM courses
    WHERE slug = 'math-grade-one'
    `
  )

  await db.execute(
    `
    INSERT IGNORE INTO lessons
      (chapter_id, title, description, price, sort_order, status, available_from, available_until)
    SELECT
      id,
      'الحصة الأولى: المتغيرات والمعادلات',
      'شرح مبسط للمتغيرات والمعادلات مع أمثلة محلولة.',
      75.00,
      1,
      'published',
      NOW(),
      DATE_ADD(NOW(), INTERVAL 30 DAY)
    FROM chapters
    WHERE title = 'الجبر — البداية'
    LIMIT 1
    `
  )

  console.log("Seed completed successfully")
  console.log("")
  console.log("Admin:")
  console.log("admin@horizon.test / Admin123456")
  console.log("")
  console.log("Teacher:")
  console.log("teacher@horizon.test / Teacher123456")
  console.log("")
  console.log("Student:")
  console.log("student@horizon.test / Student123456")

  await db.end()
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})