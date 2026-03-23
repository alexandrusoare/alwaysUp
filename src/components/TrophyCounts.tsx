import { PixelTrophy } from './PixelTrophy'

interface Props {
  counts: {
    bronze: number
    silver: number
    gold: number
    platinum: number
    total: number
  }
}

export function TrophyCounts({ counts }: Props) {
  return (
    <div className="trophy-counts">
      <div className="trophy-count platinum">
        <PixelTrophy tier="platinum" size="small" />
        <span className="trophy-count-num">{counts.platinum}</span>
      </div>
      <div className="trophy-count gold">
        <PixelTrophy tier="gold" size="small" />
        <span className="trophy-count-num">{counts.gold}</span>
      </div>
      <div className="trophy-count silver">
        <PixelTrophy tier="silver" size="small" />
        <span className="trophy-count-num">{counts.silver}</span>
      </div>
      <div className="trophy-count bronze">
        <PixelTrophy tier="bronze" size="small" />
        <span className="trophy-count-num">{counts.bronze}</span>
      </div>
      <div className="trophy-count total">
        <span className="trophy-count-label">Total</span>
        <span className="trophy-count-num">{counts.total}</span>
      </div>
    </div>
  )
}
