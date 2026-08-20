ALTER TABLE lesson_exam_questions
MODIFY question_text TEXT NULL;

ALTER TABLE lesson_exam_questions
ADD COLUMN question_image_url VARCHAR(500) NULL AFTER question_text;
