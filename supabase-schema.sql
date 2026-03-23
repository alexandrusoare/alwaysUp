-- AlwaysUp Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Actions (predefined, not user-customizable)
CREATE TABLE actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon_name VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tiers per action - each tier has its own funny title!
CREATE TABLE action_tiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_id UUID REFERENCES actions(id) ON DELETE CASCADE,
  tier_type VARCHAR(20) NOT NULL CHECK (tier_type IN ('bronze', 'silver', 'gold', 'platinum')),
  target_count INTEGER NOT NULL,
  funny_title VARCHAR(150) NOT NULL,
  UNIQUE(action_id, tier_type)
);

-- User progress tracking (last_completed_at used for once-per-day limit)
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_id UUID REFERENCES actions(id) ON DELETE CASCADE,
  current_count INTEGER DEFAULT 0,
  last_completed_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, action_id)
);

-- Unlocked trophies
CREATE TABLE user_trophies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_id UUID REFERENCES actions(id) ON DELETE CASCADE,
  tier_type VARCHAR(20) NOT NULL CHECK (tier_type IN ('bronze', 'silver', 'gold', 'platinum')),
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, action_id, tier_type)
);

-- User stats (XP and level tracking)
CREATE TABLE user_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User active actions (which actions show on Today page - resets daily)
CREATE TABLE user_active_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_id UUID REFERENCES actions(id) ON DELETE CASCADE,
  added_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, action_id, added_date)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_trophies_user_id ON user_trophies(user_id);
CREATE INDEX idx_user_trophies_unlocked_at ON user_trophies(unlocked_at DESC);
CREATE INDEX idx_action_tiers_action_id ON action_tiers(action_id);
CREATE INDEX idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX idx_user_active_actions_user_id ON user_active_actions(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_active_actions ENABLE ROW LEVEL SECURITY;

-- Actions and tiers are read-only for all authenticated users
CREATE POLICY "Actions are viewable by authenticated users"
  ON actions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Action tiers are viewable by authenticated users"
  ON action_tiers FOR SELECT
  TO authenticated
  USING (true);

-- Users can only access their own progress
CREATE POLICY "Users can view own progress"
  ON user_progress FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON user_progress FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON user_progress FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can only access their own trophies
CREATE POLICY "Users can view own trophies"
  ON user_trophies FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trophies"
  ON user_trophies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can only access their own stats
CREATE POLICY "Users can view own stats"
  ON user_stats FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats"
  ON user_stats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats"
  ON user_stats FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can manage their own active actions
CREATE POLICY "Users can view own active actions"
  ON user_active_actions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own active actions"
  ON user_active_actions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own active actions"
  ON user_active_actions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- SEED DATA
-- ============================================

-- Insert predefined actions
INSERT INTO actions (id, name, description, icon_name) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Make your bed', 'Start the day with discipline', 'bed'),
  ('a1000000-0000-0000-0000-000000000002', 'Wash dishes', 'Clean those plates!', 'dishes'),
  ('a1000000-0000-0000-0000-000000000003', 'Brush teeth', 'Oral hygiene champion', 'teeth'),
  ('a1000000-0000-0000-0000-000000000004', 'Boxing training', 'Train like a champion', 'boxing'),
  ('a1000000-0000-0000-0000-000000000005', 'Jump rope', 'Skip your way to fitness', 'jumprope'),
  ('a1000000-0000-0000-0000-000000000006', 'Cook a meal', 'Home chef in training', 'cooking'),
  ('a1000000-0000-0000-0000-000000000007', 'Contribute to code', 'Shape the future of AlwaysUp', 'gamemaster'),
  ('a1000000-0000-0000-0000-000000000008', 'Meditate', 'Find your inner peace', 'meditation'),
  ('a1000000-0000-0000-0000-000000000009', 'Wash your face', 'Skincare routine', 'face'),
  ('a1000000-0000-0000-0000-000000000010', 'Wash clothes', 'Laundry day champion', 'laundry'),
  ('a1000000-0000-0000-0000-000000000011', 'Read', 'Expand your mind', 'reading'),
  ('a1000000-0000-0000-0000-000000000012', 'Pay yourself dividends', 'Financial self-care', 'dividends'),
  ('a1000000-0000-0000-0000-000000000013', 'Networking event', 'Build your connections', 'networking'),
  ('a1000000-0000-0000-0000-000000000014', 'Work session', 'Get things done', 'work'),
  ('a1000000-0000-0000-0000-000000000015', 'Go to the gym', 'Build that body', 'gym'),
  ('a1000000-0000-0000-0000-000000000016', 'Drink tea', 'Moment of calm', 'tea'),
  ('a1000000-0000-0000-0000-000000000017', 'Take vitamins', 'Health boost', 'vitamins'),
  ('a1000000-0000-0000-0000-000000000018', 'Cut hand nails', 'Grooming essentials', 'handnails'),
  ('a1000000-0000-0000-0000-000000000019', 'Cut feet nails', 'Foot care matters', 'feetnails'),
  ('a1000000-0000-0000-0000-000000000020', 'Prepare accountant docs', 'Financial organization', 'accountant'),
  ('a1000000-0000-0000-0000-000000000021', 'Play video games', 'Guilt-free gaming', 'gaming'),
  ('a1000000-0000-0000-0000-000000000022', 'Call your mom', 'Family connection', 'callmom'),
  ('a1000000-0000-0000-0000-000000000023', 'See your family', 'Quality family time', 'family'),
  ('a1000000-0000-0000-0000-000000000024', 'Book flight tickets', 'Adventure awaits', 'flight'),
  ('a1000000-0000-0000-0000-000000000025', 'Book accommodation', 'Plan your stay', 'hotel');

-- Insert tiers for each action with unique funny titles

-- Make your bed
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'bronze', 3, 'Blanket Beginner'),
  ('a1000000-0000-0000-0000-000000000001', 'silver', 7, 'Sheet Sergeant'),
  ('a1000000-0000-0000-0000-000000000001', 'gold', 21, 'Duvet Duke'),
  ('a1000000-0000-0000-0000-000000000001', 'platinum', 365, 'Bed Commander');

-- Wash dishes
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000002', 'bronze', 3, 'Sponge Apprentice'),
  ('a1000000-0000-0000-0000-000000000002', 'silver', 7, 'Soap Soldier'),
  ('a1000000-0000-0000-0000-000000000002', 'gold', 21, 'Rinse Captain'),
  ('a1000000-0000-0000-0000-000000000002', 'platinum', 365, 'Dish Destroyer');

-- Brush teeth
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000003', 'bronze', 3, 'Minty Rookie'),
  ('a1000000-0000-0000-0000-000000000003', 'silver', 7, 'Floss Fighter'),
  ('a1000000-0000-0000-0000-000000000003', 'gold', 21, 'Cavity Crusher'),
  ('a1000000-0000-0000-0000-000000000003', 'platinum', 365, 'Enamel Guardian');

-- Boxing training
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000004', 'bronze', 3, 'Punching Padawan'),
  ('a1000000-0000-0000-0000-000000000004', 'silver', 10, 'Jab Journeyman'),
  ('a1000000-0000-0000-0000-000000000004', 'gold', 30, 'Hook Hero'),
  ('a1000000-0000-0000-0000-000000000004', 'platinum', 100, 'Ring Warrior');

-- Jump rope
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000005', 'bronze', 3, 'Skip Starter'),
  ('a1000000-0000-0000-0000-000000000005', 'silver', 10, 'Rope Rookie'),
  ('a1000000-0000-0000-0000-000000000005', 'gold', 30, 'Jump Jedi'),
  ('a1000000-0000-0000-0000-000000000005', 'platinum', 100, 'Skip Lord');

-- Cook a meal
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000006', 'bronze', 3, 'Microwave Minion'),
  ('a1000000-0000-0000-0000-000000000006', 'silver', 10, 'Pan Padawan'),
  ('a1000000-0000-0000-0000-000000000006', 'gold', 30, 'Stove Sorcerer'),
  ('a1000000-0000-0000-0000-000000000006', 'platinum', 100, 'Kitchen King');

-- Contribute to code (Game Master trophies)
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000007', 'bronze', 1, 'First Commit'),
  ('a1000000-0000-0000-0000-000000000007', 'silver', 5, 'Bug Squasher'),
  ('a1000000-0000-0000-0000-000000000007', 'gold', 15, 'Feature Forger'),
  ('a1000000-0000-0000-0000-000000000007', 'platinum', 50, 'Code Architect');

-- Meditate
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000008', 'bronze', 3, 'Breath Beginner'),
  ('a1000000-0000-0000-0000-000000000008', 'silver', 10, 'Zen Seeker'),
  ('a1000000-0000-0000-0000-000000000008', 'gold', 30, 'Mind Master'),
  ('a1000000-0000-0000-0000-000000000008', 'platinum', 100, 'Inner Peace Guru');

-- Wash your face
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000009', 'bronze', 3, 'Splash Starter'),
  ('a1000000-0000-0000-0000-000000000009', 'silver', 7, 'Pore Purifier'),
  ('a1000000-0000-0000-0000-000000000009', 'gold', 21, 'Glow Getter'),
  ('a1000000-0000-0000-0000-000000000009', 'platinum', 365, 'Skincare Sovereign');

-- Wash clothes
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000010', 'bronze', 3, 'Spin Cycle Starter'),
  ('a1000000-0000-0000-0000-000000000010', 'silver', 10, 'Detergent Deputy'),
  ('a1000000-0000-0000-0000-000000000010', 'gold', 30, 'Fabric Freshener'),
  ('a1000000-0000-0000-0000-000000000010', 'platinum', 100, 'Laundry Legend');

-- Read
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000011', 'bronze', 3, 'Page Turner'),
  ('a1000000-0000-0000-0000-000000000011', 'silver', 10, 'Bookworm'),
  ('a1000000-0000-0000-0000-000000000011', 'gold', 30, 'Literary Lion'),
  ('a1000000-0000-0000-0000-000000000011', 'platinum', 100, 'Knowledge Keeper');

-- Pay yourself dividends
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000012', 'bronze', 1, 'First Dividend'),
  ('a1000000-0000-0000-0000-000000000012', 'silver', 6, 'Quarterly Achiever'),
  ('a1000000-0000-0000-0000-000000000012', 'gold', 12, 'Annual Earner'),
  ('a1000000-0000-0000-0000-000000000012', 'platinum', 50, 'Dividend Dynasty');

-- Networking event
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000013', 'bronze', 1, 'Card Collector'),
  ('a1000000-0000-0000-0000-000000000013', 'silver', 5, 'Handshake Hero'),
  ('a1000000-0000-0000-0000-000000000013', 'gold', 15, 'Connection King'),
  ('a1000000-0000-0000-0000-000000000013', 'platinum', 50, 'Network Ninja');

-- Work session
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000014', 'bronze', 5, 'Task Tackler'),
  ('a1000000-0000-0000-0000-000000000014', 'silver', 20, 'Productivity Pro'),
  ('a1000000-0000-0000-0000-000000000014', 'gold', 50, 'Work Warrior'),
  ('a1000000-0000-0000-0000-000000000014', 'platinum', 200, 'Career Champion');

-- Go to the gym
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000015', 'bronze', 3, 'Gym Newbie'),
  ('a1000000-0000-0000-0000-000000000015', 'silver', 10, 'Iron Initiate'),
  ('a1000000-0000-0000-0000-000000000015', 'gold', 30, 'Fitness Fanatic'),
  ('a1000000-0000-0000-0000-000000000015', 'platinum', 100, 'Gym God');

-- Drink tea
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000016', 'bronze', 3, 'Tea Taster'),
  ('a1000000-0000-0000-0000-000000000016', 'silver', 10, 'Brew Buddy'),
  ('a1000000-0000-0000-0000-000000000016', 'gold', 30, 'Steep Specialist'),
  ('a1000000-0000-0000-0000-000000000016', 'platinum', 100, 'Tea Ceremony Master');

-- Take vitamins
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000017', 'bronze', 7, 'Vitamin Virgin'),
  ('a1000000-0000-0000-0000-000000000017', 'silver', 30, 'Supplement Soldier'),
  ('a1000000-0000-0000-0000-000000000017', 'gold', 90, 'Nutrient Ninja'),
  ('a1000000-0000-0000-0000-000000000017', 'platinum', 365, 'Health Hacker');

-- Cut hand nails
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000018', 'bronze', 2, 'Clipper Cadet'),
  ('a1000000-0000-0000-0000-000000000018', 'silver', 6, 'Manicure Mate'),
  ('a1000000-0000-0000-0000-000000000018', 'gold', 12, 'Nail Nurturer'),
  ('a1000000-0000-0000-0000-000000000018', 'platinum', 52, 'Grooming Guru');

-- Cut feet nails
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000019', 'bronze', 2, 'Toe Trimmer'),
  ('a1000000-0000-0000-0000-000000000019', 'silver', 6, 'Pedicure Pal'),
  ('a1000000-0000-0000-0000-000000000019', 'gold', 12, 'Foot Fixer'),
  ('a1000000-0000-0000-0000-000000000019', 'platinum', 52, 'Sole Sovereign');

-- Prepare accountant docs
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000020', 'bronze', 1, 'Receipt Rookie'),
  ('a1000000-0000-0000-0000-000000000020', 'silver', 4, 'Quarterly Filer'),
  ('a1000000-0000-0000-0000-000000000020', 'gold', 12, 'Tax Tactician'),
  ('a1000000-0000-0000-0000-000000000020', 'platinum', 50, 'Financial Wizard');

-- Play video games
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000021', 'bronze', 3, 'Casual Gamer'),
  ('a1000000-0000-0000-0000-000000000021', 'silver', 10, 'Controller Commander'),
  ('a1000000-0000-0000-0000-000000000021', 'gold', 30, 'Boss Beater'),
  ('a1000000-0000-0000-0000-000000000021', 'platinum', 100, 'Gaming Legend');

-- Call your mom
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000022', 'bronze', 3, 'Good Child'),
  ('a1000000-0000-0000-0000-000000000022', 'silver', 10, 'Caring Caller'),
  ('a1000000-0000-0000-0000-000000000022', 'gold', 30, 'Family First'),
  ('a1000000-0000-0000-0000-000000000022', 'platinum', 100, 'Mommas Pride');

-- See your family
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000023', 'bronze', 2, 'Family Face'),
  ('a1000000-0000-0000-0000-000000000023', 'silver', 6, 'Reunion Regular'),
  ('a1000000-0000-0000-0000-000000000023', 'gold', 12, 'Gathering Guru'),
  ('a1000000-0000-0000-0000-000000000023', 'platinum', 52, 'Family Pillar');

-- Book flight tickets
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000024', 'bronze', 1, 'First Flight'),
  ('a1000000-0000-0000-0000-000000000024', 'silver', 5, 'Sky Hopper'),
  ('a1000000-0000-0000-0000-000000000024', 'gold', 15, 'Frequent Flyer'),
  ('a1000000-0000-0000-0000-000000000024', 'platinum', 50, 'Globe Trotter');

-- Book accommodation
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000025', 'bronze', 1, 'First Booking'),
  ('a1000000-0000-0000-0000-000000000025', 'silver', 5, 'Hotel Hunter'),
  ('a1000000-0000-0000-0000-000000000025', 'gold', 15, 'Stay Specialist'),
  ('a1000000-0000-0000-0000-000000000025', 'platinum', 50, 'Accommodation Ace');
