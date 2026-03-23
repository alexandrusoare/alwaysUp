interface Props {
  level?: number
}

export function Avatar({ level = 1 }: Props) {
  return (
    <div className="avatar-container">
      <div className="avatar pixel-border">
        {/* Pixel art character - using CSS art */}
        <div className="pixel-character">
          <div className="pixel-head" />
          <div className="pixel-body" />
          <div className="pixel-legs" />
        </div>
      </div>
      <div className="avatar-level">
        <span className="level-label">LVL</span>
        <span className="level-num">{level}</span>
      </div>
    </div>
  )
}
