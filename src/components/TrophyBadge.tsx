import type { TrophyWithAction, TierType } from '../types/database'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { PixelTrophy } from './PixelTrophy'

interface Props {
  trophy: TrophyWithAction
}

const tierColors: Record<TierType, string> = {
  bronze: '#cd7f32',
  silver: '#c0c0c0',
  gold: '#ffd700',
  platinum: '#e5e4e2'
}

export function TrophyBadge({ trophy }: Props) {
  const timeAgo = formatDistanceToNow(parseISO(trophy.unlocked_at), { addSuffix: true })

  return (
    <div
      className="trophy-badge-card pixel-border"
      style={{ '--trophy-color': tierColors[trophy.tier_type] } as React.CSSProperties}
    >
      <PixelTrophy tier={trophy.tier_type} size="medium" />
      <div className="trophy-badge-info">
        <div className="trophy-badge-title">{trophy.tier.funny_title}</div>
        <div className="trophy-badge-action">{trophy.action.name}</div>
        <div className="trophy-badge-tier">{trophy.tier_type.toUpperCase()}</div>
        <div className="trophy-badge-time">{timeAgo}</div>
      </div>
    </div>
  )
}
