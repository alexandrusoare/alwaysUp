import { useTrophyPopup } from '../context/TrophyContext'
import { useWaterTracking } from '../hooks/useWaterTracking'
import { useProgress } from '../hooks/useProgress'
import { PixelTrophy } from './PixelTrophy'
import type { ActionWithProgress, TierType, WaterTrackingConfig } from '../types/database'
import { XP_VALUES } from '../types/database'

interface Props {
  action: ActionWithProgress
  userId: string
  onComplete: () => Promise<void> | void
  onXpGain: (xp: number, leveledUp: boolean, newLevel: number) => void
  onRemove?: () => void
}

const tierOrder: TierType[] = ['bronze', 'silver', 'gold', 'platinum']

const getTrophyXp = (tier: TierType): number => {
  switch (tier) {
    case 'bronze': return XP_VALUES.TROPHY_BRONZE
    case 'silver': return XP_VALUES.TROPHY_SILVER
    case 'gold': return XP_VALUES.TROPHY_GOLD
    case 'platinum': return XP_VALUES.TROPHY_PLATINUM
  }
}

export function WaterActionCard({ action, userId, onComplete, onXpGain, onRemove }: Props) {
  const config = action.special_config as WaterTrackingConfig
  const { cups, goalCups, currentMl, goalMl, goalReached, percentage, adding, addCup } = useWaterTracking(
    userId,
    action.id,
    config
  )
  const { completeAction } = useProgress(userId)
  const { showTrophy, showXpGain } = useTrophyPopup()

  // Find next tier to unlock (for trophies, based on days goal was reached)
  const sortedTiers = [...action.tiers].sort((a, b) => a.target_count - b.target_count)
  const currentCount = action.progress?.current_count ?? 0
  const nextTier = sortedTiers.find(t => t.target_count > currentCount)
  const allTiersUnlocked = !nextTier

  const handleAddCup = async () => {
    if (adding || goalReached) return

    const { goalJustReached } = await addCup()

    if (goalJustReached) {
      // Goal reached! Award XP and check for trophies
      try {
        const result = await completeAction(action.id, action.progress, action.tiers)

        const actionXp = action.xp_reward ?? 5
        let totalXp = actionXp
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

        showXpGain(totalXp)
        onXpGain(totalXp, false, 0)
        await onComplete()
      } catch (error) {
        console.error('Failed to complete water goal:', error)
      }
    }
  }

  return (
    <div className={`action-card pixel-border water-card ${goalReached ? 'completed' : ''}`}>
      <div className="action-card-header">
        <span className="action-icon">💧</span>
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

      {/* Water Progress */}
      <div className="water-progress">
        <div className="water-cups">
          {Array.from({ length: goalCups }).map((_, i) => (
            <div
              key={i}
              className={`water-cup ${i < cups ? 'filled' : 'empty'}`}
              title={`Cup ${i + 1}`}
            >
              💧
            </div>
          ))}
        </div>
        <div className="water-stats">
          <span className="water-ml">{currentMl} / {goalMl} ml</span>
          <span className="water-cups-text">{cups} / {goalCups} cups</span>
        </div>
        <div className="water-bar">
          <div
            className="water-bar-fill"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Trophy Progress */}
      <div className="action-progress">
        {allTiersUnlocked ? (
          <span className="progress-text platinum-complete">All trophies unlocked!</span>
        ) : nextTier && (
          <span className="progress-text">
            {currentCount} / {nextTier.target_count} days to {nextTier.tier_type}
          </span>
        )}
      </div>

      <button
        type="button"
        className={`action-complete-btn pixel-btn water-btn ${goalReached ? 'done' : ''}`}
        onClick={handleAddCup}
        disabled={adding || goalReached}
      >
        {goalReached
          ? '2L Reached! ✓'
          : adding
            ? '...'
            : `Add Cup (${cups}/${goalCups})`
        }
      </button>
    </div>
  )
}
