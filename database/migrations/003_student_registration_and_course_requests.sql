ALTER TABLE students
ADD COLUMN whatsapp_phone VARCHAR(20) NULL AFTER governorate;

ALTER TABLE guardians
ADD COLUMN whatsapp_phone VARCHAR(20) NULL AFTER phone;

CREATE TABLE IF NOT EXISTS student_course_requests (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  student_id BIGINT UNSIGNED NOT NULL,
  course_id BIGINT UNSIGNED NOT NULL,
  status ENUM('pending','accepted','rejected') NOT NULL DEFAULT 'pending',
  teacher_notes TEXT NULL,
  requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME NULL,
  reviewed_by_teacher_id BIGINT UNSIGNED NULL,
  UNIQUE KEY unique_student_course_request (student_id, course_id),
  KEY idx_student_course_requests_student (student_id),
  KEY idx_student_course_requests_course (course_id),
  KEY idx_student_course_requests_status (status)
);
