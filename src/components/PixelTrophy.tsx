import type { TierType } from '../types/database'

interface Props {
  tier: TierType
  size?: 'small' | 'medium' | 'large'
  locked?: boolean
}

export function PixelTrophy({ tier, size = 'medium', locked = false }: Props) {
  const sizeClass = `pixel-trophy-${size}`

  return (
    <div className={`pixel-trophy ${tier} ${sizeClass} ${locked ? 'locked' : ''}`}>
      <div className="trophy-cup">
        <div className="trophy-rim" />
        <div className="trophy-body" />
        <div className="trophy-shine" />
      </div>
      <div className="trophy-stem" />
      <div className="trophy-base" />
    </div>
  )
}
