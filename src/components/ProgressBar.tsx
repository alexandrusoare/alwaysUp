import type { TierType } from '../types/database'

interface Props {
  current: number
  target: number
  tier: TierType
}

const tierColors: Record<TierType, string> = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#e5e4e2'
}

export function ProgressBar({ current, target, tier }: Props) {
  const percentage = Math.min((current / target) * 100, 100)

  return (
    <div className="progress-bar">
      <div
        className="progress-bar-fill"
        style={{
          width: `${percentage}%`,
          backgroundColor: tierColors[tier]
        }}
      />
    </div>
  )
}
