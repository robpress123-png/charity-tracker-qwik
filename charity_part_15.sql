INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'INSPIRA MEDICAL CENTERS INC', '210634484', 'Health', '', 'Health organization with annual revenue of approximately $1132M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UNIVERSITY COMMUNITY HOSPITAL INC', '591113901', 'Health', '', 'Health organization with annual revenue of approximately $1132M'
FROM users WHERE email = 'test@example.com';

-- Charities successfully loaded
