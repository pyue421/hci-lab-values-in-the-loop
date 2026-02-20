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
                d="M16 29.2c-0.7 0-1.4-0.3-1.9-0.8L6.5 20.8C4.2 18.5 3 15.6 3 12.5C3 5.6 8.6 0 15.5 0C22.4 0 28 5.6 28 12.5c0 3.1-1.2 6-3.5 8.3l-6.6 7.6c-0.5 0.5-1.2 0.8-1.9 0.8zM15.5 3.2c-5.1 0-9.3 4.2-9.3 9.3 0 2.3 0.9 4.5 2.6 6.2l6.7 7.5 6.6-7.5c1.7-1.7 2.6-3.9 2.6-6.2 0-5.1-4.2-9.3-9.2-9.3z"
                fill="currentColor"
              />
              <circle cx="15.5" cy="12.4" r="3.8" fill="currentColor" />
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
            <span className="summary-icon">✶</span>
            <p>{match.aiSummary}</p>
          </div>

          <div className="signal-wrap">
            <RadarMap profileA={match.signalProfileA} profileB={match.signalProfileB} />
          </div>
        </div>

        <div className="match-right-col">
          <div className="meta-stack">
            <div className="meta-row">
              <span className="meta-row-label">Availability:</span>
              <strong className="status-chip">● {match.role}</strong>
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

function RadarMap({ profileA, profileB }) {
  const size = 240
  const center = 120
  const radius = 92
  const steps = 6
  const axisCount = profileA.length

  function pointsFor(values) {
    return values
      .map((value, idx) => {
        const angle = ((Math.PI * 2) / axisCount) * idx - Math.PI / 2
        const r = (value / 100) * radius
        return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`
      })
      .join(" ")
  }

  function ringPoints(step) {
    const r = (step / steps) * radius
    return Array.from({ length: axisCount }, (_, idx) => {
      const angle = ((Math.PI * 2) / axisCount) * idx - Math.PI / 2
      return `${center + Math.cos(angle) * r},${center + Math.sin(angle) * r}`
    }).join(" ")
  }

  return (
    <svg className="radar-map" viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Values alignment map">
      {Array.from({ length: steps }, (_, i) => (
        <polygon key={i} points={ringPoints(i + 1)} className="radar-ring" />
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

      <polygon points={pointsFor(profileB)} className="radar-shape radar-shape-b" />
      <polygon points={pointsFor(profileA)} className="radar-shape radar-shape-a" />
    </svg>
  )
}
