import { useState, useMemo, useEffect } from 'react'
import type { ActionWithProgress } from '../types/database'
import { PixelTrophy } from './PixelTrophy'

interface Props {
  isOpen: boolean
  onClose: () => void
  allActions: ActionWithProgress[]
  activeActionIds: Set<string>
  onSave: (actionIds: string[]) => Promise<void>
}

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

export function AddActionModal({ isOpen, onClose, allActions, activeActionIds, onSave }: Props) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set(activeActionIds))
  const [saving, setSaving] = useState(false)

  // Sync selected with activeActionIds when modal opens or activeActionIds changes
  useEffect(() => {
    if (isOpen) {
      setSelected(new Set(activeActionIds))
    }
  }, [isOpen, activeActionIds])

  const filteredActions = useMemo(() => {
    if (!search.trim()) return allActions
    const searchLower = search.toLowerCase()
    return allActions.filter(a =>
      a.name.toLowerCase().includes(searchLower) ||
      a.description?.toLowerCase().includes(searchLower)
    )
  }, [allActions, search])

  const toggleAction = (actionId: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(actionId)) {
        next.delete(actionId)
      } else {
        next.add(actionId)
      }
      return next
    })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave(Array.from(selected))
      onClose()
    } catch (err) {
      console.error('Failed to save:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleClose = () => {
    setSearch('')
    setSelected(new Set(activeActionIds))
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content pixel-border" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Manage Quests</h2>
          <button type="button" className="modal-close" onClick={handleClose}>×</button>
        </div>

        <div className="modal-search">
          <input
            type="text"
            className="pixel-input"
            placeholder="Search actions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="modal-list">
          {filteredActions.map(action => {
            const isSelected = selected.has(action.id)
            const icon = action.icon_name ? actionIcons[action.icon_name] || '⭐' : '⭐'
            const currentCount = action.progress?.current_count ?? 0

            return (
              <div
                key={action.id}
                className={`action-item ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleAction(action.id)}
              >
                <div className="action-item-check">
                  {isSelected ? '✓' : ''}
                </div>
                <div className="action-item-icon">{icon}</div>
                <div className="action-item-info">
                  <div className="action-item-name">{action.name}</div>
                  <div className="action-item-progress">
                    {currentCount > 0 ? `${currentCount} completed` : 'Not started'}
                  </div>
                </div>
                <div className="action-item-trophies">
                  {action.unlockedTiers.map(tier => (
                    <PixelTrophy key={tier} tier={tier} size="small" />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="modal-footer">
          <span className="selected-count">{selected.size} selected</span>
          <div className="modal-actions">
            <button type="button" className="pixel-btn-small" onClick={handleClose}>
              Cancel
            </button>
            <button
              type="button"
              className="pixel-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
