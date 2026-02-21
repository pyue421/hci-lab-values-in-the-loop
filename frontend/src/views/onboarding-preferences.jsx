import React, { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

const QUESTION_BANK = [
  { id: "q1", prompt: "During rides, you prefer:", a: "A calm, quiet ride where we can relax with little to no conversation.", b: "A friendly ride with light conversation to make the trip feel social and welcoming." },
  { id: "q2", prompt: "Pickup timing matters most when it is:", a: "Right on schedule, so I can plan my day confidently around exact pickup times.", b: "Flexible within a few minutes, as long as updates are shared clearly and early." },
  { id: "q3", prompt: "For route planning you value:", a: "The fastest route overall, even if it changes day to day based on traffic.", b: "A consistent, predictable route that helps me avoid uncertainty and stress." },
  { id: "q4", prompt: "In shared rides you prioritize:", a: "Lower trip cost, even if that means minor detours or a slightly longer ride.", b: "Higher comfort, with fewer detours and a smoother, more direct ride experience." },
  { id: "q5", prompt: "When plans change, you prefer:", a: "Immediate real-time updates so I can quickly adapt and make new plans.", b: "One clear summary message before pickup with all key changes in one place." },
  { id: "q6", prompt: "Driver behavior you value more:", a: "Smooth, steady driving that feels safe and comfortable throughout the trip.", b: "Fast and efficient driving that helps us arrive as quickly as possible." },
  { id: "q7", prompt: "For recurring trips, you'd rather:", a: "Ride with familiar people to build trust and predictable ride habits over time.", b: "Ride with whoever is available if it improves convenience and flexibility." },
  { id: "q8", prompt: "You care most about:", a: "Reducing environmental impact through efficient shared rides and fewer vehicles.", b: "Reducing travel uncertainty with dependable timing and clear expectations." },
  { id: "q9", prompt: "At pickup points, you prefer:", a: "The closest pickup location, even if it is slightly less visible to others.", b: "A safer, well-lit, and clearly visible pickup location, even if it is farther." },
  { id: "q10", prompt: "You feel best matched with riders who are:", a: "Highly punctual and reliable about arriving exactly when they say they will.", b: "Easygoing and adaptable when small delays or changes happen." },
  { id: "q11", prompt: "For wait time tolerance, you prefer:", a: "No waiting at pickup, so rides start exactly at the planned time.", b: "A short wait of up to five minutes, if communication stays clear and respectful." },
  { id: "q12", prompt: "For communication style, you prefer:", a: "Brief and direct messages that focus only on what is essential.", b: "Warm, conversational messages that feel personal and friendly." },
]

const SET_SIZE = 10

export default function OnboardingPreferences() {
  const navigate = useNavigate()
  const [regenCount, setRegenCount] = useState(0)
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [selected, setSelected] = useState(null) // "A" | "B" | "none" | null

  const questions = useMemo(() => makeQuestionSet(QUESTION_BANK, SET_SIZE, regenCount), [regenCount])
  const current = questions[index]
  const progressPct = Math.round(((index + 1) / questions.length) * 100)

  function choose(option) {
    setSelected(option)
    setAnswers((prev) => ({ ...prev, [current.id]: option }))
  }

  function next() {
    if (!selected) return
    if (index >= questions.length - 1) {
      navigate("/home")
      return
    }
    const nextIndex = index + 1
    const nextQ = questions[nextIndex]
    setIndex(nextIndex)
    setSelected(answers[nextQ.id] ?? null)
  }

  function back() {
    if (index === 0) {
      navigate("/onboarding/mandatory")
      return
    }
    const prevIndex = index - 1
    const prevQ = questions[prevIndex]
    setIndex(prevIndex)
    setSelected(answers[prevQ.id] ?? null)
  }

  function regenerate() {
    setRegenCount((n) => n + 1)
    setIndex(0)
    setAnswers({})
    setSelected(null)
  }

  return (
    <div className="onb-page">
      <div className="onb-card pref-card-shell">
        <div className="onb-progress pref-progress">
          <div className="onb-progress-bar" style={{ width: `${progressPct}%` }} />
        </div>

        <div className="pref-title">{current.prompt}</div>

        <div className="pref-choice-grid">
          <ChoiceCard
            option="A"
            text={current.a}
            selected={selected === "A"}
            onClick={() => choose("A")}
          />
          <ChoiceCard
            option="B"
            text={current.b}
            selected={selected === "B"}
            onClick={() => choose("B")}
          />
        </div>

        <label className="pref-none">
          <input
            type="radio"
            name={`none-${current.id}`}
            checked={selected === "none"}
            onChange={() => choose("none")}
          />
          <span>No preference</span>
        </label>

        <div className="pref-footer">
          <button className="btn btn-ghost" onClick={back}>Back</button>
          <div className="pref-footer-right">
            <button className="btn pref-regen-btn" onClick={regenerate}>
              <span className="pref-regen-icon" aria-hidden>
                <svg viewBox="0 0 24 24" className="pref-regen-icon-gemini">
                  <path d="M12 1.8c1.2 4.8 3.2 6.8 8 8.1-4.8 1.3-6.8 3.3-8 8.1-1.2-4.8-3.2-6.8-8-8.1 4.8-1.3 6.8-3.3 8-8.1z" />
                </svg>
              </span>
              Regenerate
            </button>
            <button className="btn btn-primary" onClick={next} disabled={!selected}>
              {index >= questions.length - 1 ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChoiceCard({ option, text, selected, onClick }) {
  return (
    <button type="button" className={`pref-choice${selected ? " pref-choice-selected" : ""}`} onClick={onClick}>
      <span className="pref-choice-badge">{option}</span>
      <div className="pref-choice-text">{text}</div>
    </button>
  )
}

function makeQuestionSet(bank, size, seed) {
  const withWeight = [...bank].map((q, i) => ({ q, sort: pseudoRand(i + 1, seed + 1) }))
  withWeight.sort((a, b) => a.sort - b.sort)
  return withWeight.slice(0, size).map((x) => x.q)
}

function pseudoRand(x, seed) {
  const n = Math.sin(x * 12.9898 + seed * 78.233) * 43758.5453
  return n - Math.floor(n)
}
