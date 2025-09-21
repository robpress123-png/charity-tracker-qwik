-- Insert top 500 501(c)(3) charities from IRS data
-- These are public 501(c)(3) charities available to all users

-- First, get the test user ID
INSERT OR IGNORE INTO users (email, password, name, plan) VALUES ('test@example.com', 'password123', 'Test User', 'free');

INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'KAISER FOUNDATION HEALTH PLAN INC', '941340523', 'Health', '', 'Health organization with annual revenue of $75.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'KAISER FOUNDATION HOSPITALS', '941105628', 'Health', '', 'Health organization with annual revenue of $32.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UPMC', '208295721', 'Other', '', 'Other organization with annual revenue of $24.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MASS GENERAL BRIGHAM INCORPORATED AND AFFILIATES GROUP RTN', '900656139', 'Health', '', 'Health organization with annual revenue of $23.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'FIDELITY INVESTMENTS CHARITABLE GIFT FUND', '110303001', 'Human Services', '', 'Human Services organization with annual revenue of $19.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NATIONAL PHILANTHROPIC TR', '237825575', 'Human Services', '', 'Human Services organization with annual revenue of $15.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CLEVELAND CLINIC FOUNDATION', '912153073', 'Health', '', 'Health organization with annual revenue of $15.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MAYO CLINIC GROUP RETURN', '383952644', 'Health', '', 'Health organization with annual revenue of $14.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BATTELLE MEMORIAL INSTITUTE', '314379427', 'Research', '', 'Research organization with annual revenue of $13.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'HEALTHFIRST PHSP INC', '133783732', 'Health', '', 'Health organization with annual revenue of $12.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NEW YORK UNIVERSITY', '135562308', 'Education', '', 'Education organization with annual revenue of $11.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'DIGNITY HEALTH', '941196203', 'Health', '', 'Health organization with annual revenue of $11.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'TRUSTEES OF THE UNIVERSITY OF PENNSYLVANIA', '231352685', 'Education', '', 'Education organization with annual revenue of $10.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'JOHNS HOPKINS UNIVERSITY', '520595110', 'Education', '', 'Education organization with annual revenue of $10.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'COREWELL HEALTH', '611740292', 'Health', '', 'Health organization with annual revenue of $10.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THE NEW YORK AND PRESBYTERIAN HOSPITAL', '133957095', 'Health', '', 'Health organization with annual revenue of $10.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NORTHWESTERN MEMORIAL HEALTHCARE', '364724966', 'Health', '', 'Health organization with annual revenue of $10.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'PROVIDENCE HEALTH & SERVICES WASHINGTON', '510216586', 'Health', '', 'Health organization with annual revenue of $9.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'DONOR ADVISED CHARITABLE GIVING', '311640316', 'Human Services', '', 'Human Services organization with annual revenue of $9.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'IHC HEALTH SERVICES INC', '942854057', 'Health', '', 'Health organization with annual revenue of $9.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THE BOARD OF TRUSTEES OF THE LELAND STANFORD JUNIOR UNIVERSITY', '941156365', 'Education', '', 'Education organization with annual revenue of $9.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BANNER HEALTH', '450233470', 'Health', '', 'Health organization with annual revenue of $9.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NYU LANGONE HOSPITALS', '133971298', 'Health', '', 'Health organization with annual revenue of $9.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THE CLEVELAND CLINIC FOUNDATION', '340714585', 'Health', '', 'Health organization with annual revenue of $9.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BON SECOURS MERCY HEALTH INC', '521301088', 'Health', '', 'Health organization with annual revenue of $8.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MEMORIAL HERMANN HEALTH SYSTEM', '741152597', 'Health', '', 'Health organization with annual revenue of $8.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CARESOURCE OHIO INC', '311143265', 'Health', '', 'Health organization with annual revenue of $8.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'STANFORD HEALTH CARE 227', '946174066', 'Health', '', 'Health organization with annual revenue of $8.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NORTHSIDE HOSPITAL INC', '581954432', 'Health', '', 'Health organization with annual revenue of $7.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'VANDERBILT UNIVERSITY MEDICAL CENTER', '352528741', 'Health', '', 'Health organization with annual revenue of $7.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'PRESIDENT AND FELLOWS OF HARVARD COLLEGE', '042103580', 'Education', '', 'Education organization with annual revenue of $7.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'HACKENSACK MERIDIAN HEALTH INC', '010649794', 'Health', '', 'Health organization with annual revenue of $7.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MEMORIAL SLOAN-KETTERING CANCER CENTER', '912154267', 'Health', '', 'Health organization with annual revenue of $7.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MAYO CLINIC', '416011702', 'Health', '', 'Health organization with annual revenue of $7.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'TRUSTEES OF COLUMBIA UNIVERSITY', '135598093', 'Education', '', 'Education organization with annual revenue of $7.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'EMORY UNIVERSITY', '580566256', 'Education', '', 'Education organization with annual revenue of $7.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'RWJ BARNABAS HEALTH INC', '851296795', 'Health', '', 'Health organization with annual revenue of $7.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ADVENTIST HEALTH SYSTEM SUNBELT INC', '591479658', 'Health', '', 'Health organization with annual revenue of $7.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ADVOCATE HEALTH AND HOSPITALS CORPORATION', '362169147', 'Health', '', 'Health organization with annual revenue of $6.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'YALE UNIVERSITY', '060646973', 'Education', '', 'Education organization with annual revenue of $6.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'AURORA HEALTH CARE INC', '611649250', 'Other', '', 'Other organization with annual revenue of $6.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BJC HEALTH SYSTEM', '753052953', 'Health', '', 'Health organization with annual revenue of $6.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CORNELL UNIVERSITY', '150532082', 'Education', '', 'Education organization with annual revenue of $6.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UNIVERSITY OF MIAMI', '590624458', 'Education', '', 'Education organization with annual revenue of $6.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'VANGUARD CHARITABLE ENDOWMENT PROGRAM', '232888152', 'Human Services', '', 'Human Services organization with annual revenue of $6.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'GLOBAL FUND TO FIGHT AIDS TUBERCULOSIS AND MALARIA', '980380092', 'Health', '', 'Health organization with annual revenue of $6.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UCARE MINNESOTA', '363573805', 'Health', '', 'Health organization with annual revenue of $6.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UNIVERSITY OF ROCHESTER', '160743209', 'Education', '', 'Education organization with annual revenue of $5.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'KAISER FOUNDATION HEALTH PLAN OF THE MID ATLANTIC STATES INC', '520954463', 'Health', '', 'Health organization with annual revenue of $5.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MASSACHUSETTS INSTITUTE OF TECHNOLOGY', '042103594', 'Education', '', 'Education organization with annual revenue of $5.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'DUKE UNIVERSITY HEALTH SYSTEM INC', '562070036', 'Health', '', 'Health organization with annual revenue of $5.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'INDIANA UNIVERSITY HEALTH INC', '351955872', 'Health', '', 'Health organization with annual revenue of $5.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SANFORD', '453791176', 'Other', '', 'Other organization with annual revenue of $5.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'INOVA HEALTH CARE SERVICES', '540620889', 'Health', '', 'Health organization with annual revenue of $5.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'HIGHMARK HEALTH', '821406555', 'Other', '', 'Other organization with annual revenue of $5.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UNIVERSITY OF SOUTHERN CALIFORNIA', '951642394', 'Education', '', 'Education organization with annual revenue of $5.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'PROVIDENCE HEALTH & SERVICES OREGON', '510216587', 'Health', '', 'Health organization with annual revenue of $5.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ALLINA HEALTH SYSTEM', '363261413', 'Health', '', 'Health organization with annual revenue of $5.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'OCHSNER CLINIC FOUNDATION', '720502505', 'Health', '', 'Health organization with annual revenue of $5.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UNIVERSITY HOSPITALS HEALTH SYSTEM INC', '900059117', 'Health', '', 'Health organization with annual revenue of $5.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CEDARS-SINAI MEDICAL CENTER', '951644600', 'Health', '', 'Health organization with annual revenue of $5.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SENTARA HEALTH PLANS', '541283337', 'Health', '', 'Health organization with annual revenue of $5.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'METROPLUS HEALTH PLAN INC', '134115686', 'Health', '', 'Health organization with annual revenue of $5.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'WASHINGTON UNIVERSITY', '430653611', 'Education', '', 'Education organization with annual revenue of $5.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BOSTON MEDICAL CENTER HEALTH PLAN INC', '043373331', 'Health', '', 'Health organization with annual revenue of $5.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SUTTER BAY HOSPITALS', '940562680', 'Health', '', 'Health organization with annual revenue of $5.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'KAISER FOUNDATION HEALTH PLAN OF THE NORTHWEST', '930798039', 'Health', '', 'Health organization with annual revenue of $5.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'OHIOHEALTH CORPORATION GRANT RIVERSIDE DOCTORS DUBLIN MET', '314394942', 'Health', '', 'Health organization with annual revenue of $5.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MONTEFIORE MEDICAL CENTER', '131740114', 'Health', '', 'Health organization with annual revenue of $5.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'FEEDING AMERICA', '363673599', 'Human Services', '', 'Human Services organization with annual revenue of $5.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ECMC GROUP INC', '411991995', 'Education', '', 'Education organization with annual revenue of $5.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SCAN HEALTH PLAN', '953858259', 'Health', '', 'Health organization with annual revenue of $4.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UNIVERSITY OF CHICAGO', '362177139', 'Education', '', 'Education organization with annual revenue of $4.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SCRIPPS HEALTH', '951684089', 'Health', '', 'Health organization with annual revenue of $4.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ORLANDO HEALTH INC', '591726273', 'Health', '', 'Health organization with annual revenue of $4.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ADVANCED TECHNOLOGY INTERNATIONAL', '571067151', 'Research', '', 'Research organization with annual revenue of $4.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MERCY CARE', '860527381', 'Other', '', 'Other organization with annual revenue of $4.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'FAIRVIEW HEALTH SERVICES', '410991680', 'Health', '', 'Health organization with annual revenue of $4.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SUTTER VALLEY HOSPITALS', '941156621', 'Health', '', 'Health organization with annual revenue of $4.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'YALE NEW HAVEN HOSPITAL', '060646652', 'Health', '', 'Health organization with annual revenue of $4.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MULTICARE HEALTH SYSTEM', '911352172', 'Health', '', 'Health organization with annual revenue of $4.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'HENRY FORD HEALTH SYSTEM', '381357020', 'Health', '', 'Health organization with annual revenue of $4.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'DUKE UNIVERSITY', '560532129', 'Education', '', 'Education organization with annual revenue of $4.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BAPTIST HEALTHCARE SYSTEM INC', '610444707', 'Health', '', 'Health organization with annual revenue of $4.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'KAISER FOUNDATION HEALTH PLAN OF COLORADO', '840591617', 'Health', '', 'Health organization with annual revenue of $4.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ATLANTIC HEALTH SYSTEM INC', '651301877', 'Other', '', 'Other organization with annual revenue of $4.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'KAISER FOUNDATION HEALTH PLAN OF WASHINGTON', '910511770', 'Health', '', 'Health organization with annual revenue of $4.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NORTHWESTERN UNIVERSITY', '362167817', 'Human Services', '', 'Human Services organization with annual revenue of $4.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CALIFORNIA INSTITUTE OF TECHNOLOGY', '951643307', 'Education', '', 'Education organization with annual revenue of $4.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ICAHN SCHOOL OF MEDICINE AT MOUNT SINAI', '136171197', 'Education', '', 'Education organization with annual revenue of $4.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UMASS MEMORIAL HEALTH CARE INC', '912155626', 'Health', '', 'Health organization with annual revenue of $4.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'LONG ISLAND JEWISH MEDICAL CENTER', '112241326', 'Health', '', 'Health organization with annual revenue of $4.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'A MAINEHEALTH HCSR', '010238552', 'Health', '', 'Health organization with annual revenue of $4.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'EMORY', '900790361', 'Education', '', 'Education organization with annual revenue of $4.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NOVANT HEALTH INC', '561376950', 'Health', '', 'Health organization with annual revenue of $4.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SENTARA HOSPITALS', '541547408', 'Health', '', 'Health organization with annual revenue of $4.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MOUNT SINAI HOSPITAL', '131624096', 'Health', '', 'Health organization with annual revenue of $3.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'METHODIST HOSPITAL GROUP', '352410801', 'Other', '', 'Other organization with annual revenue of $3.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'OSF HEALTHCARE SYSTEM', '370813229', 'Health', '', 'Health organization with annual revenue of $3.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NATIONWIDE CHILDRENS HOSPITAL', '010782751', 'Other', '', 'Other organization with annual revenue of $3.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'DIGNITY COMMUNITY CARE', '815009488', 'Health', '', 'Health organization with annual revenue of $3.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THE CHILDRENS HOSPITAL OF PHILADELPHIA', '231352166', 'Health', '', 'Health organization with annual revenue of $3.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'TEXAS CHILDRENS HOSPITAL', '741100555', 'Health', '', 'Health organization with annual revenue of $3.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'AMERICAN NATIONAL RED CROSS', '530196605', 'Human Services', '', 'Human Services organization with annual revenue of $3.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NORTH SHORE UNIVERSITY HOSPITAL', '111562701', 'Health', '', 'Health organization with annual revenue of $3.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CHANCELLOR MASTERS & SCHOLARS OF THE UNIVERSITY OF OXFORD', '986001062', 'Other', '', 'Other organization with annual revenue of $3.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'PEACEHEALTH', '910939479', 'Health', '', 'Health organization with annual revenue of $3.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'FRANCISCAN ALLIANCE INC', '351330472', 'Health', '', 'Health organization with annual revenue of $3.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SUTTER BAY MEDICAL FOUNDATION', '941156581', 'Health', '', 'Health organization with annual revenue of $3.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'DANA-FARBER CANCER INSTITUTE', '042263040', 'Health', '', 'Health organization with annual revenue of $3.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'COMMONSPIRIT HEALTH', '470617373', 'Health', '', 'Health organization with annual revenue of $3.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CHILDRENS HOSPITAL MEDICAL CENTER', '310833936', 'Health', '', 'Health organization with annual revenue of $3.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UNIVERSITY OF PITTSBURGH', '250965591', 'Education', '', 'Education organization with annual revenue of $3.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'GOVERNING COUNCIL OF THE UNIVERSITY OF TORONTO', '986001141', 'Other', '', 'Other organization with annual revenue of $3.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THE JOHNS HOPKINS HOSPITAL', '520591656', 'Health', '', 'Health organization with annual revenue of $3.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'HEALTH SHARE OF OREGON', '455093195', 'Health', '', 'Health organization with annual revenue of $3.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UNIVERSITY OF NOTRE DAME DU LAC', '350868188', 'Education', '', 'Education organization with annual revenue of $3.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ASCENSION SETON', '741109643', 'Other', '', 'Other organization with annual revenue of $3.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CATHOLIC HEALTH INITIATIVES COLORADO', '840405257', 'Health', '', 'Health organization with annual revenue of $3.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'TRINITY HEALTH-MICHIGAN', '382113393', 'Health', '', 'Health organization with annual revenue of $3.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THE METHODIST HOSPITAL', '741180155', 'Health', '', 'Health organization with annual revenue of $3.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'TRUSTEES OF BOSTON UNIVERSITY', '042103547', 'Other', '', 'Other organization with annual revenue of $3.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'PRISMA HEALTH - UPSTATE', '811723202', 'Health', '', 'Health organization with annual revenue of $3.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'LEHIGH VALLEY HOSPITAL', '231689692', 'Health', '', 'Health organization with annual revenue of $3.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UNIVERSITY OF CHICAGO MEDICAL CENTER', '363488183', 'Health', '', 'Health organization with annual revenue of $3.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'GS DONOR ADVISED PHILANTHROPY FUND FOR WEALTH MANAGEMENT INC', '311774905', 'Human Services', '', 'Human Services organization with annual revenue of $3.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CHILDRENS HOSPITAL CORPORATION', '042774441', 'Health', '', 'Health organization with annual revenue of $3.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'FLORIDA HEALTH SCIENCES CENTER INC', '593458145', 'Health', '', 'Health organization with annual revenue of $3.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BETH ISRAEL DEACONESS MEDICAL CENTER INC', '042103881', 'Health', '', 'Health organization with annual revenue of $3.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'PRINCETON UNIVERSITY', '210634501', 'Education', '', 'Education organization with annual revenue of $3.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'TEXAS CHILDRENS HEALTH PLAN INC', '760486264', 'Health', '', 'Health organization with annual revenue of $3.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CHANCELLOR MASTERS AND SCHOLARS OF THE UNIVERSITY OF CAMBRIDGE', '131599108', 'Other', '', 'Other organization with annual revenue of $3.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'A D F COMMUNITY OUTREACH FOUNDATION INC', '262437544', 'Human Services', '', 'Human Services organization with annual revenue of $3.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'GOOD360', '541282616', 'International', '', 'International organization with annual revenue of $3.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CHRISTIANA CARE HEALTH SERVICES INC', '510103684', 'Health', '', 'Health organization with annual revenue of $3.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MEMORIAL HEALTH SERVICES GROUP RETURN', '352391110', 'Health', '', 'Health organization with annual revenue of $3.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ALBANY MEDICAL CENTER GROUP ORGANIZATION', '473869194', 'Other', '', 'Other organization with annual revenue of $3.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SWEDISH HEALTH SERVICES', '910433740', 'Health', '', 'Health organization with annual revenue of $3.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'RUSH UNIVERSITY MEDICAL CENTER', '362174823', 'Health', '', 'Health organization with annual revenue of $3.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NORTON HOSPITALS INC', '610703799', 'Health', '', 'Health organization with annual revenue of $3.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NORTHEASTERN UNIVERSITY', '041679980', 'Education', '', 'Education organization with annual revenue of $3.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NORTH CAROLINA BAPTIST HOSPITAL', '560552787', 'Health', '', 'Health organization with annual revenue of $3.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CITY OF HOPE NATIONAL MEDICAL CENTER', '951683875', 'Health', '', 'Health organization with annual revenue of $2.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'HONORHEALTH', '860181654', 'Health', '', 'Health organization with annual revenue of $2.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'AMERICAN LEBANESE SYRIAN ASSOC CHAR INC', '351044585', 'Religion', '', 'Religion organization with annual revenue of $2.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'INTERNATIONAL COMMITTEE OF THE RED CROSS', '986001029', 'International', '', 'International organization with annual revenue of $2.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'TRINITY HEALTH CORPORATION', '351443425', 'Health', '', 'Health organization with annual revenue of $2.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MILTONS S HERSHEY MEDICAL CENTER', '251854772', 'Health', '', 'Health organization with annual revenue of $2.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'LUCILE SALTER PACKARD CHILDRENS HOSPITAL AT STANFORD', '770003859', 'Health', '', 'Health organization with annual revenue of $2.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'FROEDTERT THEDACARE HEALTH INC', '392014409', 'Health', '', 'Health organization with annual revenue of $2.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BAYLOR COLLEGE OF MEDICINE', '741613878', 'Education', '', 'Education organization with annual revenue of $2.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ST LUKES REGIONAL MEDICAL CENTER', '820161600', 'Health', '', 'Health organization with annual revenue of $2.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'FRESNO COMMUNITY HOSPITAL AND MEDICAL CENTER', '941156276', 'Health', '', 'Health organization with annual revenue of $2.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UNIVERSITY OF BRITISH COLUMBIA', '986001255', 'Education', '', 'Education organization with annual revenue of $2.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BOY SCOUTS OF AMERICA', '221576300', 'Human Services', '', 'Human Services organization with annual revenue of $2.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'FROEDTERT MEMORIAL LUTHERAN HOSPITAL INC', '396105970', 'Health', '', 'Health organization with annual revenue of $2.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'HARTFORD HOSPITAL', '060646668', 'Health', '', 'Health organization with annual revenue of $2.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UNIVERSITY HEALTH NETWORK', '986000971', 'Other', '', 'Other organization with annual revenue of $2.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SHANDS TEACHING HOSPITAL AND CLINICS INC', '591943502', 'Health', '', 'Health organization with annual revenue of $2.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BAPTIST HOSPITAL OF MIAMI INC', '590910342', 'Health', '', 'Health organization with annual revenue of $2.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SOUTHERN BAPTIST HOSPITAL OF FLORIDA INC', '590747311', 'Health', '', 'Health organization with annual revenue of $2.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THOMAS JEFFERSON UNIVERSITY HOSPITAL', '232829095', 'Health', '', 'Health organization with annual revenue of $2.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UC HEALTHCARE SYSTEM', '273850988', 'Health', '', 'Health organization with annual revenue of $2.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'GAVI ALLIANCE', '980593375', 'International', '', 'International organization with annual revenue of $2.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BOSTON MEDICAL CENTER CORPORATION', '043314093', 'Health', '', 'Health organization with annual revenue of $2.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'VANDERBILT UNIVERSITY', '620476822', 'Education', '', 'Education organization with annual revenue of $2.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'COMMONWEALTH CARE ALLIANCE INC', '043756900', 'Health', '', 'Health organization with annual revenue of $2.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CHILDRENS HEALTHCARE OF ATLANTA INC', '900779996', 'Health', '', 'Health organization with annual revenue of $2.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'WELLSTAR HEALTH SYSTEM INC', '581649541', 'Health', '', 'Health organization with annual revenue of $2.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CARESOURCE', '311703368', 'Health', '', 'Health organization with annual revenue of $2.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CAREOREGON INC', '930933975', 'Health', '', 'Health organization with annual revenue of $2.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NORTHWELL HEALTHCARE INC', '112965586', 'Health', '', 'Health organization with annual revenue of $2.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THE CHICAGO COMMUNITY TRUST', '362167000', 'Human Services', '', 'Human Services organization with annual revenue of $2.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NATIONAL CHRISTIAN CHARITABLE FOUNDATION INC', '581493949', 'Human Services', '', 'Human Services organization with annual revenue of $2.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CHILDRENS HEALTH SYSTEM OF TEXAS', '750800628', 'Health', '', 'Health organization with annual revenue of $2.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'KAISER FOUNDATION HEALTH PLAN OF GEORGIA INC', '581592076', 'Health', '', 'Health organization with annual revenue of $2.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ASCENSION HEALTH ALLIANCE', '453358926', 'Other', '', 'Other organization with annual revenue of $2.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UNIVERSITY OF MARYLAND MEDICAL SYSTEM CORPORATION', '521362793', 'Health', '', 'Health organization with annual revenue of $2.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'PRESBYTERIAN HEALTHCARE SERVICES', '850105601', 'Health', '', 'Health organization with annual revenue of $2.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'DIRECT RELIEF', '951831116', 'International', '', 'International organization with annual revenue of $2.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THE MITRE CORPORATION', '042239742', 'Research', '', 'Research organization with annual revenue of $2.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UNIVERSITY OF VERMONT MEDICAL CENTER INC', '030219309', 'Health', '', 'Health organization with annual revenue of $2.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'GRADY MEMORIAL HOSPITAL CORPORATION', '262037695', 'Health', '', 'Health organization with annual revenue of $2.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'VNS CHOICE', '133951057', 'Health', '', 'Health organization with annual revenue of $2.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SEATTLE CHILDRENS HOSPITAL', '910564748', 'Health', '', 'Health organization with annual revenue of $2.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'RIVERSIDE HEALTHCARE ASSOCIATION INC', '901000718', 'Other', '', 'Other organization with annual revenue of $2.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'COOPER HEALTH SYSTEM A NEW JERSEY NON-PROFIT CORPORATION', '210634462', 'Health', '', 'Health organization with annual revenue of $2.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'TEMPLE UNIVERSITY HOSPITAL INC', '232825878', 'Health', '', 'Health organization with annual revenue of $2.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THE MOSES H CONE MEMORIAL HOSPITAL OPERATING CORPORATION', '581588823', 'Health', '', 'Health organization with annual revenue of $2.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THE NEBRASKA MEDICAL CENTER', '911858433', 'Health', '', 'Health organization with annual revenue of $2.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'RHODE ISLAND HOSPITAL', '050258954', 'Health', '', 'Health organization with annual revenue of $2.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'AIDS HEALTHCARE FOUNDATION', '954112121', 'Human Services', '', 'Human Services organization with annual revenue of $2.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'H LEE MOFFITT CANCER CENTER AND RESEARCH INSTITUTE HOSPITAL INC', '593238634', 'Health', '', 'Health organization with annual revenue of $2.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MARY HITCHCOCK MEMORIAL HOSPITAL', '020222140', 'Health', '', 'Health organization with annual revenue of $2.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NORTHWESTERN MEMORIAL HEALTHCARE', '363152959', 'Health', '', 'Health organization with annual revenue of $2.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'HARVARD PILGRIM HEALTH CARE INC', '042452600', 'Health', '', 'Health organization with annual revenue of $2.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'COOK CHILDRENS MEDICAL CENTER', '752051646', 'Health', '', 'Health organization with annual revenue of $2.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'COMMUNITY HEALTH NETWORK INC', '350983617', 'Health', '', 'Health organization with annual revenue of $2.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NORTHSHORE UNIVERSITY HEALTHSYSTEM', '362167060', 'Health', '', 'Health organization with annual revenue of $2.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'PROVIDENCE HEALTH SYSTEM-SOUTHERN CALIFORNIA', '510216589', 'Health', '', 'Health organization with annual revenue of $2.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'OHIOHEALTH CORPORATION', '320007056', 'Health', '', 'Health organization with annual revenue of $2.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'KECK MEDICAL CENTER OF USC', '851644866', 'Health', '', 'Health organization with annual revenue of $2.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SSM HEALTH CARE ST LOUIS', '431343281', 'Health', '', 'Health organization with annual revenue of $2.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'HH MEDSTAR HEALTH INC', '521542230', 'Health', '', 'Health organization with annual revenue of $2.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'TEMPUS UNLIMITED INC', '042239746', 'Health', '', 'Health organization with annual revenue of $2.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'PITT COUNTY MEMORIAL HOSPITAL INC', '560585243', 'Health', '', 'Health organization with annual revenue of $2.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NORTHEAST GEORGIA MEDICAL CENTER INC', '581694098', 'Health', '', 'Health organization with annual revenue of $2.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'WEST VIRGINIA UNIVERSITY HOSPITALS INC', '550643304', 'Health', '', 'Health organization with annual revenue of $2.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'GEORGETOWN UNIVERSITY', '530196603', 'Education', '', 'Education organization with annual revenue of $2.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THE NEMOURS FOUNDATION', '590634433', 'Health', '', 'Health organization with annual revenue of $2.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'METHODIST HOSPITALS OF DALLAS', '750800661', 'Health', '', 'Health organization with annual revenue of $2.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'KENNESTONE HOSPITAL INC', '582032904', 'Health', '', 'Health organization with annual revenue of $2.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CHILDRENS MERCY HOSPITAL', '440605373', 'Health', '', 'Health organization with annual revenue of $2.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'AMERICAN ONLINE GIVING FOUNDATION INC', '810739440', 'Human Services', '', 'Human Services organization with annual revenue of $2.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'WAKEMED', '566017737', 'Health', '', 'Health organization with annual revenue of $2.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MASS GENERAL BRIGHAM INCORPORATED', '043230035', 'Health', '', 'Health organization with annual revenue of $2.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'HARVARD MANAGEMENT PRIVATE EQUITY CORPORATION', '043070522', 'Education', '', 'Education organization with annual revenue of $2.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BON SECOURS RICHMOND HEALTH SYSTEM', '521988421', 'Health', '', 'Health organization with annual revenue of $2.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'FRED HUTCHINSON CANCER CENTER', '911935159', 'Health', '', 'Health organization with annual revenue of $2.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SUTTER VALLEY MEDICAL FOUNDATION', '680273974', 'Health', '', 'Health organization with annual revenue of $2.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ST JUDE CHILDRENS RESEARCH HOSPITAL INC', '620646012', 'Health', '', 'Health organization with annual revenue of $2.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CARNEGIE MELLON UNIVERSITY', '250969449', 'Other', '', 'Other organization with annual revenue of $2.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'PARK NICOLLET', '455023260', 'Other', '', 'Other organization with annual revenue of $2.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'AMERICARES FOUNDATION INC', '061008595', 'International', '', 'International organization with annual revenue of $2.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BAYLOR UNIVERSITY MEDICAL CENTER', '751837454', 'Health', '', 'Health organization with annual revenue of $2.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CARILION MEDICAL CENTER', '540506332', 'Health', '', 'Health organization with annual revenue of $2.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BANNER UNIVERSITY FAMILY CARE', '463766901', 'Other', '', 'Other organization with annual revenue of $2.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'PRESBYTERIAN HOSPITAL', '560554230', 'Health', '', 'Health organization with annual revenue of $2.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SMITHSONIAN INSTITUTE', '530206027', 'Arts & Culture', '', 'Arts & Culture organization with annual revenue of $2.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'LENOX HILL HOSPITAL', '131624070', 'Health', '', 'Health organization with annual revenue of $2.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'METHODIST HEALTHCARE-MEMPHIS', '620479367', 'Health', '', 'Health organization with annual revenue of $1.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'PARKVIEW HOSPITAL INC', '350868085', 'Health', '', 'Health organization with annual revenue of $1.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ST ELIZABETH MEDICAL CENTER INC', '610445850', 'Health', '', 'Health organization with annual revenue of $1.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'GEORGE WASHINGTON UNIVERSITY', '530196584', 'Education', '', 'Education organization with annual revenue of $1.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'OUR LADY OF THE LAKE HOSPITAL INC', '720423651', 'Health', '', 'Health organization with annual revenue of $1.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MORGAN STANLEY GLOBAL IMPACT FUNDING TRUST INC', '527082731', 'Human Services', '', 'Human Services organization with annual revenue of $1.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CHILDRENS HOSPITAL COLORADO', '840166760', 'Health', '', 'Health organization with annual revenue of $1.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NEIGHBORHOOD HEALTH PLAN OF RHODE ISLAND', '050477052', 'Health', '', 'Health organization with annual revenue of $1.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SUTTER HEALTH', '942788907', 'Health', '', 'Health organization with annual revenue of $1.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MERCY HOSPITALS EAST COMMUNITIES', '430653493', 'Health', '', 'Health organization with annual revenue of $1.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'GEISINGER MEDICAL CENTER', '240795959', 'Health', '', 'Health organization with annual revenue of $1.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'GRAND CANYON UNIVERSITY', '472507725', 'Education', '', 'Education organization with annual revenue of $1.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ADVENTIST HEALTH SYSTEM SUNBELT HEALTHCARE CORPORATION', '592170012', 'Health', '', 'Health organization with annual revenue of $1.9B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SHRINERS HOSPITALS FOR CHILDREN', '362193608', 'Health', '', 'Health organization with annual revenue of $1.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'HOAG MEMORIAL HOSPITAL PRESBYTERIAN', '951643327', 'Health', '', 'Health organization with annual revenue of $1.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'HAWAII PACIFIC HEALTH GROUP RETURN', '383835105', 'Other', '', 'Other organization with annual revenue of $1.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'LOMA LINDA UNIVERSITY MEDICAL CENTER INC', '953522679', 'Health', '', 'Health organization with annual revenue of $1.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'LESTER E COX MEDICAL CENTER', '440577118', 'Health', '', 'Health organization with annual revenue of $1.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'FRANCISCAN HEALTH SYSTEM', '910564491', 'Health', '', 'Health organization with annual revenue of $1.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BAYSTATE MEDICAL CENTER INC', '042790311', 'Health', '', 'Health organization with annual revenue of $1.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'LIBERTY UNIVERSITY INC', '540946734', 'Education', '', 'Education organization with annual revenue of $1.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THE ADMINISTRATORS OF THE TULANE EDUCATIONAL FUND', '720423889', 'Education', '', 'Education organization with annual revenue of $1.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SCOTT & WHITE MEMORIAL HOSPITAL', '741166904', 'Health', '', 'Health organization with annual revenue of $1.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'JOHN MUIR HEALTH', '941461843', 'Health', '', 'Health organization with annual revenue of $1.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'PRISMA HEALTH-MIDLANDS', '582296052', 'Health', '', 'Health organization with annual revenue of $1.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'GOTHIC CORPORATION', '561776668', 'Education', '', 'Education organization with annual revenue of $1.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'HOWARD HUGHES MEDICAL INSTITUTE', '590735717', 'Health', '', 'Health organization with annual revenue of $1.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SAINT FRANCIS HOSPITAL INC', '730700090', 'Health', '', 'Health organization with annual revenue of $1.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SHARP HEALTHCARE', '956077327', 'Health', '', 'Health organization with annual revenue of $1.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'FALLON COMMUNITY HEALTH PLAN INC', '237442369', 'Health', '', 'Health organization with annual revenue of $1.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THE QUEENS MEDICAL CENTER', '990073524', 'Health', '', 'Health organization with annual revenue of $1.8B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ST JOSEPHS HOSPITAL INC', '590774199', 'Health', '', 'Health organization with annual revenue of $1.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'YORK HOSPITAL', '231352222', 'Health', '', 'Health organization with annual revenue of $1.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MAIN LINE HOSPITALS INC', '231352160', 'Health', '', 'Health organization with annual revenue of $1.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'GEISINGER CLINIC', '236291113', 'Health', '', 'Health organization with annual revenue of $1.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'RADY CHILDRENS HOSPITAL-SAN DIEGO', '951691313', 'Health', '', 'Health organization with annual revenue of $1.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'REX HOSPITAL INC', '561509260', 'Health', '', 'Health organization with annual revenue of $1.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CHILDRENS HOSPITAL LOS ANGELES', '951690977', 'Health', '', 'Health organization with annual revenue of $1.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CHILDRENS HOSPITAL', '530196580', 'Health', '', 'Health organization with annual revenue of $1.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'WASHINGTON HOSPITAL CENTER CORPORATION', '521272129', 'Health', '', 'Health organization with annual revenue of $1.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'AVERA MCKENNAN', '460224743', 'Health', '', 'Health organization with annual revenue of $1.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'RWJBH CORPORATE SERVICES INC', '222405279', 'Health', '', 'Health organization with annual revenue of $1.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'TRUSTEES OF DARTMOUTH COLLEGE', '020222111', 'Education', '', 'Education organization with annual revenue of $1.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BAYADA HOME HEALTH CARE INC', '231943113', 'Health', '', 'Health organization with annual revenue of $1.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'KALEIDA HEALTH', '161533232', 'Health', '', 'Health organization with annual revenue of $1.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'PIEDMONT HEALTHCARE INC', '580566213', 'Health', '', 'Health organization with annual revenue of $1.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NEW YORK SOCIETY FOR THE RELIEF OF RUPTURED & CRIPPLED MAINTAINING', '131624135', 'Health', '', 'Health organization with annual revenue of $1.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CHARLESTON AREA MEDICAL CENTER INC', '550526150', 'Health', '', 'Health organization with annual revenue of $1.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MEDSTAR-GEORGETOWN MEDICAL CENTER INC', '522218584', 'Health', '', 'Health organization with annual revenue of $1.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MEMORIAL SLOAN-KETTERING CANCER CENTER', '131924236', 'Health', '', 'Health organization with annual revenue of $1.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SACRED HEART HEALTH SYSTEM INC', '590634434', 'Health', '', 'Health organization with annual revenue of $1.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'LOYOLA UNIVERSITY MEDICAL CENTER', '364015560', 'Health', '', 'Health organization with annual revenue of $1.7B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'LEXINGTON HEALTH INC', '852276567', 'Health', '', 'Health organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BROWN UNIVERSITY OF PROVIDENCE', '050258809', 'Human Services', '', 'Human Services organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'WAKE FOREST UNIVERSITY HEALTH SCIENCES', '223849199', 'Education', '', 'Education organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BOSTON COLLEGE TRUSTEES', '042103545', 'Education', '', 'Education organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ST LUKES ROOSEVELT HOSPITAL CENTER', '132997301', 'Health', '', 'Health organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MEMORIAL HEALTH SYSTEM', '900756744', 'Other', '', 'Other organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'LOUISIANA CHILDRENS MEDICAL CENTER', '943480131', 'Health', '', 'Health organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'LANCASTER GENERAL HOSPITAL', '231365353', 'Health', '', 'Health organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MAIMONIDES MEDICAL CENTER-', '111635081', 'Health', '', 'Health organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'LOMA LINDA MERCANTILE', '953858272', 'Health', '', 'Health organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THOMAS JEFFERSON UNIVERSITY', '231352651', 'Education', '', 'Education organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UPMC', '251778644', 'Health', '', 'Health organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'GUNDERSEN LUTHERAN MEDICAL CENTER INC', '390813416', 'Health', '', 'Health organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CARESOURCE GEORGIA CO', '472408339', 'Health', '', 'Health organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THE MEDICAL COLLEGE OF WISCONSIN INC', '390806261', 'Education', '', 'Education organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CASE WESTERN RESERVE UNIVERSITY', '341018992', 'Education', '', 'Education organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'TEMPLE UNIVERSITY-OF THE COMMONWEALTH SYSTEM OF HIGHER EDUC', '231365971', 'Education', '', 'Education organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SILICON VALLEY COMMUNITY FOUNDATION', '205205488', 'Human Services', '', 'Human Services organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ELDERPLAN INC', '112625096', 'Health', '', 'Health organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SHARP MEMORIAL HOSPITAL', '953782169', 'Health', '', 'Health organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'TOLEDO HOSPITAL', '344428256', 'Health', '', 'Health organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'WORLD VISION', '951922279', 'International', '', 'International organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ROCHESTER GENERAL HOSPITAL', '160743134', 'Health', '', 'Health organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NATIONWIDE CHILDRENS HOSPITAL INC', '311429047', 'Health', '', 'Health organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BJC HEALTH SYSTEM', '431617558', 'Health', '', 'Health organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ST LUKES HOSPITAL', '231352213', 'Health', '', 'Health organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'HENNEPIN HEALTHCARE SYSTEM INC', '421707837', 'Health', '', 'Health organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MIAMI VALLEY HOSPITAL', '310537504', 'Health', '', 'Health organization with annual revenue of $1.6B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SUMMA HEALTH GROUP RETURN', '900640432', 'Other', '', 'Other organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MHM SUPPORT SERVICES', '202553101', 'Other', '', 'Other organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UNIVERSITY OF WESTERN ONTARIO', '986001623', 'International', '', 'International organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'WILLIS-KNIGHTON MEDICAL CENTER', '720400933', 'Health', '', 'Health organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CHG FOUNDATION', '330586911', 'Health', '', 'Health organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'INTERNATIONAL RESCUE COMMITTEE INC', '135660870', 'International', '', 'International organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ANN & ROBERT H LURIE CHILDRENS HOSPITAL OF CHICAGO', '362170833', 'Health', '', 'Health organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'READING HOSPITAL', '231352204', 'Health', '', 'Health organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ALBERT EINSTEIN HEALTHCARE NETWORK', '465338502', 'Other', '', 'Other organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ST VINCENT HOSPITAL & HEALTH CARE', '350869066', 'Health', '', 'Health organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'STATEN ISLAND UNIVERSITY HOSPITAL', '112868878', 'Health', '', 'Health organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SOUTHERN NEW HAMPSHIRE UNIVERSITY', '020274509', 'Education', '', 'Education organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ST JOSEPH HEALTH NORTHERN CALIFORNIA LLC', '814791043', 'Health', '', 'Health organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UNIVERSITY HEALTH SYSTEM INC', '311626179', 'Health', '', 'Health organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NATURE CONSERVANCY', '530242652', 'Other', '', 'Other organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ALTAMED HEALTH SERVICES CORP', '952810095', 'Health', '', 'Health organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'PHOENIX CHILDRENS HOSPITAL', '860422559', 'Health', '', 'Health organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'DIGNITY HEALTH MEDICAL FOUNDATION', '680220314', 'Health', '', 'Health organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'DEACONESS HOSPITAL INC', '350593390', 'Health', '', 'Health organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MCHS HOSPITALS INC', '810977948', 'Health', '', 'Health organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BAYLOR UNIVERSITY', '741159753', 'Education', '', 'Education organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'WESTERN GOVERNORS UNIVERSITY', '474365018', 'Education', '', 'Education organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'RENAISSANCE CHARITABLE FOUNDATION INC', '352129262', 'Human Services', '', 'Human Services organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THE GOVERNORS OF THE UNIVERSITY OF ALBERTA', '986001254', 'International', '', 'International organization with annual revenue of $1.5B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'RESEARCH FOUNDATION FOR THE STATE UNIVERSITY OF NEW YORK', '141368361', 'Education', '', 'Education organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'FORSYTH MEMORIAL HOSPITAL INC', '560928089', 'Health', '', 'Health organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UNIVERSITY OF WISCONSIN MEDICAL FOUNDATION INC', '391824445', 'Health', '', 'Health organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MOTHER FRANCES HOSPITAL REGIONAL HEALTH CARE CENTER', '750818167', 'Health', '', 'Health organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CHILDRENS HOSPITAL OF ORANGE COUNTY', '952321786', 'Health', '', 'Health organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'WILLIAM MARSH RICE UNIVERSITY', '741109620', 'Education', '', 'Education organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MOUNT CARMEL HEALTH SYSTEM', '311439334', 'Other', '', 'Other organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THE CARLE FOUNDATION HOSPITAL', '371119538', 'Health', '', 'Health organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UNIVERSITE DE MONTREAL SUCCURSALE A QUEBEC', '237172320', 'Education', '', 'Education organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'RESEARCH TRIANGLE INSTITUTE', '560686338', 'Research', '', 'Research organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'DREXEL UNIVERSITY', '231352630', 'Education', '', 'Education organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'TRUSTEES OF TUFTS COLLEGE', '042103634', 'Education', '', 'Education organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'TEXAS HEALTH RESOURCES', '752702388', 'Health', '', 'Health organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'EISENHOWER MEDICAL CENTER', '956130458', 'Health', '', 'Health organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CHRIST HOSPITAL', '310538525', 'Health', '', 'Health organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CHILDRENS HOSPITAL MEDICAL CENTER OF AKRON', '340714357', 'Health', '', 'Health organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'TUFTS MEDICAL CENTER PARENT INC', '270440772', 'Other', '', 'Other organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ASANTE', '930223960', 'Health', '', 'Health organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BAPTIST HEALTH', '710236856', 'Health', '', 'Health organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'AEROSPACE CORPORATION', '952102389', 'Research', '', 'Research organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BAYLOR SCOTT & WHITE HEALTH', '463131350', 'Health', '', 'Health organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'HOWARD UNIVERSITY', '530204707', 'Education', '', 'Education organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'PROVIDENCE MEDICAL FOUNDATION', '330185031', 'Health', '', 'Health organization with annual revenue of $1.4B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UNIVERSITY OF WATERLOO', '980061413', 'Other', '', 'Other organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BAPTIST HEALTH OF SOUTH FLORIDA INC', '650267668', 'Health', '', 'Health organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'PRESBYTERIAN MEDICAL CENTER OF THE UNIVERSITY OF PENNSYLVANIA HEALTH', '232810852', 'Health', '', 'Health organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'LAKELAND REGIONAL MEDICAL CENTER INC', '592650456', 'Health', '', 'Health organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ROYAL INSTITUTION FOR THE ADVANCEMENT OF LEARNING-MCGILL UNI', '986001153', 'Other', '', 'Other organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'HEALTHTEXAS PROVIDER NETWORK', '752536818', 'Health', '', 'Health organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'AMERICAN ENDOWMENT FOUNDATION', '341747398', 'Human Services', '', 'Human Services organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NAVIGATION CHARITABLE FUND', '921117448', 'Research', '', 'Research organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ERLANGER HEALTH', '883616696', 'Health', '', 'Health organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SCOTT & WHITE CLINIC', '742958277', 'Health', '', 'Health organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BRONSON METHODIST HOSPITAL', '381359087', 'Health', '', 'Health organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BETH ISRAEL MEDICAL CENTER', '135564934', 'Health', '', 'Health organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MERCY HOSPITAL SPRINGFIELD', '440552485', 'Health', '', 'Health organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'COREWELL HEALTH', '383382353', 'Health', '', 'Health organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CHI ST LUKES HEALTH BAYLOR COLLEGE OF MEDICINE MEDICAL CENTER', '741161938', 'Health', '', 'Health organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NATIONAL COLLEGIATE ATHLETIC ASSOCIATION', '440567264', 'Human Services', '', 'Human Services organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CHAN ZUCKERBERG BIOHUB INC', '811669175', 'Health', '', 'Health organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'PRIORITY HEALTH CHOICE INC', '320016523', 'Health', '', 'Health organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'DUKE HEALTH INTEGRATED PRACTICE INC', '862109896', 'Other', '', 'Other organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'INDIANA UNIVERSITY HEALTH CARE ASSOCIATES INC', '351747218', 'Health', '', 'Health organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'LEGACY EMANUEL HOSPITAL & HEALTH CENTER', '930386823', 'Health', '', 'Health organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'VIRGINIA MASON MEDICAL CENTER', '910565539', 'Health', '', 'Health organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ASCENSION HEALTH-IS INC', '651257719', 'Other', '', 'Other organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UOFL HEALTH-LOUISVILLE INC', '843178470', 'Health', '', 'Health organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'GROUP HEALTH INC', '410797853', 'Health', '', 'Health organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'VILLAGE SENIOR SERVICES CORPORATION', '262006545', 'Health', '', 'Health organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MCLEOD REGIONAL MEDICAL CENTER OF THE PEE DEE INC', '570370242', 'Health', '', 'Health organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CITY UNIVERSITY CONSTRUCTION FUND', '132587538', 'Education', '', 'Education organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SAINT THOMAS WEST HOSPITAL', '620347580', 'Health', '', 'Health organization with annual revenue of $1.3B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ST CHARLES HEALTH SYSTEM INC', '930602940', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CHRISTUS HEALTH', '760590551', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'THE GOVERNORS OF THE UNIVERSITY OF CALGARY', '237067592', 'Other', '', 'Other organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'COMMUNITY BEHAVORIAL HEALTH', '232766661', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'INTERMOUNTAIN MEDICAL HOLDINGS NEVADA INC', '200160881', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'TEXAS HEALTH HARRIS METHODIST HOSPITAL FORT WORTH', '756001743', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ADVOCATE NORTH SIDE HEALTH NETWORK', '363196629', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'LAHEY CLINIC HOSPITAL INC', '042704686', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CENTRAL IOWA HOSPITAL CORPORATION', '420680452', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CHRISTUS SANTA ROSA HEALTH CARE CORPORATION', '741109665', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'DRISCOLL CHILDRENS HEALTH PLAN', '742838488', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'PRESENCE CHICAGO HOSPITALS NETWORK', '362235165', 'Human Services', '', 'Human Services organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'INTEGRIS BAPTIST MEDICAL CENTER INC', '731034824', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'VALLEY HEALTH SYSTEM', '800584319', 'Other', '', 'Other organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CARESOURCE INDIANA INC', '320121856', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'EDWARD W SPARROW HOSPITAL ASSOCIATION', '381360584', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SOUTHCOAST HOSPITALS GROUP INC', '222592333', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'TEXAS CHRISTIAN UNIVERSITY', '750827465', 'Education', '', 'Education organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SSM HEALTH CARE CORPORATION', '466029223', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'FIRST HEALTH OF THE CAROLINAS INC', '561936354', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BANK OF AMERICA CHARITABLE GIFT FUND', '046010342', 'Human Services', '', 'Human Services organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CUMBERLAND COUNTY HOSPITAL SYSTEM INC', '560845796', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'GUNDERSEN LUTHERAN ADMINISTRATIVE SERVICES INC', '391606449', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'IDEA PUBLIC SCHOOLS', '742948339', 'Education', '', 'Education organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'COBB HOSPITAL', '580968382', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'RENOWN REGIONAL MEDICAL CENTER', '880213754', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'FLORIDA CLINICAL PRACTICE ASSOCIATION INC', '591680273', 'Other', '', 'Other organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UNIVERSITY OF ALABAMA HEALTH SERVICES FOUNDATION PC', '630649108', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ST LUKES HOSPITAL OF KANSAS CITY', '440545297', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ROCHESTER INSTITUTE OF TECHNOLOGY', '160743140', 'Education', '', 'Education organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'VALLEY HOSPITAL INC', '221487307', 'Health', '', 'Health organization with annual revenue of $1.2B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SOUTHERN METHODIST UNIVERSITY', '750800689', 'Education', '', 'Education organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SALEM HEALTH', '930579722', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'KETTERING COLLEGE', '310621866', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CHILDRENS HEALTH CARE', '411754276', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SHANDS JACKSONVILLE MEDICAL CENTER INC', '592142859', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'VIRTU-WEST JERSEY HEALTH SYSTEM INC', '210634532', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'JEWISH COMMUNAL FUND', '237174183', 'Human Services', '', 'Human Services organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CAPITAL HEALTH SYSTEM INC', '223548695', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ELDERSERVE HEALTH INC', '800517818', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'INSPIRA MEDICAL CENTERS INC', '210634484', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UNIVERSITY COMMUNITY HOSPITAL INC', '591113901', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'WORLD FEDERATION OF HEMOPHILIA USA', '161513923', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CENTRA HEALTH INC', '540715569', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'INTERMOUNTAIN FRONT RANGE INC', '841103606', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'OHIO STATE UNIVERSITY PHYSICIANS INC', '311447726', 'Education', '', 'Education organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'FORDHAM UNIVERSITY', '131740451', 'Education', '', 'Education organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MCMASTER UNIVERSITY ONTARIO', '237213309', 'Other', '', 'Other organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CAPE COD HEALTHCARE INC', '900054984', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'COMMONWEALTH SCIENTIFIC AND INDUSTRIAL RESEARCH ORGANIZATION', '980119947', 'Other', '', 'Other organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BROOKDALE HOSPITAL MEDICAL CENTER', '111631746', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'EASTERN MAINE HEALTHCARE SYSTEMS', '010211501', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'PARKVIEW HEALTH SYSTEM INC', '351972384', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'DRISCOLL CHILDRENS HOSPITAL', '742577746', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'PHYSICIAN AFFILIATE GROUP OF NEW YORK PC', '900603487', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'YALE NEW HAVEN HEALTH SERVICES CORPORATION', '222529464', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NCF CHARITABLE TRUST', '204326440', 'Religion', '', 'Religion organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'METHODIST HOSPITAL', '571201170', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ALASKA NATIVE TRIBAL HEALTH CONSORTIUM', '920162721', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'EDUCATIONAL TESTING SERVICE', '210634479', 'Education', '', 'Education organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ENGLEWOOD HOSPITAL AND MEDICAL CENTER A NEW JERSEY NONPROFIT CORP', '221487173', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ST CLOUD HOSPITAL', '410695596', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'HEALTH RESEARCH INCORPORATED ELIZABETH WOOD', '141402155', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'GROSSMONT HOSPITAL CORPORATION', '330449527', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ASCENSION ST JOHN HOSPITAL', '381359063', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'STORMONT-VAIL HEALTHCARE INC', '480543789', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NEWYORK-PRESBYTERIAN-QUEENS', '111839362', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'TALLAHASSEE MEMORIAL HEALTHCARE INC', '591917016', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ORLANDO HEALTH MEDICAL GROUP INC', '593259553', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BAYHEALTH MEDICAL CENTER INC', '510064318', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CHRISTUS TRINITY CLINIC TEXAS', '752616977', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'LOYOLA UNIVERSITY OF CHICAGO', '361408475', 'Education', '', 'Education organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MOUNTAIN STATES HEALTH ALLIANCE', '620476282', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SOUTH SHORE UNIVERSITY HOSPITAL', '111667761', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SSM HEALTH CARE OF OKLAHOMA INC', '730657693', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MOUNT SINAI MEDICAL CENTER OF FLORIDA INC', '590624424', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'REGIONS HOSPITAL', '410956618', 'Health', '', 'Health organization with annual revenue of $1.1B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'HCR MANORCARE INC', '825373223', 'Health', '', 'Health organization with annual revenue of $1.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'OCHSNER LSU HEALTH SYSTEM OF NORTH LOUISIANA', '831605004', 'Health', '', 'Health organization with annual revenue of $1.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'FLORIDA HOSPITAL MEDICAL GROUP INC', '593214635', 'Other', '', 'Other organization with annual revenue of $1.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'WHITE PLAINS HOSPITAL MEDICAL CENTER', '131740130', 'Health', '', 'Health organization with annual revenue of $1.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'WELLSPAN MEDICAL GROUP', '232730785', 'Health', '', 'Health organization with annual revenue of $1.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'POUDRE VALLEY MEDICAL GROUP LLC', '800348943', 'Health', '', 'Health organization with annual revenue of $1.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MONUMENT HEALTH RAPID CITY HOSPITAL INC', '460319070', 'Health', '', 'Health organization with annual revenue of $1.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CAMP BOWIE SERVICE CENTER', '943299123', 'Health', '', 'Health organization with annual revenue of $1.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'LEHIGH VALLEY PHYSICIAN GROUP', '232700908', 'Health', '', 'Health organization with annual revenue of $1.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ST JOSEPHS HEALTH SYSTEM SUBORDINATE GROUP RETURN', '271344467', 'Other', '', 'Other organization with annual revenue of $1.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SAINT JOSEPH HEALTH SYSTEM INC', '611334601', 'Health', '', 'Health organization with annual revenue of $1.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NOVA SOUTHEASTERN UNIVERSITY INC', '591083502', 'Education', '', 'Education organization with annual revenue of $1.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'COLLEGE BOARD', '131623965', 'Education', '', 'Education organization with annual revenue of $1.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BAYCARE HEALTH SYSTEMS INC', '592796965', 'Health', '', 'Health organization with annual revenue of $1.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MEDICAL CENTER OF CENTRAL GEORGIA INC', '582149128', 'Health', '', 'Health organization with annual revenue of $1.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ALLIANCE FOR SUSTAINABLE ENERGY LLC', '261939342', 'Research', '', 'Research organization with annual revenue of $1.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SINAI HOSPITAL OF BALTIMORE INC', '520486540', 'Health', '', 'Health organization with annual revenue of $1.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'INLAND COUNTIES REGIONAL CENTER INC', '237121672', 'Human Services', '', 'Human Services organization with annual revenue of $1.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MORTON PLANT HOSPITAL ASSOCIATION INC', '590624462', 'Health', '', 'Health organization with annual revenue of $1.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'COMMUNITY HOSPITAL OF THE MONTEREY PENINSULA', '940760193', 'Health', '', 'Health organization with annual revenue of $1.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'AU MEDICAL CENTER INC', '582144788', 'Education', '', 'Education organization with annual revenue of $1.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'FOSTER CHARITABLE TRUST', '846847169', 'Other', '', 'Other organization with annual revenue of $1.0B'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ENLOE MEDICAL CENTER', '941603784', 'Health', '', 'Health organization with annual revenue of $997M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UNITED HEALTH SERVICES HOSPITALS INC', '161165049', 'Health', '', 'Health organization with annual revenue of $993M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'UNIVERSITY HOSPITALS HEALTH SYSTEM INC', '340714775', 'Health', '', 'Health organization with annual revenue of $990M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ATLANTICARE HEALTH SYSTEM INC', '900779828', 'Other', '', 'Other organization with annual revenue of $989M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'YORK UNIVERSITY', '237069967', 'Education', '', 'Education organization with annual revenue of $987M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'NORTH MISSISSIPPI MEDICAL CENTER INC', '640662976', 'Health', '', 'Health organization with annual revenue of $985M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'AULTMAN HEALTH FOUNDATION GROUP RETURN', '320483994', 'Health', '', 'Health organization with annual revenue of $982M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'SANTA BARBARA COTTAGE HOSPITAL', '951644629', 'Health', '', 'Health organization with annual revenue of $979M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'CATHOLIC HEALTH INITIATIVES-IOWA CORP', '420680448', 'Health', '', 'Health organization with annual revenue of $977M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'ASHLAND HOSPITAL CORPORATION', '610444716', 'Health', '', 'Health organization with annual revenue of $976M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'BAPTIST MEMORIAL HOSPITAL', '620123940', 'Health', '', 'Health organization with annual revenue of $975M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'VARIETY CHILDRENS HOSPITAL', '590638499', 'Health', '', 'Health organization with annual revenue of $974M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'AMERICAN HEART ASSOCIATION INC', '135613797', 'Health', '', 'Health organization with annual revenue of $972M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'MERCY HEALTH SERVICES IOWA CORP', '311373080', 'Health', '', 'Health organization with annual revenue of $972M'
FROM users WHERE email = 'test@example.com';
INSERT OR IGNORE INTO charities (user_id, name, ein, category, website, description)
SELECT id, 'POUDRE VALLEY HEALTH CARE INC', '841262971', 'Health', '', 'Health organization with annual revenue of $970M'
FROM users WHERE email = 'test@example.com';

-- Charities successfully loaded
