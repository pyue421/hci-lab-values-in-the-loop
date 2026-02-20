import React from "react"
import "./map.css"

export default function MapPanel({ activeMatch }) {
  const mapUrl = `https://www.google.com/maps?q=${activeMatch.coordinates.lat},${activeMatch.coordinates.lng}&z=14&output=embed`

  return (
    <section className="home-card home-map-card">
      <header className="section-header">
        <h2>Live Match Zone</h2>
        <p>{activeMatch.locationLabel}</p>
      </header>
      <div className="map-frame-wrap">
        <iframe
          title="Live map"
          src={mapUrl}
          className="map-frame"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </section>
  )
}
