CREATE TABLE IF NOT EXISTS lesson_assignment_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_id BIGINT UNSIGNED NOT NULL,
  submission_url VARCHAR(500) NOT NULL,
  notes TEXT NULL,
  status ENUM('submitted','reviewed','accepted','rejected') NOT NULL DEFAULT 'submitted',
  submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME NULL,
  teacher_notes TEXT NULL,
  UNIQUE KEY unique_assignment_student (assignment_id, student_id),
  KEY idx_assignment_submissions_assignment (assignment_id),
  KEY idx_assignment_submissions_student (student_id)
);
