# AlwaysUp - Project Context for Claude

## Overview
AlwaysUp is a habit/action tracking web app with gamification (XP, levels, trophies). Users track daily actions, earn trophies at milestones, and level up.

## Tech Stack
- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **Routing**: react-router-dom v7
- **Styling**: Plain CSS (index.css) with pixel art aesthetics
- **Date handling**: date-fns

## Project Structure
```
src/
├── components/
│   ├── ActionCard.tsx       # Standard action card with complete button
│   ├── WaterActionCard.tsx  # Special card for water tracking (cups, progress bar)
│   ├── AddActionModal.tsx   # Modal to add/remove active actions
│   ├── AdminActionList.tsx  # Admin: Edit existing actions
│   ├── AdminImport.tsx      # Admin: Bulk import actions via JSON
│   ├── Avatar.tsx           # User avatar with pixel art
│   ├── Layout.tsx           # Main layout wrapper
│   ├── ProgressBar.tsx      # Reusable progress bar
│   ├── ProtectedRoute.tsx   # Auth route guard
│   ├── PixelTrophy.tsx      # Pixel art trophy component
│   ├── TrophyBadge.tsx      # Trophy display badge
│   ├── TrophyCounts.tsx     # Shows trophy counts by tier
│   └── TrophyPopup.tsx      # Celebration popup when unlocking trophy
├── hooks/
│   ├── useActions.ts        # CRUD for user actions & completions
│   ├── useAuth.ts           # Supabase auth wrapper
│   ├── useProgress.ts       # Track action progress
│   ├── useStats.ts          # User XP and level stats
│   ├── useTrophies.ts       # Trophy unlocking logic
│   └── useWaterTracking.ts  # Special water tracking logic (cups/day)
├── pages/
│   ├── Actions.tsx          # Main actions page with cards
│   ├── Admin.tsx            # Admin panel (edit actions, import)
│   ├── Dashboard.tsx        # User dashboard with stats
│   ├── Login.tsx            # Auth page (login/register)
│   └── Trophies.tsx         # View all trophies
├── context/
│   └── TrophyContext.tsx    # Context for trophy popups
├── types/
│   └── database.ts          # TypeScript types for all DB tables
├── lib/
│   └── supabase.ts          # Supabase client init
└── App.tsx                  # Routes and providers
```

## Database Schema

### Core Tables
- **actions**: Master list of available actions
  - `id`, `name`, `description`, `icon_name`
  - `xp_reward`: XP gained when completing this action (default 5)
  - `special_type`: NULL (normal) | 'water_tracking' (special behavior)
  - `special_config`: JSONB for special action settings

- **action_tiers**: Trophy milestones for each action
  - `action_id`, `tier_type` (bronze/silver/gold/platinum)
  - `target_count`, `funny_title`

- **user_active_actions**: Which actions a user has enabled
  - `user_id`, `action_id`, `added_date`

- **user_progress**: Tracks completion counts
  - `user_id`, `action_id`, `current_count`, `last_completed_at`

- **user_trophies**: Earned trophies
  - `user_id`, `action_id`, `tier_type`, `unlocked_at`

- **user_stats**: XP and level data
  - `user_id`, `total_xp`

- **user_daily_tracking**: For special actions (water)
  - `user_id`, `action_id`, `date`, `current_value`, `goal_reached`

### XP System
```typescript
// Action XP is now configurable per action via xp_reward column (default 5)
// Trophy XP bonuses:
XP_VALUES = {
  TROPHY_BRONZE: 10,
  TROPHY_SILVER: 25,
  TROPHY_GOLD: 50,
  TROPHY_PLATINUM: 100
}
// Level formula: each level needs level * 100 XP (cumulative)
```

## Icon Mapping
Icons are mapped in ActionCard.tsx and AddActionModal.tsx:
```typescript
const iconMap: Record<string, string> = {
  gym: '🏋️', run: '🏃', code: '💻', read: '📚',
  meditate: '🧘', water: '💧', sleep: '😴',
  journal: '📝', walk: '🚶', bike: '🚴',
  swim: '🏊', yoga: '🧘‍♀️', stretch: '🤸',
  cook: '👨‍🍳', clean: '🧹', study: '📖',
  music: '🎵', art: '🎨', photo: '📷',
  game: '🎮', social: '👥', family: '👨‍👩‍👧',
  pet: '🐕', plant: '🌱', finance: '💰',
  atm: '🏧', default: '⭐'
}
```

## Special Actions

### Water Tracking (`special_type: 'water_tracking'`)
- Config: `{ unit: 'ml', per_increment: 250, daily_goal: 2000, increment_name: 'cup' }`
- Shows 8 cup icons (filled/empty based on progress)
- Uses `user_daily_tracking` table for daily state
- Progress counts days where goal was reached (for trophies)

## Styling Notes
- Pixel art aesthetic throughout
- Gender symbols on login use CSS `box-shadow` pixel art technique
- Trophy colors: bronze (#CD7F32), silver (#C0C0C0), gold (#FFD700), platinum (#E5E4E2)
- Main colors defined in CSS variables in index.css

## SQL Files
- `sql/schema.sql` - Single source of truth for Supabase (all tables, actions, tiers, RLS)

## Environments
Vite automatically loads the correct env file based on mode:

- `.env.development` - Dev Supabase project (used by `npm run dev`)
- `.env.production` - Prod Supabase project (used by `npm run build`)

```bash
npm run dev      # Development mode → .env.development
npm run build    # Production build → .env.production
npm run preview  # Preview prod build → .env.production
```

## Known Patterns

### Adding a new normal action
1. Add INSERT to actions table with name, description, icon_name
2. Add tiers with target_count milestones
3. Add icon emoji to iconMap in ActionCard.tsx and AddActionModal.tsx

### Adding a new special action
1. Define new `special_type` in database.ts
2. Create config interface if needed
3. Create custom card component (like WaterActionCard)
4. Create custom hook for the tracking logic
5. Update Actions.tsx to conditionally render the special card

### Modal state sync pattern
When modal opens, sync local state with props:
```typescript
useEffect(() => {
  if (isOpen) {
    setSelected(new Set(activeActionIds))
  }
}, [isOpen, activeActionIds])
```

## Recent Changes (March 2024)
- Added pixel art gender symbols for registration (CSS box-shadow technique)
- Added special action type system with `special_type` column
- Created water tracking feature (8 cups = 2L daily goal)
- Added "Withdraw Money" and "Drink Water" actions (27 total actions)
- Fixed modal sync bug where recommendations weren't reflected
- Consolidated SQL into single `sql/schema.sql` file
- Set up dev/prod environments with `.env.development` and `.env.production`
- Added Admin panel (/admin route) with:
  - Edit Actions tab: Edit name, description, XP reward, and tier requirements
  - Import JSON tab: Bulk import new actions with trophies via JSON
- Added `xp_reward` column to actions table for per-action XP configuration
- Migration file: `sql/add_xp_reward.sql` (run on existing DB)

## Future Enhancements (noted as TODO)
- Pagination for actions list
- Drag and drop for action reordering
- More special action types (counter, timer, etc.)
