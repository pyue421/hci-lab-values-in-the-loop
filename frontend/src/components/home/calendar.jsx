import React, { useEffect, useMemo, useRef, useState } from "react"
import "./calendar.css"

const ROW_HEIGHT = 64
const HOURS = Array.from({ length: 24 }, (_, idx) => idx)
const WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"]

const eventTemplates = [
  { id: "e1", title: "Team Meeting", dayIndex: 0, start: "09:00", end: "10:30", tone: "purple" },
  { id: "e2", title: "Aviation Practice", dayIndex: 1, start: "11:00", end: "12:30", tone: "blue" },
  { id: "e3", title: "Activity", dayIndex: 2, start: "12:00", end: "13:30", tone: "purple" },
  { id: "e4", title: "Aviation Practice", dayIndex: 4, start: "09:00", end: "10:30", tone: "blue" },
]

const availabilityTemplates = {
  eloi: [
    { id: "a1", dayIndex: 1, start: "10:00", end: "12:10" },
    { id: "a2", dayIndex: 4, start: "10:00", end: "12:15" },
  ],
  maya: [
    { id: "a3", dayIndex: 0, start: "13:00", end: "15:00" },
    { id: "a4", dayIndex: 2, start: "09:30", end: "11:45" },
  ],
}

export default function CalendarPanel({ activeMatch, onBackToCalendar }) {
  const [weekOffset, setWeekOffset] = useState(0)
  const scrollerRef = useRef(null)
  const hasSelectedMatch = Boolean(activeMatch)

  const weekStart = useMemo(() => {
    const base = startOfWeekMonday(new Date())
    return addDays(base, weekOffset * 7)
  }, [weekOffset])

  const visibleDays = useMemo(
    () => WEEKDAY_NAMES.map((name, index) => ({ name, date: addDays(weekStart, index) })),
    [weekStart]
  )

  useEffect(() => {
    if (!scrollerRef.current) return
    scrollerRef.current.scrollTop = 8 * ROW_HEIGHT
  }, [])

  function goToday() {
    setWeekOffset(0)
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = 8 * ROW_HEIGHT
    }
  }

  const availabilitySlots = hasSelectedMatch ? availabilityTemplates[activeMatch.id] ?? [] : []

  return (
    <section className="home-calendar-card">
      <header className="calendar-topbar">
        <div className="calendar-top-left">
          {hasSelectedMatch ? (
            <button type="button" className="calendar-back-button" onClick={onBackToCalendar}>
              <svg viewBox="0 0 24 24" className="calendar-chevron-icon calendar-back-chevron" aria-hidden>
                <path d="M15 5L8 12L15 19" />
              </svg>
              Back
            </button>
          ) : (
            <div className="calendar-week-nav">
              <button type="button" className="calendar-arrow" onClick={() => setWeekOffset((w) => w - 1)} aria-label="Previous week">
                <svg viewBox="0 0 24 24" className="calendar-chevron-icon" aria-hidden>
                  <path d="M15 5L8 12L15 19" />
                </svg>
              </button>
              <div className="calendar-week-label">{formatWeekRange(weekStart)}</div>
              <button type="button" className="calendar-arrow" onClick={() => setWeekOffset((w) => w + 1)} aria-label="Next week">
                <svg viewBox="0 0 24 24" className="calendar-chevron-icon" aria-hidden>
                  <path d="M9 5L16 12L9 19" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <h2 className={`calendar-title${hasSelectedMatch ? " calendar-title-selected" : ""}`}>
          {hasSelectedMatch ? `Schedule a ride with ${activeMatch.name}` : "My Calendar"}
        </h2>

        {hasSelectedMatch ? <div /> : (
          <button type="button" className="today-pill calendar-today" onClick={goToday}>
            Today
          </button>
        )}
      </header>

      <div className="calendar-days-header">
        <div className="calendar-time-head" />
        {visibleDays.map((day) => {
          const isToday = isSameDate(day.date, new Date())
          return (
            <div key={day.name} className={`calendar-day-header-cell${isToday ? " is-today" : ""}`}>
              <span>{day.name}</span>
              <strong>{day.date.getDate()}</strong>
            </div>
          )
        })}
      </div>

      <div className="calendar-scroll" ref={scrollerRef}>
        <div className="calendar-scroll-body" style={{ height: `${ROW_HEIGHT * HOURS.length}px` }}>
          <div className="calendar-time-column">
            {HOURS.map((hour) => (
              <div key={hour} className="calendar-time-label" style={{ height: `${ROW_HEIGHT}px` }}>
                {formatHour(hour)}
              </div>
            ))}
          </div>

          <div className="calendar-days-columns">
            {visibleDays.map((day, dayIndex) => (
              <div key={`${day.name}-${day.date.toDateString()}`} className="calendar-day-column">
                {HOURS.map((hour) => (
                  <div key={`${day.name}-${hour}`} className="calendar-grid-line" style={{ height: `${ROW_HEIGHT}px` }} />
                ))}

                {eventTemplates
                  .filter((event) => event.dayIndex === dayIndex)
                  .map((event) => {
                    const startMinutes = toMinutes(event.start)
                    const endMinutes = toMinutes(event.end)
                    const duration = endMinutes - startMinutes

                    return (
                      <article
                        key={event.id}
                        className={`calendar-event-card calendar-event-${event.tone}`}
                        style={{
                          top: `${(startMinutes / 60) * ROW_HEIGHT}px`,
                          height: `${(duration / 60) * ROW_HEIGHT}px`,
                        }}
                      >
                        <strong>{event.title}</strong>
                        <span>{formatEventTime(event.start, event.end)}</span>
                      </article>
                    )
                  })}

                {availabilitySlots
                  .filter((slot) => slot.dayIndex === dayIndex)
                  .map((slot) => {
                    const startMinutes = toMinutes(slot.start)
                    const endMinutes = toMinutes(slot.end)
                    const duration = endMinutes - startMinutes

                    return (
                      <article
                        key={slot.id}
                        className="calendar-availability-card"
                        style={{
                          top: `${(startMinutes / 60) * ROW_HEIGHT}px`,
                          height: `${(duration / 60) * ROW_HEIGHT}px`,
                        }}
                      >
                        <strong>{`Availability with ${activeMatch.name.split(" ")[0]}`}</strong>
                        <span>{formatEventTime(slot.start, slot.end)}</span>
                        <div className="calendar-availability-actions">
                          <button type="button" className="calendar-availability-btn calendar-availability-btn-primary">
                            Schedule
                          </button>
                        </div>
                      </article>
                    )
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function startOfWeekMonday(date) {
  const base = new Date(date)
  base.setHours(0, 0, 0, 0)
  const day = base.getDay()
  const diff = day === 0 ? -6 : 1 - day
  base.setDate(base.getDate() + diff)
  return base
}

function addDays(date, days) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

function formatWeekRange(weekStart) {
  const weekEnd = addDays(weekStart, 6)
  const firstMonth = weekStart.toLocaleString("en-US", { month: "short" })
  const secondMonth = weekEnd.toLocaleString("en-US", { month: "short" })

  if (firstMonth === secondMonth) {
    return `${firstMonth} ${weekStart.getDate()}-${weekEnd.getDate()}`
  }

  return `${firstMonth} ${weekStart.getDate()}-${secondMonth} ${weekEnd.getDate()}`
}

function toMinutes(timeString) {
  const [hh, mm] = timeString.split(":").map(Number)
  return hh * 60 + mm
}

function formatHour(hour24) {
  if (hour24 === 0) return "12 AM"
  if (hour24 < 12) return `${hour24} AM`
  if (hour24 === 12) return "12 PM"
  return `${hour24 - 12} PM`
}

function formatEventTime(start, end) {
  return `${toDisplayTime(start)} - ${toDisplayTime(end)}`
}

function toDisplayTime(hhmm) {
  const [hh, mm] = hhmm.split(":").map(Number)
  const suffix = hh >= 12 ? "PM" : "AM"
  const hour12 = hh % 12 === 0 ? 12 : hh % 12
  return `${hour12}:${String(mm).padStart(2, "0")} ${suffix}`
}

function isSameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}
