import React, { useId, useMemo, useState } from "react"
import { MotionMergedBubble } from "./values-motion"
import "./values.css"

const bubblePositions = [
  { left: "6%", top: "10%" },
  { left: "38%", top: "2%" },
  { left: "68%", top: "5%" },
  { left: "22%", top: "50%" },
  { left: "52%", top: "54%" },
]

export default function ValuesPanel({ valueWeights, activeMatch }) {
  const [viewMode, setViewMode] = useState("bubble")
  const matchScoreByLabel = buildMatchScoreMap(activeMatch)
  const valuesByPriority = useMemo(
    () => [...valueWeights].sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label)),
    [valueWeights]
  )

  return (
    <section className="home-card home-values-card">
      <header className="section-header values-header">
        <h2>Values In Your Solution</h2>
        <select
          className="values-view-select"
          value={viewMode}
          onChange={(event) => setViewMode(event.target.value)}
          aria-label="Choose values view"
        >
          <option value="bubble">Bubble View</option>
          <option value="list">List View</option>
        </select>
      </header>

      {viewMode === "bubble" ? (
        <div className="value-bubble-wrap">
          {valueWeights.map((value, idx) => (
            <ValueBubble
              key={value.label}
              value={value}
              index={idx}
              matchedScore={matchScoreByLabel.get(value.label)}
              hasSelection={Boolean(activeMatch)}
            />
          ))}
        </div>
      ) : (
        <div className="values-list-wrap">
          {valuesByPriority.map((value, idx) => {
            const score = Number.isFinite(matchScoreByLabel.get(value.label)) ? matchScoreByLabel.get(value.label) : 0
            return (
              <article key={value.label} className={`values-list-item values-list-item-${value.tone}`}>
                <span className="values-list-rank">{idx + 1}</span>
                <div className="values-list-main">
                  <strong>{value.label}</strong>
                  <span>{`${value.weight}%`}</span>
                </div>
                <div className="values-list-score">{`${score}% match`}</div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}

function buildMatchScoreMap(activeMatch) {
  if (!activeMatch) return new Map()

  if (activeMatch.valueMatchScores && typeof activeMatch.valueMatchScores === "object") {
    return new Map(
      Object.entries(activeMatch.valueMatchScores)
        .map(([label, score]) => [label, Number(score)])
        .filter(([, score]) => Number.isFinite(score))
    )
  }

  if (Array.isArray(activeMatch.valueMatches)) {
    return new Map(
      activeMatch.valueMatches
        .filter((entry) => entry && typeof entry.label === "string")
        .map((entry) => [entry.label, Number(entry.score)])
        .filter(([, score]) => Number.isFinite(score))
    )
  }

  const fallbackRankScores = [60, 20, 20]
  return new Map((activeMatch.values ?? []).map((label, idx) => [label, fallbackRankScores[idx] ?? 20]))
}

function ValueBubble({ value, index, matchedScore, hasSelection }) {
  const isMatched = Number.isFinite(matchedScore)
  const gradientId = useId()
  const toneStyles = getMergedToneStyles(value.tone)
  const className = `value-bubble value-bubble-${value.tone}${
    hasSelection ? " value-bubble-with-selection" : ""
  }${isMatched ? " value-bubble-merged" : ""}`
  const style = {
    left: bubblePositions[index].left,
    top: bubblePositions[index].top,
    width: `${isMatched ? 208 : 80 + value.weight * 2.1}px`,
    height: `${isMatched ? 132 : 80 + value.weight * 2.1}px`,
  }

  if (isMatched) {
    return (
      <MotionMergedBubble
        className={className}
        style={style}
        gradientId={gradientId}
        toneStyles={toneStyles}
        label={value.label}
        matchedScore={matchedScore}
      />
    )
  }

  return (
    <div className={className} style={style}>
      <span>{value.label}</span>
      <strong>{`${value.weight}%`}</strong>
    </div>
  )
}

/* ----------------------------- */
/* TONE STYLES */
/* ----------------------------- */

function getMergedToneStyles(tone) {
  const leftFill = "#fee9da"
  const leftStroke = "#ffc39d"

  switch (tone) {
    case "green":
      return {
        fillLeft: leftFill,
        fillRight: "#B6F3D4",
        strokeLeft: leftStroke,
        strokeRight: "#49e194",
      }
    case "violet":
      return {
        fillLeft: leftFill,
        fillRight: "#E4D1F7",
        strokeLeft: leftStroke,
        strokeRight: "#c281eb",
      }
    case "cyan":
      return {
        fillLeft: leftFill,
        fillRight: "#C4F0FF",
        strokeLeft: leftStroke,
        strokeRight: "#48cbf4",
      }
    case "amber":
      return {
        fillLeft: leftFill,
        fillRight: "#FBE89E",
        strokeLeft: leftStroke,
        strokeRight: "#ffd351",
      }
    case "rose":
    default:
      return {
        fillLeft: leftFill,
        fillRight: "#FFE1EE",
        strokeLeft: leftStroke,
        strokeRight: "#FD81C9",
      }
  }
}
