interface Props {
  level?: number
  gender?: 'male' | 'female' | null
}

export function Avatar({ level = 1, gender }: Props) {
  const isFemale = gender === 'female'

  return (
    <div className="avatar-container">
      <div className="avatar pixel-border">
        <div className={`pixel-character ${isFemale ? 'female' : 'male'}`}>
          <div className="pixel-hair" />
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
