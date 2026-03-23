import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { TrophyWithAction, UserTrophy, Action, ActionTier } from '../types/database'

interface TrophyCounts {
  bronze: number
  silver: number
  gold: number
  platinum: number
  total: number
}

export function useTrophies(userId: string | undefined) {
  const [trophies, setTrophies] = useState<TrophyWithAction[]>([])
  const [counts, setCounts] = useState<TrophyCounts>({
    bronze: 0,
    silver: 0,
    gold: 0,
    platinum: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTrophies = async () => {
    if (!userId) return

    setLoading(true)
    try {
      // Fetch trophies with action info
      const { data: trophiesData, error: trophiesError } = await supabase
        .from('user_trophies')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false })

      if (trophiesError) throw trophiesError

      // Fetch actions
      const { data: actionsData, error: actionsError } = await supabase
        .from('actions')
        .select('*')

      if (actionsError) throw actionsError

      // Fetch tiers
      const { data: tiersData, error: tiersError } = await supabase
        .from('action_tiers')
        .select('*')

      if (tiersError) throw tiersError

      // Cast data to proper types
      const trophiesList = trophiesData as UserTrophy[]
      const actionsList = actionsData as Action[]
      const tiersList = tiersData as ActionTier[]

      // Combine data
      const combined: TrophyWithAction[] = trophiesList.map(trophy => {
        const action = actionsList.find(a => a.id === trophy.action_id)!
        const tier = tiersList.find(t =>
          t.action_id === trophy.action_id && t.tier_type === trophy.tier_type
        )!
        return { ...trophy, action, tier }
      })

      setTrophies(combined)

      // Calculate counts
      const newCounts: TrophyCounts = {
        bronze: trophiesList.filter(t => t.tier_type === 'bronze').length,
        silver: trophiesList.filter(t => t.tier_type === 'silver').length,
        gold: trophiesList.filter(t => t.tier_type === 'gold').length,
        platinum: trophiesList.filter(t => t.tier_type === 'platinum').length,
        total: trophiesList.length
      }
      setCounts(newCounts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trophies')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrophies()
  }, [userId])

  return { trophies, counts, loading, error, refetch: fetchTrophies }
}
