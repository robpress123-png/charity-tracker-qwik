-- ============================================
-- ITEMS PRICE HISTORY TABLE
-- ============================================
-- This table tracks all changes to item prices in the items table
-- Allows querying historical prices for any date
-- Essential for audit trails and tax compliance

CREATE TABLE IF NOT EXISTS items_price_history (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,
    old_low_value DECIMAL(10, 2),
    old_high_value DECIMAL(10, 2),
    new_low_value DECIMAL(10, 2),
    new_high_value DECIMAL(10, 2),
    changed_by TEXT,  -- admin user who made the change
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    change_reason TEXT,
    INDEX idx_price_history_item (item_name),
    INDEX idx_price_history_date (changed_at),
    INDEX idx_price_history_category (category)
);

-- Insert initial history record for existing items
INSERT INTO items_price_history (
    item_name,
    category,
    old_low_value,
    old_high_value,
    new_low_value,
    new_high_value,
    changed_by,
    change_reason
)
SELECT
    name,
    category,
    NULL,
    NULL,
    low_value,
    high_value,
    'system',
    'Initial import'
FROM items
WHERE NOT EXISTS (
    SELECT 1 FROM items_price_history
    WHERE items_price_history.item_name = items.name
    AND items_price_history.category = items.category
);