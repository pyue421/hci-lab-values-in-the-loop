import React from "react"
import "./cards.css"

export default function MatchCardsPanel({ matches, activeMatchId, onSelectMatch }) {
  return (
    <section className="home-card home-matches-card">
      <header className="section-header">
        <h2>Best Matches</h2>
        <p>Based on your route and values profile</p>
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
    </section>
  )
}

function MatchCard({ match, active, onClick }) {
  return (
    <button type="button" className={`match-card${active ? " match-card-active" : ""}`} onClick={onClick}>
      <div className="match-head">
        <div className="avatar">{match.initials}</div>
        <div className="match-meta">
          <strong>{match.name}</strong>
          <span>{match.subtitle}</span>
        </div>
        <div className="compat-pill">{match.compatibility}%</div>
      </div>

      <p className="match-note">You both prioritize predictable rides and respectful communication.</p>

      <div className="match-stats">
        <span>{match.distanceKm} km</span>
        <span>{match.etaMins} mins</span>
        <span>{match.role}</span>
        <span>{match.seats} seats</span>
        <span>Buffer {match.bufferMins} mins</span>
      </div>

      <div className="tag-row">
        {match.interests.map((interest) => (
          <span key={interest} className="tag">{interest}</span>
        ))}
      </div>

      <div className="tag-row tag-row-values">
        {match.values.map((value) => (
          <span key={value} className="tag tag-value">{value}</span>
        ))}
      </div>
    </button>
  )
}
