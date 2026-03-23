import { useTrophyPopup } from '../context/TrophyContext'
import { PixelTrophy } from './PixelTrophy'
import type { TierType } from '../types/database'

const tierColors: Record<string, string> = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#e5e4e2'
}

export function TrophyPopup() {
  const { currentTrophy, clearTrophy, currentLevelUp, clearLevelUp, currentXpGain } = useTrophyPopup()

  return (
    <>
      {/* XP Gain Notification */}
      {currentXpGain && (
        <div className="xp-popup">
          +{currentXpGain} XP
        </div>
      )}

      {/* Level Up Notification */}
      {currentLevelUp && (
        <div
          className="level-up-popup"
          onClick={clearLevelUp}
        >
          <div className="level-up-icon">⬆️</div>
          <div className="level-up-content">
            <div className="level-up-label">Level Up!</div>
            <div className="level-up-level">Level {currentLevelUp.newLevel}</div>
          </div>
        </div>
      )}

      {/* Trophy Notification */}
      {currentTrophy && (
        <div
          className="trophy-popup"
          onClick={clearTrophy}
          style={{ '--tier-color': tierColors[currentTrophy.tierType] } as React.CSSProperties}
        >
          <div className="trophy-popup-icon">
            <PixelTrophy tier={currentTrophy.tierType as TierType} size="large" />
          </div>
          <div className="trophy-popup-content">
            <div className="trophy-popup-label">Trophy Achieved!</div>
            <div className="trophy-popup-title">{currentTrophy.funnyTitle}</div>
            <div className="trophy-popup-action">{currentTrophy.actionName}</div>
            <div className="trophy-popup-footer">
              <span
                className="trophy-popup-tier"
                style={{ color: tierColors[currentTrophy.tierType] }}
              >
                {currentTrophy.tierType.toUpperCase()}
              </span>
              {currentTrophy.xpGained && (
                <span className="trophy-popup-xp">+{currentTrophy.xpGained} XP</span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
