import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import type { TierType } from '../types/database'

interface TrophyNotification {
  actionName: string
  funnyTitle: string
  tierType: TierType
  xpGained?: number
}

interface LevelUpNotification {
  newLevel: number
}

interface NotificationContextType {
  // Trophy notifications
  showTrophy: (notification: TrophyNotification) => void
  currentTrophy: TrophyNotification | null
  clearTrophy: () => void
  // Level up notifications
  showLevelUp: (notification: LevelUpNotification) => void
  currentLevelUp: LevelUpNotification | null
  clearLevelUp: () => void
  // XP gain notification
  showXpGain: (xp: number) => void
  currentXpGain: number | null
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function TrophyProvider({ children }: { children: ReactNode }) {
  const [currentTrophy, setCurrentTrophy] = useState<TrophyNotification | null>(null)
  const [currentLevelUp, setCurrentLevelUp] = useState<LevelUpNotification | null>(null)
  const [currentXpGain, setCurrentXpGain] = useState<number | null>(null)
  const [notificationQueue, setNotificationQueue] = useState<Array<() => void>>([])

  const processQueue = useCallback(() => {
    setNotificationQueue(prev => {
      if (prev.length > 0) {
        const [next, ...rest] = prev
        setTimeout(next, 500) // Small delay between notifications
        return rest
      }
      return prev
    })
  }, [])

  const showTrophy = useCallback((notification: TrophyNotification) => {
    const show = () => {
      setCurrentTrophy(notification)
      setTimeout(() => {
        setCurrentTrophy(null)
        processQueue()
      }, 4000)
    }

    if (currentTrophy || currentLevelUp) {
      setNotificationQueue(prev => [...prev, show])
    } else {
      show()
    }
  }, [currentTrophy, currentLevelUp, processQueue])

  const showLevelUp = useCallback((notification: LevelUpNotification) => {
    const show = () => {
      setCurrentLevelUp(notification)
      setTimeout(() => {
        setCurrentLevelUp(null)
        processQueue()
      }, 4000)
    }

    if (currentTrophy || currentLevelUp) {
      setNotificationQueue(prev => [...prev, show])
    } else {
      show()
    }
  }, [currentTrophy, currentLevelUp, processQueue])

  const showXpGain = useCallback((xp: number) => {
    setCurrentXpGain(xp)
    setTimeout(() => setCurrentXpGain(null), 2000)
  }, [])

  const clearTrophy = () => {
    setCurrentTrophy(null)
    processQueue()
  }

  const clearLevelUp = () => {
    setCurrentLevelUp(null)
    processQueue()
  }

  return (
    <NotificationContext.Provider value={{
      showTrophy,
      currentTrophy,
      clearTrophy,
      showLevelUp,
      currentLevelUp,
      clearLevelUp,
      showXpGain,
      currentXpGain
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useTrophyPopup = () => {
  const context = useContext(NotificationContext)
  if (!context) throw new Error('useTrophyPopup must be used within TrophyProvider')
  return context
}
