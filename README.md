# AlwaysUp - Real Life Trophies

A gamified habit tracker inspired by PlayStation's trophy system. Turn your daily routines into achievements and level up your life.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase) ![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)

## What is AlwaysUp?

AlwaysUp transforms mundane daily tasks into an RPG-style progression system. Complete actions like "Make your bed" or "Go to the gym" to earn XP, unlock trophies, and level up your character.

### Features

- **Daily Quests** - Add actions to your daily list and complete them once per day
- **Trophy System** - Unlock Bronze, Silver, Gold, and Platinum trophies for each action
- **XP & Leveling** - Earn experience points and watch your level grow
- **Funny Achievement Titles** - Each trophy has a unique humorous title (e.g., "Blanket Beginner", "Gym God")
- **Daily Reset** - Your quest list resets at midnight for a fresh start
- **Mobile-First Design** - Responsive pixelated RPG aesthetic that works on all devices

### Trophy Tiers

| Tier | Example Title | XP Reward |
|------|---------------|-----------|
| Bronze | "Blanket Beginner" | 25 XP |
| Silver | "Sheet Sergeant" | 50 XP |
| Gold | "Duvet Duke" | 100 XP |
| Platinum | "Bed Commander" | 250 XP |

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (Auth + PostgreSQL)
- **Styling**: CSS with pixel art aesthetic
- **Font**: Press Start 2P (Google Fonts)

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/alwaysup.git
cd alwaysup
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL from `supabase-schema.sql` in your SQL Editor
   - Copy your project URL and anon key

4. Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

5. Start the development server:
```bash
npm run dev
```

## Available Actions

The app comes with 25 pre-configured actions:

| Category | Actions |
|----------|---------|
| **Health** | Brush teeth, Take vitamins, Go to the gym, Meditate |
| **Home** | Make your bed, Wash dishes, Wash clothes, Cook a meal |
| **Self-care** | Wash your face, Cut hand nails, Cut feet nails |
| **Productivity** | Work session, Read, Prepare accountant docs |
| **Social** | Call your mom, See your family, Networking event |
| **Fitness** | Boxing training, Jump rope |
| **Leisure** | Play video games, Drink tea |
| **Travel** | Book flight tickets, Book accommodation |
| **Finance** | Pay yourself dividends |
| **Dev** | Contribute to code |

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # React context (Trophy popups)
├── hooks/          # Custom hooks (auth, actions, stats)
├── lib/            # Supabase client
├── pages/          # Route pages (Dashboard, Actions, Trophies)
└── types/          # TypeScript definitions
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

## License

MIT

---

Built with discipline and consistency.
