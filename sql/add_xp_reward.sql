-- Migration: Add xp_reward column to actions table
-- Run this on your existing Supabase database

-- Add the xp_reward column with default value of 5
ALTER TABLE actions
ADD COLUMN IF NOT EXISTS xp_reward INTEGER NOT NULL DEFAULT 5;

-- Verify the column was added
SELECT id, name, xp_reward FROM actions ORDER BY name LIMIT 5;
