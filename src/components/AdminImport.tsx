import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { TierType } from '../types/database'

interface ImportTier {
  tier_type: TierType
  target_count: number
  funny_title: string
}

interface ImportAction {
  name: string
  description?: string
  icon_name?: string
  xp_reward?: number
  special_type?: string | null
  special_config?: Record<string, unknown> | null
  tiers: ImportTier[]
}

const exampleJson = `[
  {
    "name": "Morning Stretches",
    "description": "Start the day flexible",
    "icon_name": "stretching",
    "xp_reward": 5,
    "tiers": [
      { "tier_type": "bronze", "target_count": 3, "funny_title": "Stretch Starter" },
      { "tier_type": "silver", "target_count": 10, "funny_title": "Flexibility Fan" },
      { "tier_type": "gold", "target_count": 30, "funny_title": "Bendy Boss" },
      { "tier_type": "platinum", "target_count": 100, "funny_title": "Yoga Master" }
    ]
  }
]`

export function AdminImport() {
  const [jsonInput, setJsonInput] = useState('')
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const validateActions = (actions: unknown[]): ImportAction[] => {
    if (!Array.isArray(actions)) {
      throw new Error('Input must be an array of actions')
    }

    const validTierTypes: TierType[] = ['bronze', 'silver', 'gold', 'platinum']

    return actions.map((action, index) => {
      if (!action || typeof action !== 'object') {
        throw new Error(`Action at index ${index} is not an object`)
      }

      const a = action as Record<string, unknown>

      if (!a.name || typeof a.name !== 'string') {
        throw new Error(`Action at index ${index} is missing a valid name`)
      }

      if (!a.tiers || !Array.isArray(a.tiers)) {
        throw new Error(`Action "${a.name}" is missing tiers array`)
      }

      const tiers = a.tiers.map((tier, tierIndex) => {
        if (!tier || typeof tier !== 'object') {
          throw new Error(`Tier ${tierIndex} in "${a.name}" is not an object`)
        }

        const t = tier as Record<string, unknown>

        if (!validTierTypes.includes(t.tier_type as TierType)) {
          throw new Error(`Invalid tier_type "${t.tier_type}" in "${a.name}"`)
        }

        if (typeof t.target_count !== 'number' || t.target_count < 1) {
          throw new Error(`Invalid target_count in "${a.name}" tier ${tierIndex}`)
        }

        if (!t.funny_title || typeof t.funny_title !== 'string') {
          throw new Error(`Missing funny_title in "${a.name}" tier ${tierIndex}`)
        }

        return {
          tier_type: t.tier_type as TierType,
          target_count: t.target_count,
          funny_title: t.funny_title
        }
      })

      return {
        name: a.name,
        description: typeof a.description === 'string' ? a.description : undefined,
        icon_name: typeof a.icon_name === 'string' ? a.icon_name : undefined,
        xp_reward: typeof a.xp_reward === 'number' ? a.xp_reward : 5,
        special_type: typeof a.special_type === 'string' ? a.special_type : null,
        special_config: a.special_config && typeof a.special_config === 'object' ? a.special_config as Record<string, unknown> : null,
        tiers
      }
    })
  }

  const handleImport = async () => {
    setResult(null)
    setImporting(true)

    try {
      const parsed = JSON.parse(jsonInput)
      const actions = validateActions(parsed)

      let imported = 0
      let skipped = 0

      for (const action of actions) {
        // Check if action already exists
        const { data: existing } = await supabase
          .from('actions')
          .select('id')
          .eq('name', action.name)
          .single()

        if (existing) {
          skipped++
          continue
        }

        // Insert action
        const { data: newAction, error: actionError } = await supabase
          .from('actions')
          .insert({
            name: action.name,
            description: action.description || null,
            icon_name: action.icon_name || null,
            xp_reward: action.xp_reward || 5,
            special_type: action.special_type,
            special_config: action.special_config
          })
          .select()
          .single()

        if (actionError) throw actionError

        // Insert tiers
        const tiersToInsert = action.tiers.map(tier => ({
          action_id: newAction.id,
          tier_type: tier.tier_type,
          target_count: tier.target_count,
          funny_title: tier.funny_title
        }))

        const { error: tiersError } = await supabase
          .from('action_tiers')
          .insert(tiersToInsert)

        if (tiersError) throw tiersError

        imported++
      }

      setResult({
        success: true,
        message: `Imported ${imported} action(s). ${skipped > 0 ? `Skipped ${skipped} existing.` : ''}`
      })
      setJsonInput('')
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : 'Unknown error'
      })
    } finally {
      setImporting(false)
    }
  }

  const loadExample = () => {
    setJsonInput(exampleJson)
    setResult(null)
  }

  return (
    <div className="admin-import">
      <div className="import-header">
        <h2>Bulk Import Actions</h2>
        <button type="button" className="pixel-btn-small" onClick={loadExample}>
          Load Example
        </button>
      </div>

      <p className="import-description">
        Paste JSON array of actions with tiers. Each action needs name and tiers array.
      </p>

      <textarea
        className="pixel-input import-textarea"
        placeholder="Paste JSON here..."
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        rows={15}
      />

      {result && (
        <div className={`import-result ${result.success ? 'success' : 'error'}`}>
          {result.message}
        </div>
      )}

      <button
        type="button"
        className="pixel-btn import-btn"
        onClick={handleImport}
        disabled={importing || !jsonInput.trim()}
      >
        {importing ? 'Importing...' : 'Import Actions'}
      </button>
    </div>
  )
}
