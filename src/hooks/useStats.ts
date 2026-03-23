import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { UserStats, TierType } from '../types/database'
import { XP_VALUES, calculateLevel, getXpProgress } from '../types/database'

export function useStats(userId: string | undefined) {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    if (!userId) return

    setLoading(true)
    try {
      const { data, error: fetchError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (fetchError) {
        // If no stats exist yet, create them
        if (fetchError.code === 'PGRST116') {
          const { data: newStats, error: insertError } = await supabase
            .from('user_stats')
            .insert({ user_id: userId, total_xp: 0 })
            .select()
            .single()

          if (insertError) throw insertError
          setStats(newStats)
        } else {
          throw fetchError
        }
      } else {
        setStats(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [userId])

  const addXp = async (amount: number): Promise<{ newXp: number; leveledUp: boolean; newLevel: number }> => {
    if (!userId || !stats) throw new Error('Not authenticated or stats not loaded')

    const oldLevel = calculateLevel(stats.total_xp)
    const newXp = stats.total_xp + amount

    const { error: updateError } = await supabase
      .from('user_stats')
      .update({ total_xp: newXp, updated_at: new Date().toISOString() })
      .eq('user_id', userId)

    if (updateError) throw updateError

    const newLevel = calculateLevel(newXp)
    const leveledUp = newLevel > oldLevel

    // Update local state
    setStats(prev => prev ? { ...prev, total_xp: newXp } : null)

    return { newXp, leveledUp, newLevel }
  }

  const getXpForTrophy = (tierType: TierType): number => {
    switch (tierType) {
      case 'bronze': return XP_VALUES.TROPHY_BRONZE
      case 'silver': return XP_VALUES.TROPHY_SILVER
      case 'gold': return XP_VALUES.TROPHY_GOLD
      case 'platinum': return XP_VALUES.TROPHY_PLATINUM
      default: return 0
    }
  }

  const level = stats ? calculateLevel(stats.total_xp) : 1
  const xpProgress = stats ? getXpProgress(stats.total_xp) : { current: 0, needed: 100, percentage: 0 }

  return {
    stats,
    loading,
    error,
    level,
    totalXp: stats?.total_xp ?? 0,
    xpProgress,
    addXp,
    getXpForTrophy,
    refetch: fetchStats
  }
}
