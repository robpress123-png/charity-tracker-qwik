/**
 * Common charity name aliases for better matching
 * Maps common names to potential official IRS names
 */

export const charityAliases = {
  // Red Cross variations
  'american red cross': [
    'AMERICAN NATIONAL RED CROSS',
    'AMERICAN RED CROSS NATIONAL HEADQUARTERS',
    'AMERICAN RED CROSS',
    'RED CROSS'
  ],
  'red cross': [
    'AMERICAN NATIONAL RED CROSS',
    'AMERICAN RED CROSS NATIONAL HEADQUARTERS',
    'AMERICAN RED CROSS'
  ],

  // Habitat for Humanity
  'habitat for humanity': [
    'HABITAT FOR HUMANITY INTERNATIONAL INC',
    'HABITAT FOR HUMANITY',
    'HABITAT HUMANITY'
  ],

  // Doctors Without Borders
  'doctors without borders': [
    'DOCTORS WITHOUT BORDERS USA INC',
    'MEDECINS SANS FRONTIERES USA',
    'MSF USA'
  ],
  'msf': [
    'MEDECINS SANS FRONTIERES USA',
    'DOCTORS WITHOUT BORDERS USA INC'
  ],

  // St. Jude
  'st jude': [
    'ST JUDE CHILDRENS RESEARCH HOSPITAL',
    'ST JUDE HOSPITAL',
    'SAINT JUDE CHILDRENS RESEARCH HOSPITAL'
  ],
  'st jude childrens research hospital': [
    'ST JUDE CHILDRENS RESEARCH HOSPITAL',
    'SAINT JUDE CHILDRENS RESEARCH HOSPITAL'
  ],

  // Salvation Army
  'salvation army': [
    'THE SALVATION ARMY',
    'SALVATION ARMY NATIONAL CORPORATION',
    'SALVATION ARMY USA',
    'SALVATION ARMY',
    'THE SALVATION ARMY NATIONAL CORPORATION'
  ],

  // UNICEF
  'unicef': [
    'UNITED STATES FUND FOR UNICEF',
    'US FUND FOR UNICEF',
    'UNICEF USA'
  ],

  // World Wildlife Fund
  'wwf': [
    'WORLD WILDLIFE FUND INC',
    'WORLD WILDLIFE FUND',
    'WWF US'
  ],
  'world wildlife fund': [
    'WORLD WILDLIFE FUND INC',
    'WORLD WILDLIFE FUND'
  ],

  // United Way
  'united way': [
    'UNITED WAY WORLDWIDE',
    'UNITED WAY OF AMERICA',
    'UNITED WAY'
  ],

  // Make-A-Wish (note the database has spaces around hyphens)
  'make a wish': [
    'MAKE A WISH FOUNDATION OF AMERICA',
    'MAKE A WISH FOUNDATION',
    'MAKE A WISH AMERICA',
    'MAKE- A- WISH FOUNDATION OF AMERICA',
    'MAKE-A-WISH FOUNDATION OF AMERICA'
  ],
  'make-a-wish': [
    'MAKE A WISH FOUNDATION OF AMERICA',
    'MAKE A WISH FOUNDATION',
    'MAKE- A- WISH FOUNDATION OF AMERICA',
    'MAKE-A-WISH FOUNDATION OF AMERICA'
  ],
  'make-a-wish foundation': [
    'MAKE A WISH FOUNDATION OF AMERICA',
    'MAKE- A- WISH FOUNDATION OF AMERICA',
    'MAKE-A-WISH FOUNDATION OF AMERICA'
  ],

  // Goodwill
  'goodwill': [
    'GOODWILL INDUSTRIES INTERNATIONAL INC',
    'GOODWILL INDUSTRIES',
    'GOODWILL'
  ],

  // March of Dimes
  'march of dimes': [
    'MARCH OF DIMES INC',
    'MARCH OF DIMES FOUNDATION',
    'MARCH OF DIMES'
  ],

  // American Cancer Society
  'american cancer society': [
    'AMERICAN CANCER SOCIETY INC',
    'AMERICAN CANCER SOCIETY',
    'ACS'
  ],

  // American Heart Association
  'american heart association': [
    'AMERICAN HEART ASSOCIATION INC',
    'AMERICAN HEART ASSOCIATION',
    'AHA'
  ],

  // Boys and Girls Club
  'boys and girls club': [
    'BOYS AND GIRLS CLUBS OF AMERICA',
    'BOYS GIRLS CLUBS OF AMERICA',
    'BGCA'
  ],

  // YMCA
  'ymca': [
    'YMCA OF THE USA',
    'YOUNG MENS CHRISTIAN ASSOCIATION',
    'YMCA'
  ],

  // Feed the Children
  'feed the children': [
    'FEED THE CHILDREN INC',
    'FEED THE CHILDREN',
    'FTC'
  ],

  // Nature Conservancy
  'nature conservancy': [
    'THE NATURE CONSERVANCY',
    'NATURE CONSERVANCY',
    'TNC'
  ],

  // Sierra Club
  'sierra club': [
    'SIERRA CLUB FOUNDATION',
    'SIERRA CLUB',
    'SCF'
  ],

  // PBS
  'pbs': [
    'PUBLIC BROADCASTING SERVICE',
    'PBS FOUNDATION',
    'PBS'
  ],

  // NPR
  'npr': [
    'NATIONAL PUBLIC RADIO INC',
    'NPR INC',
    'NPR'
  ],

  // Planned Parenthood
  'planned parenthood': [
    'PLANNED PARENTHOOD FEDERATION OF AMERICA INC',
    'PLANNED PARENTHOOD',
    'PPFA'
  ],

  // ASPCA
  'aspca': [
    'AMERICAN SOCIETY FOR THE PREVENTION OF CRUELTY TO ANIMALS',
    'ASPCA',
    'AMERICAN SPCA'
  ],

  // Humane Society
  'humane society': [
    'THE HUMANE SOCIETY OF THE UNITED STATES',
    'HUMANE SOCIETY US',
    'HSUS'
  ],

  // World Vision
  'world vision': [
    'WORLD VISION INC',
    'WORLD VISION USA',
    'WORLD VISION'
  ],

  // Feeding America
  'feeding america': [
    'FEEDING AMERICA',
    'AMERICAS SECOND HARVEST',
    'FEEDING AMERICA NATIONAL'
  ],

  // Special Olympics
  'special olympics': [
    'SPECIAL OLYMPICS INC',
    'SPECIAL OLYMPICS INTERNATIONAL',
    'SPECIAL OLYMPICS'
  ],

  // Catholic Charities
  'catholic charities': [
    'CATHOLIC CHARITIES USA',
    'CATHOLIC CHARITIES',
    'CCUSA'
  ],

  // Lutheran Services
  'lutheran services': [
    'LUTHERAN SERVICES IN AMERICA INC',
    'LUTHERAN SERVICES',
    'LSA'
  ],

  // Jewish Federations
  'jewish federation': [
    'JEWISH FEDERATIONS OF NORTH AMERICA INC',
    'JEWISH FEDERATION',
    'JFNA'
  ],

  // Museums (common ones)
  'smithsonian': [
    'SMITHSONIAN INSTITUTION',
    'SMITHSONIAN',
    'SI'
  ],
  'met': [
    'METROPOLITAN MUSEUM OF ART',
    'THE METROPOLITAN MUSEUM OF ART',
    'MET MUSEUM'
  ],
  'moma': [
    'MUSEUM OF MODERN ART',
    'THE MUSEUM OF MODERN ART',
    'MOMA'
  ],

  // Universities (common abbreviations)
  'harvard': [
    'PRESIDENT AND FELLOWS OF HARVARD COLLEGE',
    'HARVARD UNIVERSITY',
    'HARVARD COLLEGE'
  ],
  'mit': [
    'MASSACHUSETTS INSTITUTE OF TECHNOLOGY',
    'MIT',
    'MASS INST OF TECHNOLOGY'
  ],
  'stanford': [
    'THE LELAND STANFORD JUNIOR UNIVERSITY',
    'STANFORD UNIVERSITY',
    'STANFORD'
  ],
  'yale': [
    'YALE UNIVERSITY',
    'YALE',
    'YALE COLLEGE'
  ]
};

/**
 * Try to find a charity match using aliases
 * @param {string} searchName - The name to search for
 * @param {Map} charityMap - Map of existing charities
 * @returns {object|null} - The matched charity or null
 */
export function findCharityWithAliases(searchName, charityMap) {
  const cleanSearchName = searchName.toLowerCase().trim();

  // First try direct match
  let match = charityMap.get(cleanSearchName);
  if (match) return match;

  // Try alias matching - convert keys to lowercase for comparison
  for (const [commonName, aliases] of Object.entries(charityAliases)) {
    if (cleanSearchName === commonName.toLowerCase() || cleanSearchName.includes(commonName.toLowerCase())) {
      // Try each alias
      for (const alias of aliases) {
        const aliasLower = alias.toLowerCase();
        match = charityMap.get(aliasLower);
        if (match) return match;

        // Try partial match on alias
        for (const [key, charity] of charityMap) {
          if (key.includes(aliasLower) || aliasLower.includes(key)) {
            return charity;
          }
        }
      }
    }
  }

  // Try reverse - check if any alias matches our search
  for (const [commonName, aliases] of Object.entries(charityAliases)) {
    for (const alias of aliases) {
      if (alias.toLowerCase() === cleanSearchName) {
        // Try to find the common name
        const commonMatch = charityMap.get(commonName);
        if (commonMatch) return commonMatch;
      }
    }
  }

  return null;
}