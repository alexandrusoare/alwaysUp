export type TierType = 'bronze' | 'silver' | 'gold' | 'platinum'

export type SpecialActionType = 'water_tracking' | null

export interface WaterTrackingConfig {
  unit: string           // 'ml'
  per_increment: number  // 250 (ml per cup)
  daily_goal: number     // 2000 (2L)
  increment_name: string // 'cup'
}

export interface Action {
  id: string
  name: string
  description: string | null
  icon_name: string | null
  xp_reward: number
  special_type: SpecialActionType
  special_config: WaterTrackingConfig | null
  created_at: string
}

export interface ActionTier {
  id: string
  action_id: string
  tier_type: TierType
  target_count: number
  funny_title: string
}

export interface UserProgress {
  id: string
  user_id: string
  action_id: string
  current_count: number
  last_completed_at: string | null
  created_at: string
}

export interface UserTrophy {
  id: string
  user_id: string
  action_id: string
  tier_type: TierType
  unlocked_at: string
}

export interface UserStats {
  id: string
  user_id: string
  total_xp: number
  created_at: string
  updated_at: string
}

export interface UserActiveAction {
  id: string
  user_id: string
  action_id: string
  added_date: string
}

// XP values for different actions
export const XP_VALUES = {
  ACTION_COMPLETE: 5,    // XP per daily action completion
  TROPHY_BRONZE: 10,
  TROPHY_SILVER: 25,
  TROPHY_GOLD: 50,
  TROPHY_PLATINUM: 100,
} as const

// Level calculation helpers
export const calculateLevel = (xp: number): number => {
  // Level formula: each level requires level * 100 XP
  // Level 1: 0 XP, Level 2: 100 XP, Level 3: 300 XP (cumulative)
  // Using quadratic formula to solve: level = floor((sqrt(1 + 8*xp/100) - 1) / 2) + 1
  if (xp <= 0) return 1
  const level = Math.floor((Math.sqrt(1 + (8 * xp) / 100) - 1) / 2) + 1
  return Math.max(1, level)
}

export const getXpForLevel = (level: number): number => {
  // Total XP needed to reach this level
  // Sum of 100 + 200 + 300 + ... + (level-1)*100 = 100 * (level-1) * level / 2
  if (level <= 1) return 0
  return 50 * (level - 1) * level
}

export const getXpProgress = (xp: number): { current: number; needed: number; percentage: number } => {
  const level = calculateLevel(xp)
  const currentLevelXp = getXpForLevel(level)
  const nextLevelXp = getXpForLevel(level + 1)
  const xpIntoLevel = xp - currentLevelXp
  const xpNeeded = nextLevelXp - currentLevelXp
  return {
    current: xpIntoLevel,
    needed: xpNeeded,
    percentage: Math.min((xpIntoLevel / xpNeeded) * 100, 100)
  }
}

// Combined type for UI convenience
export interface ActionWithProgress extends Action {
  tiers: ActionTier[]
  progress: UserProgress | null
  unlockedTiers: TierType[]
  dailyTracking?: UserDailyTracking | null  // For special actions like water
}

// Trophy with action info for display
export interface TrophyWithAction extends UserTrophy {
  action: Action
  tier: ActionTier
}

// Daily tracking for special actions (water, etc.)
export interface UserDailyTracking {
  id: string
  user_id: string
  action_id: string
  date: string
  current_value: number  // e.g., 1500 for ml of water
  goal_reached: boolean
  created_at: string
  updated_at: string
}

// Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      actions: {
        Row: Action
        Insert: Omit<Action, 'id' | 'created_at'>
        Update: Partial<Omit<Action, 'id'>>
      }
      action_tiers: {
        Row: ActionTier
        Insert: Omit<ActionTier, 'id'>
        Update: Partial<Omit<ActionTier, 'id'>>
      }
      user_progress: {
        Row: UserProgress
        Insert: Omit<UserProgress, 'id' | 'created_at'>
        Update: Partial<Omit<UserProgress, 'id'>>
      }
      user_trophies: {
        Row: UserTrophy
        Insert: Omit<UserTrophy, 'id' | 'unlocked_at'>
        Update: Partial<Omit<UserTrophy, 'id'>>
      }
      user_stats: {
        Row: UserStats
        Insert: Omit<UserStats, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserStats, 'id'>>
      }
      user_active_actions: {
        Row: UserActiveAction
        Insert: Omit<UserActiveAction, 'id'>
        Update: Partial<Omit<UserActiveAction, 'id'>>
      }
      user_daily_tracking: {
        Row: UserDailyTracking
        Insert: Omit<UserDailyTracking, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserDailyTracking, 'id'>>
      }
    }
  }
}
