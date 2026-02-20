import React, { useMemo, useState } from "react"
import CalendarPanel from "../components/home/calendar"
import MapPanel from "../components/home/map"
import MatchCardsPanel from "../components/home/cards"
import ValuesPanel from "../components/home/values"
import { matches, valueWeights } from "../components/home/data"
import "../components/home/home-layout.css"

export default function Home() {
  const [activeMatchId, setActiveMatchId] = useState(matches[0].id)

  const activeMatch = useMemo(
    () => matches.find((match) => match.id === activeMatchId) ?? matches[0],
    [activeMatchId]
  )

  return (
    <div className="home-page">
      <div className="home-shell">
        <MapPanel activeMatch={activeMatch} />
        <CalendarPanel />
        <MatchCardsPanel
          matches={matches}
          activeMatchId={activeMatchId}
          onSelectMatch={setActiveMatchId}
        />
        <ValuesPanel valueWeights={valueWeights} />
      </div>
    </div>
  )
}
