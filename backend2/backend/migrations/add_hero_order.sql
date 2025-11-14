-- Migration: Add hero_order column to products table
-- Run this SQL if the hero_order column doesn't exist

ALTER TABLE products 
ADD COLUMN IF NOT EXISTS hero_order INT DEFAULT NULL 
COMMENT 'Position in hero section (1-3), NULL means not in hero';

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_hero_order ON products(hero_order);

