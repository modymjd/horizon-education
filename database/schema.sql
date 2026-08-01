-- Horizon Education Database Schema
CREATE DATABASE IF NOT EXISTS horizon_education
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE horizon_education;

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS student_lesson_access;
DROP TABLE IF EXISTS access_codes;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS payment_methods;
DROP TABLE IF EXISTS lessons;
DROP TABLE IF EXISTS chapters;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS guardians;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS grades;
DROP TABLE IF EXISTS educational_stages;
DROP TABLE IF EXISTS education_types;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS roles;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE roles (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name ENUM('admin','teacher','student') NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE education_types (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE educational_stages (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  education_type_id INT UNSIGNED NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_stages_type FOREIGN KEY (education_type_id) REFERENCES education_types(id) ON DELETE CASCADE,
  UNIQUE KEY unique_stage_type (name, education_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE grades (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  stage_id INT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_grades_stage FOREIGN KEY (stage_id) REFERENCES educational_stages(id) ON DELETE CASCADE,
  UNIQUE KEY unique_grade_stage (stage_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  role_id INT UNSIGNED NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(30) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(190) NOT NULL,
  avatar_url VARCHAR(500) NULL,
  status ENUM('active','suspended','banned') NOT NULL DEFAULT 'active',
  max_devices INT NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  deleted_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE teachers (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  bio TEXT NULL,
  address VARCHAR(255) NULL,
  platform_commission_pct DECIMAL(5,2) NOT NULL DEFAULT 20.00,
  total_earnings DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_teachers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE guardians (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(190) NOT NULL,
  phone VARCHAR(30) NOT NULL,
  alt_phone VARCHAR(30) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE students (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  student_code VARCHAR(50) NOT NULL UNIQUE,
  national_id VARCHAR(30) NULL,
  address VARCHAR(255) NULL,
  governorate VARCHAR(100) NULL,
  stage_id INT UNSIGNED NULL,
  grade_id INT UNSIGNED NULL,
  education_type_id INT UNSIGNED NULL,
  guardian_id INT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_students_stage FOREIGN KEY (stage_id) REFERENCES educational_stages(id) ON DELETE SET NULL,
  CONSTRAINT fk_students_grade FOREIGN KEY (grade_id) REFERENCES grades(id) ON DELETE SET NULL,
  CONSTRAINT fk_students_education_type FOREIGN KEY (education_type_id) REFERENCES education_types(id) ON DELETE SET NULL,
  CONSTRAINT fk_students_guardian FOREIGN KEY (guardian_id) REFERENCES guardians(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE courses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  title VARCHAR(190) NOT NULL,
  short_description VARCHAR(255) NULL,
  description TEXT NULL,
  teacher_id INT UNSIGNED NOT NULL,
  education_type_id INT UNSIGNED NULL,
  status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  starts_at DATE NULL,
  ends_at DATE NULL,
  access_duration_days INT DEFAULT 30,
  created_by INT UNSIGNED NULL,
  deleted_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_courses_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id),
  CONSTRAINT fk_courses_education_type FOREIGN KEY (education_type_id) REFERENCES education_types(id) ON DELETE SET NULL,
  CONSTRAINT fk_courses_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE chapters (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  course_id INT UNSIGNED NOT NULL,
  title VARCHAR(190) NOT NULL,
  description TEXT NULL,
  sort_order INT DEFAULT 0,
  status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  published_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chapters_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE lessons (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  chapter_id INT UNSIGNED NOT NULL,
  title VARCHAR(190) NOT NULL,
  description TEXT NULL,
  video_url VARCHAR(500) NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  sort_order INT DEFAULT 0,
  status ENUM('draft','published','archived') NOT NULL DEFAULT 'draft',
  available_from DATETIME NULL,
  available_until DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_lessons_chapter FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payment_methods (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  invoice_number VARCHAR(80) NOT NULL UNIQUE,
  student_id INT UNSIGNED NOT NULL,
  lesson_id INT UNSIGNED NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  lesson_price_at_payment DECIMAL(10,2) NOT NULL,
  platform_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  teacher_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  commission_pct DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  payment_method_id INT UNSIGNED NOT NULL,
  transaction_ref VARCHAR(190) NULL,
  status ENUM('pending','completed','refunded','cancelled') NOT NULL DEFAULT 'completed',
  paid_at DATETIME NOT NULL,
  notes TEXT NULL,
  created_by INT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_student FOREIGN KEY (student_id) REFERENCES students(id),
  CONSTRAINT fk_payments_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id),
  CONSTRAINT fk_payments_method FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id),
  CONSTRAINT fk_payments_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE access_codes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lesson_id INT UNSIGNED NOT NULL,
  code_hash VARCHAR(255) NOT NULL UNIQUE,
  code_prefix VARCHAR(20) NULL,
  status ENUM('new','used','cancelled') NOT NULL DEFAULT 'new',
  expires_at DATETIME NULL,
  assigned_student_id INT UNSIGNED NULL,
  single_use TINYINT(1) NOT NULL DEFAULT 1,
  used_by_student_id INT UNSIGNED NULL,
  used_at DATETIME NULL,
  used_device_info JSON NULL,
  created_by_teacher_id INT UNSIGNED NULL,
  batch_id VARCHAR(80) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_access_codes_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  CONSTRAINT fk_access_codes_assigned_student FOREIGN KEY (assigned_student_id) REFERENCES students(id) ON DELETE SET NULL,
  CONSTRAINT fk_access_codes_used_student FOREIGN KEY (used_by_student_id) REFERENCES students(id) ON DELETE SET NULL,
  CONSTRAINT fk_access_codes_teacher FOREIGN KEY (created_by_teacher_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE student_lesson_access (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id INT UNSIGNED NOT NULL,
  lesson_id INT UNSIGNED NOT NULL,
  access_code_id INT UNSIGNED NULL,
  payment_id INT UNSIGNED NULL,
  access_until DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sla_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  CONSTRAINT fk_sla_lesson FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
  CONSTRAINT fk_sla_access_code FOREIGN KEY (access_code_id) REFERENCES access_codes(id) ON DELETE SET NULL,
  CONSTRAINT fk_sla_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
  UNIQUE KEY unique_student_lesson (student_id, lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
