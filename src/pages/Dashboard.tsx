import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTrophies } from '../hooks/useTrophies'
import { useActions } from '../hooks/useActions'
import { useStats } from '../hooks/useStats'
import { TrophyCounts } from '../components/TrophyCounts'
import { TrophyBadge } from '../components/TrophyBadge'
import { Avatar } from '../components/Avatar'
import { supabase } from '../lib/supabase'

export function Dashboard() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  // Get user metadata
  const userMeta = user?.user_metadata || {}
  const [displayName, setDisplayName] = useState(userMeta.display_name || '')
  const [gender, setGender] = useState<'male' | 'female' | null>(userMeta.gender || null)

  const { trophies, counts, loading: trophiesLoading } = useTrophies(user?.id)
  const { actions, loading: actionsLoading } = useActions(user?.id)
  const { level, totalXp, xpProgress, loading: statsLoading } = useStats(user?.id)

  const loading = trophiesLoading || actionsLoading || statsLoading

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      await supabase.auth.updateUser({
        data: { display_name: displayName, gender }
      })
      setIsEditing(false)
    } catch (err) {
      console.error('Failed to save profile:', err)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-text">Loading profile...</div>
      </div>
    )
  }

  // Get recent trophies (last 5)
  const recentTrophies = trophies.slice(0, 5)

  // Get today's completed actions
  const today = new Date().toDateString()
  const todayActions = actions.filter(a => {
    if (!a.progress?.last_completed_at) return false
    return new Date(a.progress.last_completed_at).toDateString() === today
  })

  // Get username: display_name > email prefix
  const username = userMeta.display_name || user?.email?.split('@')[0] || 'Adventurer'

  return (
    <div className="dashboard-page">
      {/* Profile Header */}
      <div className="profile-header pixel-border">
        <Avatar level={level} gender={userMeta.gender} />
        <div className="profile-info">
          {isEditing ? (
            <div className="profile-edit-form">
              <input
                type="text"
                className="pixel-input"
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
              <div className="gender-selector">
                <button
                  type="button"
                  className={`gender-btn male ${gender === 'male' ? 'selected' : ''}`}
                  onClick={() => setGender('male')}
                >
                  <div className="pixel-male-symbol" />
                </button>
                <button
                  type="button"
                  className={`gender-btn female ${gender === 'female' ? 'selected' : ''}`}
                  onClick={() => setGender('female')}
                >
                  <div className="pixel-female-symbol" />
                </button>
              </div>
              <div className="profile-edit-actions">
                <button className="pixel-btn-small" onClick={() => setIsEditing(false)}>Cancel</button>
                <button className="pixel-btn" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? '...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="profile-name-row">
                <h1 className="profile-name">{username}</h1>
                <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>✏️</button>
              </div>
            </>
          )}
          <TrophyCounts counts={counts} />

          {/* XP Progress Bar */}
          <div className="xp-section">
            <div className="xp-header">
              <span className="xp-level">Level {level}</span>
              <span className="xp-total">{totalXp} Total XP</span>
            </div>
            <div className="xp-bar">
              <div
                className="xp-bar-fill"
                style={{ width: `${xpProgress.percentage}%` }}
              />
            </div>
            <div className="xp-footer">
              <span>{xpProgress.current} / {xpProgress.needed} XP to Level {level + 1}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Progress */}
      <section className="dashboard-section">
        <h2 className="section-title">Today's Progress</h2>
        <div className="today-stats pixel-border">
          <div className="stat-item">
            <span className="stat-value">{todayActions.length}</span>
            <span className="stat-label">Actions Done</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{actions.length - todayActions.length}</span>
            <span className="stat-label">Remaining</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">+{todayActions.length * 5}</span>
            <span className="stat-label">XP Today</span>
          </div>
        </div>

        {todayActions.length > 0 && (
          <div className="today-actions">
            {todayActions.map(action => (
              <div key={action.id} className="today-action-item">
                ✓ {action.name}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Recent Trophies */}
      <section className="dashboard-section">
        <h2 className="section-title">Recent Trophies</h2>
        {recentTrophies.length === 0 ? (
          <p className="no-trophies">Complete actions to earn your first trophy!</p>
        ) : (
          <div className="recent-trophies-grid">
            {recentTrophies.map(trophy => (
              <TrophyBadge key={trophy.id} trophy={trophy} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
