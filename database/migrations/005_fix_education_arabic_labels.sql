SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

INSERT INTO education_types (name, slug)
VALUES
  ('عام / عربي', 'general'),
  ('أزهري', 'azhari'),
  ('لغات', 'languages'),
  ('American', 'american'),
  ('IG', 'ig'),
  ('IB', 'ib'),
  ('STEM', 'stem')
ON DUPLICATE KEY UPDATE
  name = VALUES(name);

UPDATE education_types SET name = 'عام / عربي' WHERE slug = 'general';
UPDATE education_types SET name = 'أزهري' WHERE slug = 'azhari';
UPDATE education_types SET name = 'لغات' WHERE slug = 'languages';
UPDATE education_types SET name = 'American' WHERE slug = 'american';
UPDATE education_types SET name = 'IG' WHERE slug = 'ig';
UPDATE education_types SET name = 'IB' WHERE slug = 'ib';
UPDATE education_types SET name = 'STEM' WHERE slug = 'stem';

UPDATE educational_stages
SET name = 'ابتدائي'
WHERE sort_order = 1
  AND education_type_id IN (
    SELECT id FROM education_types
    WHERE slug IN ('general','azhari','languages','american','ig','ib','stem')
  );

UPDATE educational_stages
SET name = 'إعدادي'
WHERE sort_order = 2
  AND education_type_id IN (
    SELECT id FROM education_types
    WHERE slug IN ('general','azhari','languages','american','ig','ib','stem')
  );

UPDATE educational_stages
SET name = 'ثانوي'
WHERE sort_order = 3
  AND education_type_id IN (
    SELECT id FROM education_types
    WHERE slug IN ('general','azhari','languages','american','ig','ib','stem')
  );

UPDATE grades
SET name = 'الصف الأول'
WHERE sort_order = 1
  AND stage_id IN (
    SELECT id FROM educational_stages
    WHERE education_type_id IN (
      SELECT id FROM education_types
      WHERE slug IN ('general','azhari','languages','american','ig','ib','stem')
    )
  );

UPDATE grades
SET name = 'الصف الثاني'
WHERE sort_order = 2
  AND stage_id IN (
    SELECT id FROM educational_stages
    WHERE education_type_id IN (
      SELECT id FROM education_types
      WHERE slug IN ('general','azhari','languages','american','ig','ib','stem')
    )
  );

UPDATE grades
SET name = 'الصف الثالث'
WHERE sort_order = 3
  AND stage_id IN (
    SELECT id FROM educational_stages
    WHERE education_type_id IN (
      SELECT id FROM education_types
      WHERE slug IN ('general','azhari','languages','american','ig','ib','stem')
    )
  );

UPDATE grades g
JOIN educational_stages es ON es.id = g.stage_id
SET g.name = 'الصف الثالث الثانوي'
WHERE es.name = 'ثانوي'
  AND g.sort_order = 3;
