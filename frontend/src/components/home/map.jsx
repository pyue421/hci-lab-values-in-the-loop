import React, { useMemo } from "react"
import { userHomeCoordinates } from "./data"
import "./map.css"

export default function MapPanel({ activeMatch, embedded = false }) {
  const from = `${userHomeCoordinates.lat},${userHomeCoordinates.lng}`
  const hasSelectedMatch = Boolean(activeMatch)
  const to = hasSelectedMatch ? `${activeMatch.coordinates.lat},${activeMatch.coordinates.lng}` : ""

  const embedMapUrl = useMemo(
    () =>
      hasSelectedMatch
        ? `https://maps.google.com/maps?saddr=${encodeURIComponent(from)}&daddr=${encodeURIComponent(to)}&output=embed`
        : `https://maps.google.com/maps?q=${encodeURIComponent(from)}&z=14&output=embed`,
    [from, to, hasSelectedMatch]
  )

  const fallbackMapUrl = useMemo(
    () =>
      hasSelectedMatch
        ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(from)}`,
    [from, to, hasSelectedMatch]
  )

  const content = (
    <>
      <header className="section-header">
        <h2>Live Match Zone</h2>
        <p>{hasSelectedMatch ? activeMatch.locationLabel : "Select a match to view route"}</p>
      </header>
      <div className="map-frame-wrap">
        <iframe
          className="map-canvas"
          title={hasSelectedMatch ? "Google map route" : "Google map"}
          src={embedMapUrl}
          frameBorder="0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          aria-label="Google map"
        />
        <a href={fallbackMapUrl} className="map-fallback-link map-open-link" target="_blank" rel="noreferrer">
          Open map
        </a>
      </div>
    </>
  )

  if (embedded) {
    return <div className="map-panel-inner">{content}</div>
  }

  return <section className="home-card home-map-card">{content}</section>
}
