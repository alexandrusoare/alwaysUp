import { useState, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useActions } from '../hooks/useActions'
import { useStats } from '../hooks/useStats'
import { useTrophyPopup } from '../context/TrophyContext'
import { ActionCard } from '../components/ActionCard'
import { WaterActionCard } from '../components/WaterActionCard'
import { AddActionModal } from '../components/AddActionModal'

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
  water: '💧',
  acupuncture: '🪡',
  meeting: '🤵'
}

export function Actions() {
  const { user } = useAuth()
  const { actions, allActions, recommendedActions, loading, error, refetch, addAction, removeAction, setActiveActions } = useActions(user?.id)
  const { addXp, level, xpProgress, refetch: refetchStats } = useStats(user?.id)
  const { showLevelUp } = useTrophyPopup()
  const [modalOpen, setModalOpen] = useState(false)

  const activeActionIds = useMemo(() => new Set(actions.map(a => a.id)), [actions])

  const handleXpGain = async (xp: number) => {
    try {
      const result = await addXp(xp)
      if (result.leveledUp) {
        showLevelUp({ newLevel: result.newLevel })
      }
      refetchStats()
    } catch (error) {
      console.error('Failed to add XP:', error)
    }
  }

  const handleRemoveAction = async (actionId: string) => {
    try {
      await removeAction(actionId)
    } catch (error) {
      console.error('Failed to remove action:', error)
    }
  }

  const handleAddRecommended = async (actionId: string) => {
    try {
      await addAction(actionId)
    } catch (error) {
      console.error('Failed to add action:', error)
    }
  }

  const handleSaveActions = async (actionIds: string[]) => {
    await setActiveActions(actionIds)
  }

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-text">Loading quests...</div>
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

  // Count how many are completed today
  const completedToday = actions.filter(a => {
    if (!a.progress?.last_completed_at) return false
    const lastDate = new Date(a.progress.last_completed_at)
    const today = new Date()
    return lastDate.toDateString() === today.toDateString()
  }).length

  // Filter recommended to not show already active ones
  const availableRecommendations = recommendedActions.filter(a => !activeActionIds.has(a.id))

  return (
    <div className="actions-page">
      <div className="page-header">
        <div>
          <h1>Today's Quests</h1>
          <p className="quest-count">{completedToday} / {actions.length} completed</p>
        </div>
        <div className="header-level">
          <span className="level-badge">LVL {level}</span>
          <div className="header-xp-bar">
            <div
              className="header-xp-fill"
              style={{ width: `${xpProgress.percentage}%` }}
            />
          </div>
          <span className="xp-text">{xpProgress.current} / {xpProgress.needed} XP</span>
        </div>
      </div>

      {/* Recommendations bar - show when no actions or has recommendations */}
      {availableRecommendations.length > 0 && (
        <div className="recommendations-section">
          <h3 className="recommendations-title">Quick Add - Most Used</h3>
          <div className="recommendations-bar">
            {availableRecommendations.map(action => {
              const icon = action.icon_name ? actionIcons[action.icon_name] || '⭐' : '⭐'
              return (
                <button
                  key={action.id}
                  type="button"
                  className="recommendation-chip"
                  onClick={() => handleAddRecommended(action.id)}
                  title={action.name}
                >
                  <span className="chip-icon">{icon}</span>
                  <span className="chip-name">{action.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="actions-list">
        {actions.length === 0 ? (
          <div className="empty-actions">
            <p>No quests added yet!</p>
            <p>Click the + button to add your first quest.</p>
          </div>
        ) : (
          actions.map(action => (
            action.special_type === 'water_tracking' ? (
              <WaterActionCard
                key={action.id}
                action={action}
                userId={user!.id}
                onComplete={refetch}
                onXpGain={handleXpGain}
                onRemove={() => handleRemoveAction(action.id)}
              />
            ) : (
              <ActionCard
                key={action.id}
                action={action}
                userId={user!.id}
                onComplete={refetch}
                onXpGain={handleXpGain}
                onRemove={() => handleRemoveAction(action.id)}
              />
            )
          ))
        )}
      </div>

      <button
        type="button"
        className="add-action-btn"
        onClick={() => setModalOpen(true)}
      >
        <span className="plus-icon">+</span>
        Add Quest
      </button>

      <AddActionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        allActions={allActions}
        activeActionIds={activeActionIds}
        onSave={handleSaveActions}
      />
    </div>
  )
}
