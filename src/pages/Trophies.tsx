import { useAuth } from '../hooks/useAuth'
import { useActions } from '../hooks/useActions'
import { ProgressBar } from '../components/ProgressBar'
import { PixelTrophy } from '../components/PixelTrophy'
import type { TierType } from '../types/database'

const tierOrder: TierType[] = ['bronze', 'silver', 'gold', 'platinum']

export function Trophies() {
  const { user } = useAuth()
  const { allActions, loading, error } = useActions(user?.id)

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-text">Loading trophies...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-error">
        <div className="error-text">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="trophies-page">
      <div className="page-header">
        <h1>Trophy Cabinet</h1>
      </div>

      <div className="trophies-list">
        {allActions.map(action => {
          const currentCount = action.progress?.current_count ?? 0
          const sortedTiers = [...action.tiers].sort((a, b) => a.target_count - b.target_count)

          return (
            <div key={action.id} className="trophy-action-card pixel-border">
              <h3 className="trophy-action-name">{action.name}</h3>
              <p className="trophy-action-count">
                Completed: {currentCount} times
              </p>

              <div className="trophy-tiers">
                {tierOrder.map(tierType => {
                  const tier = sortedTiers.find(t => t.tier_type === tierType)
                  if (!tier) return null

                  const isUnlocked = action.unlockedTiers.includes(tierType)
                  const isNext = !isUnlocked &&
                    !sortedTiers
                      .filter(t => t.target_count < tier.target_count)
                      .some(t => !action.unlockedTiers.includes(t.tier_type))

                  return (
                    <div
                      key={tierType}
                      className={`trophy-tier-card ${tierType} ${isUnlocked ? 'unlocked' : 'locked'}`}
                    >
                      <PixelTrophy tier={tierType} size="medium" locked={!isUnlocked} />
                      <div className="trophy-tier-info">
                        <div className="trophy-tier-title">{tier.funny_title}</div>
                        <div className="trophy-tier-type">{tierType.toUpperCase()}</div>

                        {isUnlocked ? (
                          <div className="trophy-unlocked-badge">UNLOCKED</div>
                        ) : isNext ? (
                          <div className="trophy-tier-progress">
                            <span>{currentCount} / {tier.target_count}</span>
                            <ProgressBar
                              current={currentCount}
                              target={tier.target_count}
                              tier={tierType}
                            />
                          </div>
                        ) : (
                          <div className="trophy-locked-text">
                            {tier.target_count} to unlock
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
