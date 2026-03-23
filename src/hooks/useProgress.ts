import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { ActionTier, TierType, UserProgress } from '../types/database'
import { format } from 'date-fns'

interface CompleteActionResult {
  newCount: number
  unlockedTier: { tierType: TierType; funnyTitle: string } | null
}

export function useProgress(userId: string | undefined) {
  const [loading, setLoading] = useState(false)

  const completeAction = async (
    actionId: string,
    currentProgress: UserProgress | null,
    tiers: ActionTier[]
  ): Promise<CompleteActionResult> => {
    if (!userId) throw new Error('Not authenticated')

    setLoading(true)
    const newCount = (currentProgress?.current_count ?? 0) + 1
    const today = format(new Date(), 'yyyy-MM-dd')

    // Upsert progress (insert or update)
    const { error: progressError } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        action_id: actionId,
        current_count: newCount,
        last_completed_at: today
      }, {
        onConflict: 'user_id,action_id'
      })

    if (progressError) {
      setLoading(false)
      throw progressError
    }

    // Check if we just hit a tier target
    let unlockedTier: { tierType: TierType; funnyTitle: string } | null = null

    // Sort tiers by target_count ascending
    const sortedTiers = [...tiers].sort((a, b) => a.target_count - b.target_count)

    for (const tier of sortedTiers) {
      if (newCount === tier.target_count) {
        // We just hit this tier's target - unlock it!
        const { error: trophyError } = await supabase
          .from('user_trophies')
          .insert({
            user_id: userId,
            action_id: actionId,
            tier_type: tier.tier_type
          })

        // Ignore unique constraint errors (already unlocked)
        if (!trophyError || trophyError.code === '23505') {
          unlockedTier = {
            tierType: tier.tier_type,
            funnyTitle: tier.funny_title
          }
        }
        break
      }
    }

    setLoading(false)
    return { newCount, unlockedTier }
  }

  return { completeAction, loading }
}
