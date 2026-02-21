import React, { useEffect, useMemo, useRef, useState } from "react"
import CalendarPanel from "../components/home/calendar"
import MapPanel from "../components/home/map"
import MatchCardsPanel from "../components/home/cards"
import ValuesPanel from "../components/home/values"
import { matches, valueWeights } from "../components/home/data"
import "../components/home/home-layout.css"

export default function Home() {
  const [activeMatchId, setActiveMatchId] = useState(null)
  const [leftWidthPct, setLeftWidthPct] = useState(49)
  const [rightTopPct, setRightTopPct] = useState(62)
  const [dragType, setDragType] = useState(null)
  const shellRef = useRef(null)
  const rightColumnRef = useRef(null)
  const matchesAreaRef = useRef(null)

  const selectedMatch = useMemo(
    () => matches.find((match) => match.id === activeMatchId) ?? null,
    [activeMatchId]
  )

  useEffect(() => {
    if (!dragType) return

    function onMouseMove(event) {
      if (dragType === "vertical" && shellRef.current) {
        const rect = shellRef.current.getBoundingClientRect()
        const next = ((event.clientX - rect.left) / rect.width) * 100
        setLeftWidthPct(clamp(next, 30, 70))
      }

      if (dragType === "horizontal" && rightColumnRef.current) {
        const rect = rightColumnRef.current.getBoundingClientRect()
        const next = ((event.clientY - rect.top) / rect.height) * 100
        setRightTopPct(clamp(next, 34, 74))
      }
    }

    function onMouseUp() {
      setDragType(null)
    }

    document.body.style.userSelect = "none"
    document.body.style.cursor = dragType === "vertical" ? "col-resize" : "row-resize"
    window.addEventListener("mousemove", onMouseMove)
    window.addEventListener("mouseup", onMouseUp)

    return () => {
      document.body.style.userSelect = ""
      document.body.style.cursor = ""
      window.removeEventListener("mousemove", onMouseMove)
      window.removeEventListener("mouseup", onMouseUp)
    }
  }, [dragType])

  useEffect(() => {
    function onDocumentPointerDown(event) {
      if (!activeMatchId) return
      if (!matchesAreaRef.current) return
      if (matchesAreaRef.current.contains(event.target)) return
      setActiveMatchId(null)
    }

    document.addEventListener("pointerdown", onDocumentPointerDown)
    return () => {
      document.removeEventListener("pointerdown", onDocumentPointerDown)
    }
  }, [activeMatchId])

  return (
    <div className="home-page">
      <div className="home-shell home-shell-split" ref={shellRef}>
        <section className="home-card home-left-card" style={{ width: `${leftWidthPct}%` }}>
          <div className="home-left-map">
            <MapPanel activeMatch={selectedMatch} embedded />
          </div>
          <div className="home-left-divider" />
          <div className="home-left-matches" ref={matchesAreaRef}>
            <MatchCardsPanel
              matches={matches}
              activeMatchId={activeMatchId}
              onSelectMatch={(nextId) => setActiveMatchId((currentId) => (currentId === nextId ? null : nextId))}
              embedded
            />
          </div>
        </section>

        <button
          type="button"
          className="home-splitter home-splitter-vertical"
          onMouseDown={() => setDragType("vertical")}
          aria-label="Resize left and right panels"
        />

        <div className="home-right-column" style={{ width: `${100 - leftWidthPct}%` }} ref={rightColumnRef}>
          <div className="home-right-top" style={{ height: `${rightTopPct}%` }}>
            <CalendarPanel />
          </div>

          <button
            type="button"
            className="home-splitter home-splitter-horizontal"
            onMouseDown={() => setDragType("horizontal")}
            aria-label="Resize calendar and values panels"
          />

          <div className="home-right-bottom" style={{ height: `${100 - rightTopPct}%` }}>
            <ValuesPanel valueWeights={valueWeights} activeMatch={selectedMatch} />
          </div>
        </div>
      </div>
    </div>
  )
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
