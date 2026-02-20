import React from "react"
import "./values.css"

const bubblePositions = [
  { left: "6%", top: "10%" },
  { left: "38%", top: "2%" },
  { left: "68%", top: "5%" },
  { left: "22%", top: "50%" },
  { left: "52%", top: "54%" },
]

export default function ValuesPanel({ valueWeights }) {
  return (
    <section className="home-card home-values-card">
      <header className="section-header values-header">
        <h2>Values In Your Solution</h2>
        <span className="values-view-chip">Bubble View</span>
      </header>
      <div className="value-bubble-wrap">
        {valueWeights.map((value, idx) => (
          <ValueBubble key={value.label} value={value} index={idx} />
        ))}
      </div>
    </section>
  )
}

function ValueBubble({ value, index }) {
  return (
    <div
      className={`value-bubble value-bubble-${value.tone}`}
      style={{
        left: bubblePositions[index].left,
        top: bubblePositions[index].top,
        width: `${80 + value.weight * 2.1}px`,
        height: `${80 + value.weight * 2.1}px`,
      }}
    >
      <span>{value.label}</span>
      <strong>{value.weight}%</strong>
    </div>
  )
}
