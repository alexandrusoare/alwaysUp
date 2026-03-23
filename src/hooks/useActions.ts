import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Action, ActionTier, UserProgress, UserTrophy, UserActiveAction, ActionWithProgress, TierType } from '../types/database'

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => new Date().toISOString().split('T')[0]

export function useActions(userId: string | undefined) {
  const [actions, setActions] = useState<ActionWithProgress[]>([])
  const [allActions, setAllActions] = useState<ActionWithProgress[]>([])
  const [recommendedActions, setRecommendedActions] = useState<ActionWithProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActions = useCallback(async () => {
    if (!userId) return

    setLoading(true)
    try {
      // Fetch all actions
      const { data: actionsData, error: actionsError } = await supabase
        .from('actions')
        .select('*')
        .order('name')

      if (actionsError) throw actionsError

      // Fetch all tiers
      const { data: tiersData, error: tiersError } = await supabase
        .from('action_tiers')
        .select('*')

      if (tiersError) throw tiersError

      // Fetch user progress (this tracks all-time completions)
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)

      if (progressError) throw progressError

      // Fetch user trophies
      const { data: trophiesData, error: trophiesError } = await supabase
        .from('user_trophies')
        .select('*')
        .eq('user_id', userId)

      if (trophiesError) throw trophiesError

      // Fetch user active actions for TODAY only
      const today = getTodayDate()
      const { data: activeData, error: activeError } = await supabase
        .from('user_active_actions')
        .select('action_id')
        .eq('user_id', userId)
        .eq('added_date', today)

      if (activeError) throw activeError

      const activeActionIds = new Set((activeData as UserActiveAction[] || []).map(a => a.action_id))

      // Combine data for all actions
      const combined: ActionWithProgress[] = (actionsData as Action[]).map((action) => {
        const tiers = (tiersData as ActionTier[]).filter(t => t.action_id === action.id)
        const progress = (progressData as UserProgress[]).find(p => p.action_id === action.id) || null
        const unlockedTiers = (trophiesData as UserTrophy[])
          .filter(t => t.action_id === action.id)
          .map(t => t.tier_type as TierType)

        return {
          ...action,
          tiers,
          progress,
          unlockedTiers
        }
      })

      setAllActions(combined)

      // Filter to only active actions for today
      const activeActions = combined.filter(a => activeActionIds.has(a.id))
      setActions(activeActions)

      // Calculate recommended actions (most used based on progress count)
      const sortedByUsage = [...combined]
        .filter(a => a.progress && a.progress.current_count > 0)
        .sort((a, b) => (b.progress?.current_count ?? 0) - (a.progress?.current_count ?? 0))
        .slice(0, 6) // Top 6 most used

      setRecommendedActions(sortedByUsage)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch actions')
    } finally {
      setLoading(false)
    }
  }, [userId])

  const addAction = async (actionId: string) => {
    if (!userId) return

    try {
      const today = getTodayDate()
      const { error } = await supabase
        .from('user_active_actions')
        .insert({ user_id: userId, action_id: actionId, added_date: today })

      if (error) throw error
      await fetchActions()
    } catch (err) {
      console.error('Failed to add action:', err)
      throw err
    }
  }

  const removeAction = async (actionId: string) => {
    if (!userId) return

    try {
      const today = getTodayDate()
      const { error } = await supabase
        .from('user_active_actions')
        .delete()
        .eq('user_id', userId)
        .eq('action_id', actionId)
        .eq('added_date', today)

      if (error) throw error
      await fetchActions()
    } catch (err) {
      console.error('Failed to remove action:', err)
      throw err
    }
  }

  const setActiveActions = async (actionIds: string[]) => {
    if (!userId) return

    try {
      const today = getTodayDate()

      // Delete all existing active actions for today
      const { error: deleteError } = await supabase
        .from('user_active_actions')
        .delete()
        .eq('user_id', userId)
        .eq('added_date', today)

      if (deleteError) throw deleteError

      // Insert new active actions for today
      if (actionIds.length > 0) {
        const insertData: Array<{ user_id: string; action_id: string; added_date: string }> = actionIds.map(actionId => ({
          user_id: userId,
          action_id: actionId,
          added_date: today
        }))
        const { error: insertError } = await supabase
          .from('user_active_actions')
          .insert(insertData)

        if (insertError) throw insertError
      }

      await fetchActions()
    } catch (err) {
      console.error('Failed to set active actions:', err)
      throw err
    }
  }

  useEffect(() => {
    fetchActions()
  }, [fetchActions])

  return {
    actions,
    allActions,
    recommendedActions,
    loading,
    error,
    refetch: fetchActions,
    addAction,
    removeAction,
    setActiveActions
  }
}
