-- 007: Education type / stage / grade overhaul
-- 1) Lets a course belong to MULTIPLE education types (new junction table)
-- 2) Removes the massive duplicate rows in educational_stages / grades
--    (they were duplicated once per education type, e.g. "Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠ" x10)
-- 3) Makes stages/grades global (a "Primary / Grade 1" is the same
--    regardless of curriculum), and translates the leftover Arabic
--    labels to English to match the rest of the site
-- 4) Translates the education_types names to English for consistency

-- ---------------------------------------------------------------
-- 1) Multi-select junction table: course <-> education_types
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS course_education_types (
  course_id BIGINT UNSIGNED NOT NULL,
  education_type_id TINYINT UNSIGNED NOT NULL,
  PRIMARY KEY (course_id, education_type_id),
  KEY idx_cet_course (course_id),
  KEY idx_cet_type (education_type_id),
  CONSTRAINT fk_cet_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
  CONSTRAINT fk_cet_type FOREIGN KEY (education_type_id) REFERENCES education_types (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- backfill from the existing single education_type_id on courses
INSERT IGNORE INTO course_education_types (course_id, education_type_id)
SELECT id, education_type_id FROM courses WHERE education_type_id IS NOT NULL;

-- ---------------------------------------------------------------
-- 2) Deduplicate educational_stages (same name -> keep lowest id)
-- ---------------------------------------------------------------
CREATE TEMPORARY TABLE stage_canonical AS
SELECT s.id AS old_id, m.min_id AS canonical_id
FROM educational_stages s
JOIN (
  SELECT name, MIN(id) AS min_id
  FROM educational_stages
  GROUP BY name
) m ON m.name = s.name;

UPDATE grades g
JOIN stage_canonical c ON g.stage_id = c.old_id
SET g.stage_id = c.canonical_id
WHERE c.old_id <> c.canonical_id;

UPDATE courses co
JOIN stage_canonical c ON co.stage_id = c.old_id
SET co.stage_id = c.canonical_id
WHERE c.old_id <> c.canonical_id;

UPDATE course_stages cs
JOIN stage_canonical c ON cs.stage_id = c.old_id
SET cs.stage_id = c.canonical_id
WHERE c.old_id <> c.canonical_id;

DELETE s FROM educational_stages s
JOIN stage_canonical c ON s.id = c.old_id
WHERE c.old_id <> c.canonical_id;

DROP TEMPORARY TABLE stage_canonical;

-- stages are now global: drop the per-education-type tie
ALTER TABLE educational_stages DROP COLUMN education_type_id;

-- translate remaining stage names to English
UPDATE educational_stages SET name = 'Primary', sort_order = 1 WHERE name = 'Ø§Ø¨ØªØ¯Ø§Ø¦ÙŠ';
UPDATE educational_stages SET name = 'Preparatory', sort_order = 2 WHERE name = 'Ø¥Ø¹Ø¯Ø§Ø¯ÙŠ';
UPDATE educational_stages SET name = 'Secondary', sort_order = 3 WHERE name = 'Ø«Ø§Ù†ÙˆÙŠ';

-- ---------------------------------------------------------------
-- 3) Deduplicate grades (same stage_id + name -> keep lowest id)
--    Run twice: once before the name merge below, once after,
--    since merging "Grade 3" variants can create fresh duplicates.
-- ---------------------------------------------------------------
CREATE TEMPORARY TABLE grade_canonical_1 AS
SELECT g.id AS old_id, m.min_id AS canonical_id
FROM grades g
JOIN (
  SELECT stage_id, name, MIN(id) AS min_id
  FROM grades
  GROUP BY stage_id, name
) m ON m.stage_id = g.stage_id AND m.name = g.name;

UPDATE courses co
JOIN grade_canonical_1 c ON co.grade_id = c.old_id
SET co.grade_id = c.canonical_id
WHERE c.old_id <> c.canonical_id;

DELETE g FROM grades g
JOIN grade_canonical_1 c ON g.id = c.old_id
WHERE c.old_id <> c.canonical_id;

DROP TEMPORARY TABLE grade_canonical_1;

-- translate grade names to English (also merges "Grade 3" / "Third Secondary" variants)
UPDATE grades SET name = 'Grade 1', sort_order = 1 WHERE name = 'Ø§Ù„ØµÙ Ø§Ù„Ø£ÙˆÙ„';
UPDATE grades SET name = 'Grade 2', sort_order = 2 WHERE name = 'Ø§Ù„ØµÙ Ø§Ù„Ø«Ø§Ù†ÙŠ';
UPDATE grades SET name = 'Grade 3', sort_order = 3 WHERE name IN ('Ø§Ù„ØµÙ Ø§Ù„Ø«Ø§Ù„Ø«', 'Ø§Ù„ØµÙ Ø§Ù„Ø«Ø§Ù„Ø« Ø§Ù„Ø«Ø§Ù†ÙˆÙŠ');

CREATE TEMPORARY TABLE grade_canonical_2 AS
SELECT g.id AS old_id, m.min_id AS canonical_id
FROM grades g
JOIN (
  SELECT stage_id, name, MIN(id) AS min_id
  FROM grades
  GROUP BY stage_id, name
) m ON m.stage_id = g.stage_id AND m.name = g.name;

UPDATE courses co
JOIN grade_canonical_2 c ON co.grade_id = c.old_id
SET co.grade_id = c.canonical_id
WHERE c.old_id <> c.canonical_id;

DELETE g FROM grades g
JOIN grade_canonical_2 c ON g.id = c.old_id
WHERE c.old_id <> c.canonical_id;

DROP TEMPORARY TABLE grade_canonical_2;

-- ---------------------------------------------------------------
-- 4) Translate education_types names to English
-- ---------------------------------------------------------------
UPDATE education_types SET name = 'General / Arabic' WHERE slug = 'general';
UPDATE education_types SET name = 'Azhari' WHERE slug = 'azhari';
UPDATE education_types SET name = 'Languages' WHERE slug = 'languages';
UPDATE education_types SET name = 'International' WHERE slug = 'international';
UPDATE education_types SET name = 'Technical' WHERE slug = 'technical';

