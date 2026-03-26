import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { UserDailyTracking, WaterTrackingConfig } from '../types/database'

const getTodayDate = () => new Date().toISOString().split('T')[0]

interface WaterTrackingState {
  currentMl: number
  cups: number
  goalMl: number
  goalCups: number
  goalReached: boolean
  percentage: number
}

export function useWaterTracking(userId: string | undefined, actionId: string | undefined, config: WaterTrackingConfig | null) {
  const [tracking, setTracking] = useState<UserDailyTracking | null>(null)
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  const perIncrement = config?.per_increment ?? 250
  const dailyGoal = config?.daily_goal ?? 2000

  const fetchTracking = useCallback(async () => {
    if (!userId || !actionId) {
      setLoading(false)
      return
    }

    try {
      const today = getTodayDate()
      const { data, error } = await supabase
        .from('user_daily_tracking')
        .select('*')
        .eq('user_id', userId)
        .eq('action_id', actionId)
        .eq('date', today)
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is fine
        console.error('Error fetching water tracking:', error)
      }

      setTracking(data as UserDailyTracking | null)
    } catch (err) {
      console.error('Failed to fetch water tracking:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, actionId])

  useEffect(() => {
    fetchTracking()
  }, [fetchTracking])

  const addCup = useCallback(async (): Promise<{ goalJustReached: boolean }> => {
    if (!userId || !actionId || adding) {
      return { goalJustReached: false }
    }

    setAdding(true)
    const today = getTodayDate()
    const currentValue = tracking?.current_value ?? 0
    const newValue = currentValue + perIncrement
    const goalReached = newValue >= dailyGoal
    const wasGoalReached = tracking?.goal_reached ?? false

    try {
      if (tracking) {
        // Update existing record
        const { error } = await supabase
          .from('user_daily_tracking')
          .update({
            current_value: newValue,
            goal_reached: goalReached,
            updated_at: new Date().toISOString()
          })
          .eq('id', tracking.id)

        if (error) throw error
      } else {
        // Insert new record and return it
        const { data, error } = await supabase
          .from('user_daily_tracking')
          .insert({
            user_id: userId,
            action_id: actionId,
            date: today,
            current_value: newValue,
            goal_reached: goalReached
          })
          .select()
          .single()

        if (error) throw error

        // Set the tracking with the returned data (includes ID)
        setTracking(data as UserDailyTracking)
        return { goalJustReached: goalReached && !wasGoalReached }
      }

      // Update local state for existing record
      setTracking(prev => prev ? {
        ...prev,
        current_value: newValue,
        goal_reached: goalReached,
        updated_at: new Date().toISOString()
      } : null)

      // Return if goal was just reached (for XP/trophy logic)
      return { goalJustReached: goalReached && !wasGoalReached }
    } catch (err) {
      console.error('Failed to add cup:', err)
      return { goalJustReached: false }
    } finally {
      setAdding(false)
    }
  }, [userId, actionId, tracking, adding, perIncrement, dailyGoal])

  // Calculate current state
  const currentMl = tracking?.current_value ?? 0
  const cups = Math.floor(currentMl / perIncrement)
  const goalCups = Math.ceil(dailyGoal / perIncrement)
  const goalReached = tracking?.goal_reached ?? false
  const percentage = Math.min((currentMl / dailyGoal) * 100, 100)

  const state: WaterTrackingState = {
    currentMl,
    cups,
    goalMl: dailyGoal,
    goalCups,
    goalReached,
    percentage
  }

  return {
    ...state,
    loading,
    adding,
    addCup,
    refetch: fetchTracking
  }
}
