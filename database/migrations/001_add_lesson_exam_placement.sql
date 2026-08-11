ALTER TABLE lesson_exams
ADD COLUMN placement ENUM('before_content', 'after_content') NOT NULL DEFAULT 'after_content';
