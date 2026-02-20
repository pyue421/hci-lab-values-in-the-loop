import React, { useEffect, useMemo, useRef, useState } from "react"
import { userHomeCoordinates } from "./data"
import "./map.css"

let leafletScriptPromise

function loadLeaflet() {
  if (window.L) {
    return Promise.resolve(window.L)
  }

  if (leafletScriptPromise) {
    return leafletScriptPromise
  }

  leafletScriptPromise = new Promise((resolve, reject) => {
    const cssId = "leaflet-css-cdn"
    if (!document.getElementById(cssId)) {
      const css = document.createElement("link")
      css.id = cssId
      css.rel = "stylesheet"
      css.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      css.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
      css.crossOrigin = ""
      document.head.appendChild(css)
    }

    const scriptId = "leaflet-js-cdn"
    const existing = document.getElementById(scriptId)
    if (existing) {
      existing.addEventListener("load", () => resolve(window.L))
      existing.addEventListener("error", () => reject(new Error("Failed to load Leaflet script.")))
      return
    }

    const script = document.createElement("script")
    script.id = scriptId
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
    script.crossOrigin = ""
    script.async = true
    script.defer = true
    script.onload = () => resolve(window.L)
    script.onerror = () => reject(new Error("Failed to load Leaflet script."))
    document.head.appendChild(script)
  })

  return leafletScriptPromise
}

export default function MapPanel({ activeMatch, embedded = false }) {
  const mapContainerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const homeMarkerRef = useRef(null)
  const [mapError, setMapError] = useState("")

  const fallbackMapUrl = useMemo(
    () => `https://www.openstreetmap.org/?mlat=${activeMatch.coordinates.lat}&mlon=${activeMatch.coordinates.lng}#map=14/${activeMatch.coordinates.lat}/${activeMatch.coordinates.lng}`,
    [activeMatch.coordinates.lat, activeMatch.coordinates.lng]
  )

  useEffect(() => {
    let cancelled = false

    async function initMap() {
      try {
        const L = await loadLeaflet()
        if (cancelled || !L || !mapContainerRef.current) return

        const matchPosition = [activeMatch.coordinates.lat, activeMatch.coordinates.lng]
        const homePosition = [userHomeCoordinates.lat, userHomeCoordinates.lng]

        if (!mapRef.current) {
          mapRef.current = L.map(mapContainerRef.current, {
            zoomControl: true,
            scrollWheelZoom: true,
          }).setView(matchPosition, 14)

          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "&copy; OpenStreetMap contributors",
          }).addTo(mapRef.current)
        }

        if (!homeMarkerRef.current) {
          const homeIcon = L.divIcon({
            className: "map-home-marker-wrap",
            html: '<div class="map-home-marker">⌂</div>',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          })

          homeMarkerRef.current = L.marker(homePosition, { icon: homeIcon }).addTo(mapRef.current)
          homeMarkerRef.current.bindPopup(
            '<div class="leaflet-popup-card"><strong>Your home</strong><span>Current user location</span></div>'
          )
        }

        if (!markerRef.current) {
          markerRef.current = L.marker(matchPosition).addTo(mapRef.current)
        } else {
          markerRef.current.setLatLng(matchPosition)
        }

        markerRef.current
          .bindPopup(
            `<div class="leaflet-popup-card"><strong>${activeMatch.etaMins} mins away</strong><span>${activeMatch.locationLabel}</span></div>`,
            { autoPan: true }
          )
          .openPopup()

        const bounds = L.latLngBounds([matchPosition, homePosition])
        mapRef.current.fitBounds(bounds, { padding: [36, 36], maxZoom: 14 })

        setMapError("")
      } catch (error) {
        if (!cancelled) {
          setMapError(error.message || "Unable to load Leaflet map.")
        }
      }
    }

    initMap()

    return () => {
      cancelled = true
    }
  }, [activeMatch])

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
        markerRef.current = null
        homeMarkerRef.current = null
      }
    }
  }, [])

  const content = (
    <>
      <header className="section-header">
        <h2>Live Match Zone</h2>
        <p>{activeMatch.locationLabel}</p>
      </header>
      <div className="map-frame-wrap">
        {mapError ? (
          <div className="map-fallback-wrap">
            <a href={fallbackMapUrl} className="map-fallback-link" target="_blank" rel="noreferrer">
              Open map
            </a>
            <div className="map-fallback-note">{mapError}</div>
          </div>
        ) : (
          <div ref={mapContainerRef} className="map-canvas" aria-label="Interactive map" />
        )}
      </div>
    </>
  )

  if (embedded) {
    return <div className="map-panel-inner">{content}</div>
  }

  return <section className="home-card home-map-card">{content}</section>
}
