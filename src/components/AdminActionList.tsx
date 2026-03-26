import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Action, ActionTier, TierType } from '../types/database'

interface ActionWithTiers extends Action {
  tiers: ActionTier[]
}

interface EditingAction {
  id: string
  name: string
  description: string
  xp_reward: number
  tiers: {
    tier_type: TierType
    target_count: number
    funny_title: string
  }[]
}

const tierOrder: TierType[] = ['bronze', 'silver', 'gold', 'platinum']

export function AdminActionList() {
  const [actions, setActions] = useState<ActionWithTiers[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<EditingAction | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchActions = async () => {
    try {
      const { data: actionsData, error: actionsError } = await supabase
        .from('actions')
        .select('*')
        .order('name')

      if (actionsError) throw actionsError

      const { data: tiersData, error: tiersError } = await supabase
        .from('action_tiers')
        .select('*')

      if (tiersError) throw tiersError

      const combined = (actionsData as Action[]).map(action => ({
        ...action,
        tiers: (tiersData as ActionTier[])
          .filter(t => t.action_id === action.id)
          .sort((a, b) => tierOrder.indexOf(a.tier_type) - tierOrder.indexOf(b.tier_type))
      }))

      setActions(combined)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load actions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActions()
  }, [])

  const startEditing = (action: ActionWithTiers) => {
    setEditingId(action.id)
    setEditData({
      id: action.id,
      name: action.name,
      description: action.description || '',
      xp_reward: action.xp_reward,
      tiers: tierOrder.map(tierType => {
        const existing = action.tiers.find(t => t.tier_type === tierType)
        return {
          tier_type: tierType,
          target_count: existing?.target_count || 0,
          funny_title: existing?.funny_title || ''
        }
      })
    })
    setError(null)
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditData(null)
    setError(null)
  }

  const handleSave = async () => {
    if (!editData) return

    setSaving(true)
    setError(null)

    try {
      // Update action
      const { error: actionError } = await supabase
        .from('actions')
        .update({
          name: editData.name,
          description: editData.description || null,
          xp_reward: editData.xp_reward
        })
        .eq('id', editData.id)

      if (actionError) throw actionError

      // Update tiers - delete existing and insert new
      const { error: deleteError } = await supabase
        .from('action_tiers')
        .delete()
        .eq('action_id', editData.id)

      if (deleteError) throw deleteError

      const validTiers = editData.tiers.filter(t => t.target_count > 0 && t.funny_title)

      if (validTiers.length > 0) {
        const { error: insertError } = await supabase
          .from('action_tiers')
          .insert(validTiers.map(t => ({
            action_id: editData.id,
            tier_type: t.tier_type,
            target_count: t.target_count,
            funny_title: t.funny_title
          })))

        if (insertError) throw insertError
      }

      await fetchActions()
      cancelEditing()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (actionId: string, actionName: string) => {
    if (!confirm(`Delete "${actionName}"? This will remove all user progress for this action.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('actions')
        .delete()
        .eq('id', actionId)

      if (error) throw error

      await fetchActions()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  const updateEditField = (field: keyof EditingAction, value: string | number) => {
    if (!editData) return
    setEditData({ ...editData, [field]: value })
  }

  const updateTierField = (tierIndex: number, field: 'target_count' | 'funny_title', value: string | number) => {
    if (!editData) return
    const newTiers = [...editData.tiers]
    newTiers[tierIndex] = { ...newTiers[tierIndex], [field]: value }
    setEditData({ ...editData, tiers: newTiers })
  }

  if (loading) {
    return <div className="admin-loading">Loading actions...</div>
  }

  return (
    <div className="admin-action-list">
      <h2>Edit Actions ({actions.length})</h2>

      {error && <div className="admin-error">{error}</div>}

      <div className="action-edit-list">
        {actions.map(action => (
          <div key={action.id} className="action-edit-card pixel-border">
            {editingId === action.id && editData ? (
              <div className="action-edit-form">
                <div className="edit-row">
                  <label>Name</label>
                  <input
                    type="text"
                    className="pixel-input"
                    value={editData.name}
                    onChange={(e) => updateEditField('name', e.target.value)}
                  />
                </div>

                <div className="edit-row">
                  <label>Description</label>
                  <input
                    type="text"
                    className="pixel-input"
                    value={editData.description}
                    onChange={(e) => updateEditField('description', e.target.value)}
                  />
                </div>

                <div className="edit-row">
                  <label>XP Reward</label>
                  <input
                    type="number"
                    className="pixel-input xp-input"
                    value={editData.xp_reward}
                    onChange={(e) => updateEditField('xp_reward', parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>

                <div className="edit-tiers">
                  <label>Tiers</label>
                  {editData.tiers.map((tier, index) => (
                    <div key={tier.tier_type} className={`tier-edit-row ${tier.tier_type}`}>
                      <span className="tier-label">{tier.tier_type}</span>
                      <input
                        type="number"
                        className="pixel-input tier-count"
                        value={tier.target_count || ''}
                        onChange={(e) => updateTierField(index, 'target_count', parseInt(e.target.value) || 0)}
                        placeholder="Count"
                        min={0}
                      />
                      <input
                        type="text"
                        className="pixel-input tier-title"
                        value={tier.funny_title}
                        onChange={(e) => updateTierField(index, 'funny_title', e.target.value)}
                        placeholder="Trophy title"
                      />
                    </div>
                  ))}
                </div>

                <div className="edit-actions">
                  <button type="button" className="pixel-btn-small" onClick={cancelEditing}>
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
            ) : (
              <div className="action-view">
                <div className="action-view-header">
                  <div className="action-view-info">
                    <h3>{action.name}</h3>
                    <p className="action-view-desc">{action.description || 'No description'}</p>
                    <span className="action-view-xp">+{action.xp_reward} XP</span>
                  </div>
                  <div className="action-view-actions">
                    <button
                      type="button"
                      className="pixel-btn-small"
                      onClick={() => startEditing(action)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="pixel-btn-small delete-btn"
                      onClick={() => handleDelete(action.id, action.name)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="action-view-tiers">
                  {action.tiers.map(tier => (
                    <div key={tier.id} className={`tier-badge-small ${tier.tier_type}`}>
                      <span className="tier-count">{tier.target_count}</span>
                      <span className="tier-name">{tier.funny_title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
