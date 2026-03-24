import { useState } from 'react'
import { useProgress } from '../hooks/useProgress'
import { useTrophyPopup } from '../context/TrophyContext'
import { ProgressBar } from './ProgressBar'
import { PixelTrophy } from './PixelTrophy'
import type { ActionWithProgress, TierType } from '../types/database'
import { XP_VALUES } from '../types/database'
import { isToday, parseISO } from 'date-fns'

interface Props {
  action: ActionWithProgress
  userId: string
  onComplete: () => Promise<void> | void
  onXpGain: (xp: number, leveledUp: boolean, newLevel: number) => void
  onRemove?: () => void
}

const tierOrder: TierType[] = ['bronze', 'silver', 'gold', 'platinum']

const actionIcons: Record<string, string> = {
  bed: '🛏️',
  dishes: '🍽️',
  teeth: '🦷',
  boxing: '🥊',
  jumprope: '🪢',
  cooking: '🍳',
  gamemaster: '👨‍💻',
  meditation: '🧘',
  face: '🧴',
  laundry: '🧺',
  reading: '📚',
  dividends: '💰',
  networking: '🤝',
  work: '💼',
  gym: '🏋️',
  tea: '🍵',
  vitamins: '💊',
  handnails: '💅',
  feetnails: '🦶',
  accountant: '📊',
  gaming: '🎮',
  callmom: '📞',
  family: '👨‍👩‍👧‍👦',
  flight: '✈️',
  hotel: '🏨',
  atm: '🏧',
  water: '💧'
}

const getTrophyXp = (tier: TierType): number => {
  switch (tier) {
    case 'bronze': return XP_VALUES.TROPHY_BRONZE
    case 'silver': return XP_VALUES.TROPHY_SILVER
    case 'gold': return XP_VALUES.TROPHY_GOLD
    case 'platinum': return XP_VALUES.TROPHY_PLATINUM
  }
}

export function ActionCard({ action, userId, onComplete, onXpGain, onRemove }: Props) {
  const { completeAction, loading } = useProgress(userId)
  const { showTrophy, showXpGain } = useTrophyPopup()
  const [completing, setCompleting] = useState(false)

  // Check if already completed today
  const completedToday = action.progress?.last_completed_at
    ? isToday(parseISO(action.progress.last_completed_at))
    : false

  // Find next tier to unlock
  const sortedTiers = [...action.tiers].sort((a, b) => a.target_count - b.target_count)
  const currentCount = action.progress?.current_count ?? 0
  const nextTier = sortedTiers.find(t => t.target_count > currentCount)
  const allTiersUnlocked = !nextTier

  const handleComplete = async () => {
    if (completing || loading || completedToday) return
    setCompleting(true)

    try {
      const result = await completeAction(action.id, action.progress, action.tiers)

      // Calculate total XP gained
      let totalXp = XP_VALUES.ACTION_COMPLETE
      let trophyXp = 0

      if (result.unlockedTier) {
        trophyXp = getTrophyXp(result.unlockedTier.tierType)
        totalXp += trophyXp

        showTrophy({
          actionName: action.name,
          funnyTitle: result.unlockedTier.funnyTitle,
          tierType: result.unlockedTier.tierType,
          xpGained: trophyXp
        })
      }

      // Show XP gain and notify parent
      showXpGain(totalXp)
      onXpGain(totalXp, false, 0) // Level up handled by parent

      await onComplete()
    } catch (error) {
      console.error('Failed to complete action:', error)
    }
    setCompleting(false)
  }

  const icon = action.icon_name ? actionIcons[action.icon_name] || '⭐' : '⭐'

  return (
    <div className={`action-card pixel-border ${completedToday ? 'completed' : ''}`}>
      <div className="action-card-header">
        <span className="action-icon">{icon}</span>
        <div className="action-info">
          <h3 className="action-name">{action.name}</h3>
          {action.description && (
            <p className="action-description">{action.description}</p>
          )}
        </div>
        {onRemove && (
          <button
            type="button"
            className="action-remove-btn"
            onClick={onRemove}
            title="Remove from today"
          >
            ×
          </button>
        )}
      </div>

      <div className="action-tiers">
        {tierOrder.map(tier => {
          const tierData = action.tiers.find(t => t.tier_type === tier)
          const isUnlocked = action.unlockedTiers.includes(tier)
          return (
            <div key={tier} title={tierData?.funny_title}>
              <PixelTrophy tier={tier} size="small" locked={!isUnlocked} />
            </div>
          )
        })}
      </div>

      <div className="action-progress">
        {allTiersUnlocked ? (
          <span className="progress-text platinum-complete">All trophies unlocked! (+5 XP)</span>
        ) : nextTier && (
          <>
            <span className="progress-text">
              {currentCount} / {nextTier.target_count} to {nextTier.tier_type}
            </span>
            <ProgressBar
              current={currentCount}
              target={nextTier.target_count}
              tier={nextTier.tier_type}
            />
          </>
        )}
      </div>

      <button
        type="button"
        className={`action-complete-btn pixel-btn ${completedToday ? 'done' : ''}`}
        onClick={handleComplete}
        disabled={completing || completedToday}
      >
        {completedToday ? 'Done Today ✓' : completing ? '...' : `Complete (+${XP_VALUES.ACTION_COMPLETE} XP)`}
      </button>
    </div>
  )
}
