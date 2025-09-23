-- Migration to add value_source column to donation_items table
-- This column will store the valuation justification for custom/other items

-- Add value_source column to donation_items table
ALTER TABLE donation_items ADD COLUMN value_source TEXT;

-- The column will be NULL for existing items and for items from predefined categories
-- It will only be populated for items with category = 'Other'