-- =====================================================
-- NEW ACTIONS & SPECIAL TYPE SUPPORT
-- Run these in Supabase SQL Editor
-- =====================================================

-- STEP 1: Add special_type column to actions table
-- This enables different behavior for certain actions (water tracking, etc.)
ALTER TABLE actions ADD COLUMN IF NOT EXISTS special_type VARCHAR(50) DEFAULT NULL;
ALTER TABLE actions ADD COLUMN IF NOT EXISTS special_config JSONB DEFAULT NULL;

-- special_type values:
--   NULL = normal action (complete once per day)
--   'water_tracking' = track cups of water, goal-based completion
--   Future: 'counter', 'timer', etc.

-- special_config example for water:
-- { "unit": "ml", "per_increment": 250, "daily_goal": 2000 }


-- =====================================================
-- STEP 2: Add new actions
-- =====================================================

-- Withdraw Money (normal action)
INSERT INTO actions (name, description, icon_name)
VALUES ('Withdraw Money', 'Withdraw cash from ATM', 'atm')
ON CONFLICT DO NOTHING;

-- Drink Water (special action with water_tracking type)
INSERT INTO actions (name, description, icon_name, special_type, special_config)
VALUES (
  'Drink Water',
  'Stay hydrated! Goal: 2L (8 cups) per day',
  'water',
  'water_tracking',
  '{"unit": "ml", "per_increment": 250, "daily_goal": 2000, "increment_name": "cup"}'::jsonb
)
ON CONFLICT DO NOTHING;


-- =====================================================
-- STEP 3: Add tiers for new actions
-- Run after inserting actions, get IDs first:
-- SELECT id, name FROM actions WHERE name IN ('Withdraw Money', 'Drink Water');
-- =====================================================

-- Replace 'WITHDRAW_ID' and 'WATER_ID' with actual UUIDs

/*
-- Tiers for Withdraw Money
INSERT INTO action_tiers (action_id, tier_type, required_count, name, description)
VALUES
  ('WITHDRAW_ID', 'bronze', 5, 'Cash Starter', 'Withdrew money 5 times'),
  ('WITHDRAW_ID', 'silver', 25, 'ATM Regular', 'Withdrew money 25 times'),
  ('WITHDRAW_ID', 'gold', 100, 'Cash Handler', 'Withdrew money 100 times'),
  ('WITHDRAW_ID', 'platinum', 365, 'Money Master', 'Withdrew money 365 times');

-- Tiers for Drink Water (based on days where 2L goal was reached)
INSERT INTO action_tiers (action_id, tier_type, required_count, name, description)
VALUES
  ('WATER_ID', 'bronze', 7, 'Hydration Beginner', 'Reached 2L goal for 7 days'),
  ('WATER_ID', 'silver', 30, 'Hydration Habit', 'Reached 2L goal for 30 days'),
  ('WATER_ID', 'gold', 100, 'Water Champion', 'Reached 2L goal for 100 days'),
  ('WATER_ID', 'platinum', 365, 'Hydration Master', 'Reached 2L goal for 365 days');
*/


-- =====================================================
-- STEP 4: Create table for tracking daily water intake
-- =====================================================

CREATE TABLE IF NOT EXISTS user_daily_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action_id UUID REFERENCES actions(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  current_value INTEGER NOT NULL DEFAULT 0,  -- e.g., 1500 for ml of water
  goal_reached BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, action_id, date)
);

-- Enable RLS
ALTER TABLE user_daily_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own daily tracking"
  ON user_daily_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily tracking"
  ON user_daily_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily tracking"
  ON user_daily_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_user_daily_tracking_lookup
  ON user_daily_tracking(user_id, action_id, date);


-- =====================================================
-- APP CHANGES COMPLETED:
-- =====================================================
-- ✅ 1. Updated types/database.ts with special_type, special_config, UserDailyTracking
-- ✅ 2. Added icons 'atm': '🏧' and 'water': '💧' to ActionCard.tsx and Actions.tsx
-- ✅ 3. Created useWaterTracking hook (src/hooks/useWaterTracking.ts)
-- ✅ 4. Created WaterActionCard component (src/components/WaterActionCard.tsx)
-- ✅ 5. Added CSS styles for water tracking (.water-card, .water-progress, etc.)
-- ✅ 6. Updated Actions.tsx to conditionally render WaterActionCard

-- TODO: Pagination for actions list (future enhancement)
