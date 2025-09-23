# Future Features - Charity Tracker

## Database-Driven Charity Aliases
**Current State:** Charity aliases are hardcoded in `/functions/utils/charity-aliases.js`
**Priority:** Medium
**Date Added:** 2025-01-23

### Proposed Implementation:
Create a `charity_aliases` table in the database to allow dynamic management of charity name mappings.

#### Benefits:
- Admin panel for adding/editing aliases without code deployment
- Machine learning from user charity matches
- User-submitted aliases (with approval workflow)
- Track match confidence scores
- Analytics on which aliases are most used

#### Database Schema:
```sql
CREATE TABLE charity_aliases (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  common_name TEXT NOT NULL,
  official_name TEXT NOT NULL,
  charity_id TEXT,
  confidence_score INTEGER DEFAULT 90,
  usage_count INTEGER DEFAULT 0,
  submitted_by TEXT,
  approved_by TEXT,
  is_approved BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (charity_id) REFERENCES charities(id)
);
```

#### Implementation Notes:
- Keep current code-based system as fallback
- Cache database aliases in memory for performance
- Admin interface for managing aliases
- Auto-learn from successful user matches
- API endpoint for suggesting new aliases

#### Considerations:
- Performance impact of database lookups
- Need for caching strategy
- Approval workflow for user submissions
- Migration path from current system

---

## Other Future Features
(Add more features here as they come up)