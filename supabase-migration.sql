-- ============================================
-- MIGRATION: Add daily reset and new actions
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Add added_date column to user_active_actions for daily reset
ALTER TABLE user_active_actions
ADD COLUMN IF NOT EXISTS added_date DATE DEFAULT CURRENT_DATE;

-- 2. Drop old unique constraint and add new one with added_date
ALTER TABLE user_active_actions
DROP CONSTRAINT IF EXISTS user_active_actions_user_id_action_id_key;

ALTER TABLE user_active_actions
ADD CONSTRAINT user_active_actions_user_id_action_id_added_date_key
UNIQUE(user_id, action_id, added_date);

-- 3. Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_active_actions_date
ON user_active_actions(user_id, added_date);

-- ============================================
-- NEW ACTIONS (19 new actions)
-- ============================================

INSERT INTO actions (id, name, description, icon_name) VALUES
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
  ('a1000000-0000-0000-0000-000000000025', 'Book accommodation', 'Plan your stay', 'hotel')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- NEW ACTION TIERS
-- ============================================

-- Contribute to code (Game Master trophies)
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000007', 'bronze', 1, 'First Commit'),
  ('a1000000-0000-0000-0000-000000000007', 'silver', 5, 'Bug Squasher'),
  ('a1000000-0000-0000-0000-000000000007', 'gold', 15, 'Feature Forger'),
  ('a1000000-0000-0000-0000-000000000007', 'platinum', 50, 'Code Architect')
ON CONFLICT (action_id, tier_type) DO NOTHING;

-- Meditate
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000008', 'bronze', 3, 'Breath Beginner'),
  ('a1000000-0000-0000-0000-000000000008', 'silver', 10, 'Zen Seeker'),
  ('a1000000-0000-0000-0000-000000000008', 'gold', 30, 'Mind Master'),
  ('a1000000-0000-0000-0000-000000000008', 'platinum', 100, 'Inner Peace Guru')
ON CONFLICT (action_id, tier_type) DO NOTHING;

-- Wash your face
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000009', 'bronze', 3, 'Splash Starter'),
  ('a1000000-0000-0000-0000-000000000009', 'silver', 7, 'Pore Purifier'),
  ('a1000000-0000-0000-0000-000000000009', 'gold', 21, 'Glow Getter'),
  ('a1000000-0000-0000-0000-000000000009', 'platinum', 365, 'Skincare Sovereign')
ON CONFLICT (action_id, tier_type) DO NOTHING;

-- Wash clothes
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000010', 'bronze', 3, 'Spin Cycle Starter'),
  ('a1000000-0000-0000-0000-000000000010', 'silver', 10, 'Detergent Deputy'),
  ('a1000000-0000-0000-0000-000000000010', 'gold', 30, 'Fabric Freshener'),
  ('a1000000-0000-0000-0000-000000000010', 'platinum', 100, 'Laundry Legend')
ON CONFLICT (action_id, tier_type) DO NOTHING;

-- Read
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000011', 'bronze', 3, 'Page Turner'),
  ('a1000000-0000-0000-0000-000000000011', 'silver', 10, 'Bookworm'),
  ('a1000000-0000-0000-0000-000000000011', 'gold', 30, 'Literary Lion'),
  ('a1000000-0000-0000-0000-000000000011', 'platinum', 100, 'Knowledge Keeper')
ON CONFLICT (action_id, tier_type) DO NOTHING;

-- Pay yourself dividends
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000012', 'bronze', 1, 'First Dividend'),
  ('a1000000-0000-0000-0000-000000000012', 'silver', 6, 'Quarterly Achiever'),
  ('a1000000-0000-0000-0000-000000000012', 'gold', 12, 'Annual Earner'),
  ('a1000000-0000-0000-0000-000000000012', 'platinum', 50, 'Dividend Dynasty')
ON CONFLICT (action_id, tier_type) DO NOTHING;

-- Networking event
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000013', 'bronze', 1, 'Card Collector'),
  ('a1000000-0000-0000-0000-000000000013', 'silver', 5, 'Handshake Hero'),
  ('a1000000-0000-0000-0000-000000000013', 'gold', 15, 'Connection King'),
  ('a1000000-0000-0000-0000-000000000013', 'platinum', 50, 'Network Ninja')
ON CONFLICT (action_id, tier_type) DO NOTHING;

-- Work session
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000014', 'bronze', 5, 'Task Tackler'),
  ('a1000000-0000-0000-0000-000000000014', 'silver', 20, 'Productivity Pro'),
  ('a1000000-0000-0000-0000-000000000014', 'gold', 50, 'Work Warrior'),
  ('a1000000-0000-0000-0000-000000000014', 'platinum', 200, 'Career Champion')
ON CONFLICT (action_id, tier_type) DO NOTHING;

-- Go to the gym
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000015', 'bronze', 3, 'Gym Newbie'),
  ('a1000000-0000-0000-0000-000000000015', 'silver', 10, 'Iron Initiate'),
  ('a1000000-0000-0000-0000-000000000015', 'gold', 30, 'Fitness Fanatic'),
  ('a1000000-0000-0000-0000-000000000015', 'platinum', 100, 'Gym God')
ON CONFLICT (action_id, tier_type) DO NOTHING;

-- Drink tea
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000016', 'bronze', 3, 'Tea Taster'),
  ('a1000000-0000-0000-0000-000000000016', 'silver', 10, 'Brew Buddy'),
  ('a1000000-0000-0000-0000-000000000016', 'gold', 30, 'Steep Specialist'),
  ('a1000000-0000-0000-0000-000000000016', 'platinum', 100, 'Tea Ceremony Master')
ON CONFLICT (action_id, tier_type) DO NOTHING;

-- Take vitamins
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000017', 'bronze', 7, 'Vitamin Virgin'),
  ('a1000000-0000-0000-0000-000000000017', 'silver', 30, 'Supplement Soldier'),
  ('a1000000-0000-0000-0000-000000000017', 'gold', 90, 'Nutrient Ninja'),
  ('a1000000-0000-0000-0000-000000000017', 'platinum', 365, 'Health Hacker')
ON CONFLICT (action_id, tier_type) DO NOTHING;

-- Cut hand nails
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000018', 'bronze', 2, 'Clipper Cadet'),
  ('a1000000-0000-0000-0000-000000000018', 'silver', 6, 'Manicure Mate'),
  ('a1000000-0000-0000-0000-000000000018', 'gold', 12, 'Nail Nurturer'),
  ('a1000000-0000-0000-0000-000000000018', 'platinum', 52, 'Grooming Guru')
ON CONFLICT (action_id, tier_type) DO NOTHING;

-- Cut feet nails
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000019', 'bronze', 2, 'Toe Trimmer'),
  ('a1000000-0000-0000-0000-000000000019', 'silver', 6, 'Pedicure Pal'),
  ('a1000000-0000-0000-0000-000000000019', 'gold', 12, 'Foot Fixer'),
  ('a1000000-0000-0000-0000-000000000019', 'platinum', 52, 'Sole Sovereign')
ON CONFLICT (action_id, tier_type) DO NOTHING;

-- Prepare accountant docs
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000020', 'bronze', 1, 'Receipt Rookie'),
  ('a1000000-0000-0000-0000-000000000020', 'silver', 4, 'Quarterly Filer'),
  ('a1000000-0000-0000-0000-000000000020', 'gold', 12, 'Tax Tactician'),
  ('a1000000-0000-0000-0000-000000000020', 'platinum', 50, 'Financial Wizard')
ON CONFLICT (action_id, tier_type) DO NOTHING;

-- Play video games
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000021', 'bronze', 3, 'Casual Gamer'),
  ('a1000000-0000-0000-0000-000000000021', 'silver', 10, 'Controller Commander'),
  ('a1000000-0000-0000-0000-000000000021', 'gold', 30, 'Boss Beater'),
  ('a1000000-0000-0000-0000-000000000021', 'platinum', 100, 'Gaming Legend')
ON CONFLICT (action_id, tier_type) DO NOTHING;

-- Call your mom
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000022', 'bronze', 3, 'Good Child'),
  ('a1000000-0000-0000-0000-000000000022', 'silver', 10, 'Caring Caller'),
  ('a1000000-0000-0000-0000-000000000022', 'gold', 30, 'Family First'),
  ('a1000000-0000-0000-0000-000000000022', 'platinum', 100, 'Mommas Pride')
ON CONFLICT (action_id, tier_type) DO NOTHING;

-- See your family
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000023', 'bronze', 2, 'Family Face'),
  ('a1000000-0000-0000-0000-000000000023', 'silver', 6, 'Reunion Regular'),
  ('a1000000-0000-0000-0000-000000000023', 'gold', 12, 'Gathering Guru'),
  ('a1000000-0000-0000-0000-000000000023', 'platinum', 52, 'Family Pillar')
ON CONFLICT (action_id, tier_type) DO NOTHING;

-- Book flight tickets
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000024', 'bronze', 1, 'First Flight'),
  ('a1000000-0000-0000-0000-000000000024', 'silver', 5, 'Sky Hopper'),
  ('a1000000-0000-0000-0000-000000000024', 'gold', 15, 'Frequent Flyer'),
  ('a1000000-0000-0000-0000-000000000024', 'platinum', 50, 'Globe Trotter')
ON CONFLICT (action_id, tier_type) DO NOTHING;

-- Book accommodation
INSERT INTO action_tiers (action_id, tier_type, target_count, funny_title) VALUES
  ('a1000000-0000-0000-0000-000000000025', 'bronze', 1, 'First Booking'),
  ('a1000000-0000-0000-0000-000000000025', 'silver', 5, 'Hotel Hunter'),
  ('a1000000-0000-0000-0000-000000000025', 'gold', 15, 'Stay Specialist'),
  ('a1000000-0000-0000-0000-000000000025', 'platinum', 50, 'Accommodation Ace')
ON CONFLICT (action_id, tier_type) DO NOTHING;
