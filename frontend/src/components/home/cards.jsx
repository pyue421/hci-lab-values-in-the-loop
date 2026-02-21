import React from "react"
import "./cards.css"

export default function MatchCardsPanel({ matches, activeMatchId, onSelectMatch, embedded = false }) {
  const content = (
    <>
      <header className="section-header">
        <h2>Best Matches</h2>
      </header>
      <div className="match-list">
        {matches.map((match) => (
          <MatchCard
            key={match.id}
            match={match}
            active={match.id === activeMatchId}
            onClick={() => onSelectMatch(match.id)}
          />
        ))}
      </div>
    </>
  )

  if (embedded) {
    return <div className="cards-panel-inner">{content}</div>
  }

  return <section className="home-card home-matches-card">{content}</section>
}

function MatchCard({ match, active, onClick }) {
  return (
    <button type="button" className={`match-card${active ? " match-card-active" : ""}`} onClick={onClick}>
      <div className="match-head-v2">
        <div className="avatar avatar-large">{match.initials}</div>

        <div className="match-profile">
          <strong>{match.name}</strong>
          <span className="match-term"><span className="inline-icon">◎</span>{match.term}</span>
        </div>

        <div className="match-distance">
          <div className="distance-icon" aria-hidden>
            <svg viewBox="0 0 32 32" className="distance-pin-icon">
              <path
                d="M12 14a4 4 0 1 0 8 0a4 4 0 0 0 -8 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M23.543 21.543l-5.657 5.657a2.667 2.667 0 0 1 -3.771 0l-5.658 -5.657a10.667 10.667 0 1 1 15.086 0z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <div>{match.distanceKm} km</div>
            <div>{match.etaMins} mins</div>
          </div>
        </div>
      </div>

      <div className="match-body-grid">
        <div className="match-left-col">
          <div className="ai-summary-box">
            <span className="summary-icon" aria-hidden>
              <svg viewBox="0 0 24 24" className="summary-icon-gemini">
                <path d="M12 1.8c1.2 4.8 3.2 6.8 8 8.1-4.8 1.3-6.8 3.3-8 8.1-1.2-4.8-3.2-6.8-8-8.1 4.8-1.3 6.8-3.3 8-8.1z" />
              </svg>
            </span>
            <p>{match.aiSummary}</p>
          </div>

          <div className="signal-wrap">
            <RadarMap profileA={match.signalProfileA} profileB={match.signalProfileB} valueMatchScores={match.valueMatchScores} />
          </div>
        </div>

        <div className="match-right-col">
          <div className="meta-stack">
            <div className="meta-row">
              <span className="meta-row-label">Availability:</span>
              <strong className="status-chip"><span className="status-dot" aria-hidden>●</span>{match.role}</strong>
            </div>
            <div className="meta-row">
              <span className="meta-row-label">Buffer Time:</span>
              <strong>{match.bufferMins} mins</strong>
            </div>
            <div className="meta-row">
              <span className="meta-row-label">Seats:</span>
              <strong>{match.seats}</strong>
            </div>
          </div>

          <div className="interests-block">
            <h4>Interests</h4>
            <div className="interest-tags">
              {match.interests.map((interest) => (
                <span key={interest.label} className={`interest-pill interest-${interest.tone}`}>
                  {interest.emoji} {interest.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

function RadarMap({ profileA, profileB, valueMatchScores }) {
  const VALUE_AXES = ["Environmental Impact", "Punctuality", "Trustworthiness", "Efficiency", "Kindness"]
  const size = 240
  const center = 120
  const radius = 114
  const steps = 6
  const axisCount = VALUE_AXES.length
  const normalizedA = normalizeProfile(profileA, axisCount)
  const normalizedB = normalizeProfile(profileB, axisCount)

  function pointsFor(values) {
    return values
      .map((value, idx) => {
        const angle = ((Math.PI * 2) / axisCount) * idx - Math.PI / 2
        const r = (value / 100) * radius
        return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`
      })
      .join(" ")
  }

  function axisPoint(idx, value = 100) {
    const angle = ((Math.PI * 2) / axisCount) * idx - Math.PI / 2
    const r = (value / 100) * radius
    return {
      x: center + Math.cos(angle) * r,
      y: center + Math.sin(angle) * r,
    }
  }

  function matchScoreFor(label) {
    const score = Number(valueMatchScores?.[label])
    return Number.isFinite(score) ? score : 20
  }

  return (
    <svg className="radar-map" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Values alignment map">
      {Array.from({ length: steps }, (_, i) => (
        <circle
          key={i}
          cx={center}
          cy={center}
          r={((i + 1) / steps) * radius}
          className="radar-ring-circle"
        />
      ))}

      {Array.from({ length: axisCount }, (_, idx) => {
        const angle = ((Math.PI * 2) / axisCount) * idx - Math.PI / 2
        return (
          <line
            key={idx}
            x1={center}
            y1={center}
            x2={center + Math.cos(angle) * radius}
            y2={center + Math.sin(angle) * radius}
            className="radar-axis"
          />
        )
      })}

      <polygon points={pointsFor(normalizedB)} className="radar-shape radar-shape-b" />
      <polygon points={pointsFor(normalizedA)} className="radar-shape radar-shape-a" />

      {VALUE_AXES.map((label, idx) => {
        const point = axisPoint(idx, normalizedB[idx])
        const score = matchScoreFor(label)
        return (
          <circle key={label} cx={point.x} cy={point.y} r="7" className="radar-corner-hit">
            <title>{`${label}: ${score}% match`}</title>
          </circle>
        )
      })}
    </svg>
  )
}

function normalizeProfile(values, length) {
  return Array.from({ length }, (_, idx) => {
    const v = Number(values?.[idx])
    if (!Number.isFinite(v)) return 0
    return Math.max(0, Math.min(100, v))
  })
}
