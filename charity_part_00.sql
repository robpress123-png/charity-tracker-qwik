-- Insert top 500 charities from IRS data
-- These are public charities available to all users

-- First, get the test user ID
INSERT OR IGNORE INTO users (email, password, name, plan) VALUES ('test@example.com', 'password123', 'Test User', 'free');

INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'KAISER FOUNDATION HEALTH PLAN INC', '941340523', 'Health', '', 'Health organization with annual revenue of approximately $75101M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'KAISER FOUNDATION HOSPITALS', '941105628', 'Health', '', 'Health organization with annual revenue of approximately $32787M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UPMC', '208295721', 'Other', '', 'Other organization with annual revenue of approximately $24322M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MASS GENERAL BRIGHAM INCORPORATED AND AFFILIATES GROUP RTN', '900656139', 'Health', '', 'Health organization with annual revenue of approximately $23474M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'FIDELITY INVESTMENTS CHARITABLE GIFT FUND', '110303001', 'Human Services', '', 'Human Services organization with annual revenue of approximately $18985M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NATIONAL PHILANTHROPIC TR', '237825575', 'Human Services', '', 'Human Services organization with annual revenue of approximately $15875M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CLEVELAND CLINIC FOUNDATION', '912153073', 'Health', '', 'Health organization with annual revenue of approximately $15603M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MAYO CLINIC GROUP RETURN', '383952644', 'Health', '', 'Health organization with annual revenue of approximately $13970M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BATTELLE MEMORIAL INSTITUTE', '314379427', 'Research', '', 'Research organization with annual revenue of approximately $13349M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'HEALTHFIRST PHSP INC', '133783732', 'Health', '', 'Health organization with annual revenue of approximately $12085M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NEW YORK UNIVERSITY', '135562308', 'Education', '', 'Education organization with annual revenue of approximately $11618M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'DIGNITY HEALTH', '941196203', 'Health', '', 'Health organization with annual revenue of approximately $11265M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'TRUSTEES OF THE UNIVERSITY OF PENNSYLVANIA', '231352685', 'Education', '', 'Education organization with annual revenue of approximately $10747M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THRIVENT FINANCIAL FOR LUTHERANS', '390123480', 'Other', '', 'Other organization with annual revenue of approximately $10636M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'JOHNS HOPKINS UNIVERSITY', '520595110', 'Education', '', 'Education organization with annual revenue of approximately $10496M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'COREWELL HEALTH', '611740292', 'Health', '', 'Health organization with annual revenue of approximately $10374M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THE NEW YORK AND PRESBYTERIAN HOSPITAL', '133957095', 'Health', '', 'Health organization with annual revenue of approximately $10254M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NORTHWESTERN MEMORIAL HEALTHCARE', '364724966', 'Health', '', 'Health organization with annual revenue of approximately $10054M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'PROVIDENCE HEALTH & SERVICES WASHINGTON', '510216586', 'Health', '', 'Health organization with annual revenue of approximately $9778M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'DONOR ADVISED CHARITABLE GIVING', '311640316', 'Human Services', '', 'Human Services organization with annual revenue of approximately $9661M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'IHC HEALTH SERVICES INC', '942854057', 'Health', '', 'Health organization with annual revenue of approximately $9638M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THE BOARD OF TRUSTEES OF THE LELAND STANFORD JUNIOR UNIVERSITY', '941156365', 'Education', '', 'Education organization with annual revenue of approximately $9541M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BANNER HEALTH', '450233470', 'Health', '', 'Health organization with annual revenue of approximately $9479M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NYU LANGONE HOSPITALS', '133971298', 'Health', '', 'Health organization with annual revenue of approximately $9453M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THE CLEVELAND CLINIC FOUNDATION', '340714585', 'Health', '', 'Health organization with annual revenue of approximately $8958M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BON SECOURS MERCY HEALTH INC', '521301088', 'Health', '', 'Health organization with annual revenue of approximately $8710M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MEMORIAL HERMANN HEALTH SYSTEM', '741152597', 'Health', '', 'Health organization with annual revenue of approximately $8526M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CARESOURCE OHIO INC', '311143265', 'Health', '', 'Health organization with annual revenue of approximately $8525M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'STANFORD HEALTH CARE 227', '946174066', 'Health', '', 'Health organization with annual revenue of approximately $8049M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NORTHSIDE HOSPITAL INC', '581954432', 'Health', '', 'Health organization with annual revenue of approximately $7769M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'VANDERBILT UNIVERSITY MEDICAL CENTER', '352528741', 'Health', '', 'Health organization with annual revenue of approximately $7706M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
