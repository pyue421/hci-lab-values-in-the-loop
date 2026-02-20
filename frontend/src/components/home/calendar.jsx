import React, { useEffect, useMemo, useRef, useState } from "react"
import "./calendar.css"

const ROW_HEIGHT = 64
const HOURS = Array.from({ length: 24 }, (_, idx) => idx)
const WEEKDAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri"]

const eventTemplates = [
  { id: "e1", title: "Team Meeting", dayIndex: 0, start: "09:00", end: "10:30", tone: "purple" },
  { id: "e2", title: "Aviation Practice", dayIndex: 1, start: "11:00", end: "12:30", tone: "blue" },
  { id: "e3", title: "Activity", dayIndex: 2, start: "12:00", end: "13:00", tone: "purple" },
  { id: "e4", title: "Aviation Practice", dayIndex: 4, start: "09:00", end: "10:30", tone: "blue" },
]

export default function CalendarPanel() {
  const [weekOffset, setWeekOffset] = useState(0)
  const scrollerRef = useRef(null)

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

  return (
    <section className="home-calendar-card">
      <header className="calendar-topbar">
        <div className="calendar-week-nav">
          <button type="button" className="calendar-arrow" onClick={() => setWeekOffset((w) => w - 1)} aria-label="Previous week">
            &lt;
          </button>
          <div className="calendar-week-label">{formatWeekRange(weekStart)}</div>
          <button type="button" className="calendar-arrow" onClick={() => setWeekOffset((w) => w + 1)} aria-label="Next week">
            &gt;
          </button>
        </div>

        <h2 className="calendar-title">My Calendar</h2>

        <button type="button" className="today-pill calendar-today" onClick={goToday}>
          Today
        </button>
      </header>

      <div className="calendar-days-header">
        <div className="calendar-time-head" />
        {visibleDays.map((day) => (
          <div key={day.name} className="calendar-day-header-cell">
            <span>{day.name}</span>
            <strong>{day.date.getDate()}</strong>
          </div>
        ))}
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
