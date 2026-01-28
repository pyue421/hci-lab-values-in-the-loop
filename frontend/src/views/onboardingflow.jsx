import React, { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

const STORAGE_KEY = "vitl_onboarding_v1"

const defaultState = {
  step: 0,
  authMode: "signup", // "signup" | "login"
  email: "",
  password: "",
  homeAddress: "",
  destinationAddress: "",
  dob: "",
  aviationTerm: "",
  aviationLicense: "",
  canGiveRides: null, // true | false | null
}

export default function OnboardingFlow() {
  const navigate = useNavigate()
  const [state, setState] = useState(defaultState)
  const [touched, setTouched] = useState({})

  // Restore saved progress
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const saved = JSON.parse(raw)
      setState((s) => ({ ...s, ...saved }))
    } catch {
      // ignore
    }
  }, [])

  const steps = useMemo(
    () => [
      { key: "welcome", title: "Welcome Abroad", subtitle: "Sign up or login into your account" },
      { key: "journey", title: "Journey Setup", subtitle: "Tell us about your route" },
      { key: "about", title: "About You", subtitle: "Basic Personal Information" },
      {
        key: "car",
        title: "Do you have access to a car that you could use to\ngive rides occasionally?",
        subtitle: "This helps us plan your role in carpooling – Driving or Riding.",
      },
    ],
    []
  )

  const stepCount = steps.length
  const progressPct = Math.round((state.step / (stepCount - 1)) * 100)

  function saveProgress(nextPartial = {}) {
    const next = { ...state, ...nextPartial }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }

  function setField(name, value) {
    setState((s) => ({ ...s, [name]: value }))
  }

  function markTouched(name) {
    setTouched((t) => ({ ...t, [name]: true }))
  }

  function isValidForStep(step) {
    if (step === 0) {
      // basic email+password requirement for moving forward
      return state.email.trim().length > 3 && state.password.trim().length >= 6
    }
    if (step === 1) {
      return state.homeAddress.trim().length > 3 && state.destinationAddress.trim().length > 3
    }
    if (step === 2) {
      return state.dob.trim().length > 0 && state.aviationTerm.trim().length > 1 && state.aviationLicense.trim().length > 1
    }
    if (step === 3) {
      return state.canGiveRides === true || state.canGiveRides === false
    }
    return true
  }

  function next() {
    const ok = isValidForStep(state.step)
    if (!ok) {
      // mark relevant fields as touched so errors show
      if (state.step === 0) {
        markTouched("email"); markTouched("password")
      } else if (state.step === 1) {
        markTouched("homeAddress"); markTouched("destinationAddress")
      } else if (state.step === 2) {
        markTouched("dob"); markTouched("aviationTerm"); markTouched("aviationLicense")
      } else if (state.step === 3) {
        markTouched("canGiveRides")
      }
      return
    }

    const nextStep = Math.min(stepCount - 1, state.step + 1)
    const nextState = { ...state, step: nextStep }
    setState(nextState)
    saveProgress({ step: nextStep })

    if (state.step === stepCount - 1) {
      // finished — go home (or whatever route you want)
      navigate("/home")
    }
  }

  function back() {
    const prev = Math.max(0, state.step - 1)
    setState((s) => ({ ...s, step: prev }))
    saveProgress({ step: prev })
  }

  function skipSave() {
    saveProgress()
    // behavior from your mock: it doesn't necessarily advance by itself,
    // but you can choose to advance. Here we keep it simple: advance.
    const nextStep = Math.min(stepCount - 1, state.step + 1)
    setState((s) => ({ ...s, step: nextStep }))
    saveProgress({ step: nextStep })
  }

  function resetAll() {
    localStorage.removeItem(STORAGE_KEY)
    setState(defaultState)
    setTouched({})
  }

  const current = steps[state.step]

  return (
    <div className="onb-page">
      <div className="onb-card">
        <div className="onb-progress">
          <div className="onb-progress-bar" style={{ width: `${progressPct}%` }} />
        </div>

        {/* Header */}
        <div className="onb-header">
          <div className="onb-title">{current.title}</div>
          <div className="onb-subtitle">{current.subtitle}</div>
        </div>

        {/* Body */}
        <div className="onb-body">
          {state.step === 0 && (
            <WelcomeScreen
              state={state}
              setField={setField}
              touched={touched}
              markTouched={markTouched}
            />
          )}

          {state.step === 1 && (
            <JourneySetupScreen
              state={state}
              setField={setField}
              touched={touched}
              markTouched={markTouched}
            />
          )}

          {state.step === 2 && (
            <AboutYouScreen
              state={state}
              setField={setField}
              touched={touched}
              markTouched={markTouched}
            />
          )}

          {state.step === 3 && (
            <CarAccessScreen
              state={state}
              setField={setField}
              touched={touched}
              markTouched={markTouched}
            />
          )}
        </div>

        {/* Footer buttons */}
        <div className="onb-footer">
          <button className="btn btn-ghost" onClick={back} disabled={state.step === 0}>
            Back
          </button>

          <div className="onb-footer-right">
            {state.step !== 0 && (
              <button className="btn btn-ghost" onClick={skipSave}>
                Skip (Save Progress)
              </button>
            )}

            {/* Screen 1 uses Login/Sign up buttons; others use Next */}
            {state.step === 0 ? (
              <div className="auth-actions">
                <button
                  className={"btn btn-ghost"}
                  onClick={() => {
                    setField("authMode", "login")
                    saveProgress({ authMode: "login" })
                    next()
                  }}
                >
                  Login
                </button>
                <button
                  className={"btn btn-primary"}
                  onClick={() => {
                    setField("authMode", "signup")
                    saveProgress({ authMode: "signup" })
                    next()
                  }}
                >
                  Sign up
                </button>
              </div>
            ) : (
              <button className="btn btn-primary" onClick={next}>
                Next
              </button>
            )}
          </div>
        </div>

        <div className="onb-reset">
          <button className="link" onClick={resetAll}>Reset onboarding</button>
        </div>
      </div>
    </div>
  )
}

/* -------------------- Step Screens -------------------- */

function Field({ icon, label, value, onChange, onBlur, placeholder, error }) {
  return (
    <div className="field">
      <div className="field-label">
        <span className="field-icon" aria-hidden>{icon}</span>
        <span>{label}</span>
      </div>
      <input
        className={"input" + (error ? " input-error" : "")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
      />
      {error ? <div className="field-error">{error}</div> : null}
    </div>
  )
}

function WelcomeScreen({ state, setField, touched, markTouched }) {
  const emailErr =
    touched.email && state.email.trim().length <= 3 ? "Please enter a valid email." : ""
  const passErr =
    touched.password && state.password.trim().length < 6 ? "Password must be at least 6 characters." : ""

  return (
    <div className="onb-section">
      <Field
        icon="✉️"
        label="Email Address"
        value={state.email}
        onChange={(v) => setField("email", v)}
        onBlur={() => markTouched("email")}
        placeholder=""
        error={emailErr}
      />
      <Field
        icon="🔒"
        label="Password"
        value={state.password}
        onChange={(v) => setField("password", v)}
        onBlur={() => markTouched("password")}
        placeholder=""
        error={passErr}
      />
    </div>
  )
}

function JourneySetupScreen({ state, setField, touched, markTouched }) {
  const homeErr =
    touched.homeAddress && state.homeAddress.trim().length <= 3 ? "Enter a home address." : ""
  const destErr =
    touched.destinationAddress && state.destinationAddress.trim().length <= 3 ? "Enter a destination address." : ""

  return (
    <div className="onb-section">
      <Field
        icon="📍"
        label="Home Address"
        value={state.homeAddress}
        onChange={(v) => setField("homeAddress", v)}
        onBlur={() => markTouched("homeAddress")}
        placeholder=""
        error={homeErr}
      />
      <Field
        icon="📍"
        label="Destination Address"
        value={state.destinationAddress}
        onChange={(v) => setField("destinationAddress", v)}
        onBlur={() => markTouched("destinationAddress")}
        placeholder=""
        error={destErr}
      />
    </div>
  )
}

function AboutYouScreen({ state, setField, touched, markTouched }) {
  const dobErr = touched.dob && !state.dob ? "Please enter your date of birth." : ""
  const termErr =
    touched.aviationTerm && state.aviationTerm.trim().length <= 1 ? "Enter your current aviation term." : ""
  const licErr =
    touched.aviationLicense && state.aviationLicense.trim().length <= 1 ? "Enter your aviation licence." : ""

  return (
    <div className="onb-section">
      <Field
        icon="🎂"
        label="Date of Birth"
        value={state.dob}
        onChange={(v) => setField("dob", v)}
        onBlur={() => markTouched("dob")}
        placeholder="YYYY-MM-DD"
        error={dobErr}
      />
      <Field
        icon="🛩️"
        label="Current Aviation Term"
        value={state.aviationTerm}
        onChange={(v) => setField("aviationTerm", v)}
        onBlur={() => markTouched("aviationTerm")}
        placeholder=""
        error={termErr}
      />
      <Field
        icon="📄"
        label="Aviation License"
        value={state.aviationLicense}
        onChange={(v) => setField("aviationLicense", v)}
        onBlur={() => markTouched("aviationLicense")}
        placeholder=""
        error={licErr}
      />
    </div>
  )
}

function CarAccessScreen({ state, setField, touched, markTouched }) {
  const showErr = touched.canGiveRides && state.canGiveRides == null
  return (
    <div className="onb-section">
      <div className="choice-grid">
        <ChoiceCard
          selected={state.canGiveRides === true}
          icon="🚗"
          title="Yes, I can give rides"
          onClick={() => { setField("canGiveRides", true); markTouched("canGiveRides") }}
        />
        <ChoiceCard
          selected={state.canGiveRides === false}
          icon="👥"
          title="No, I’ll need a ride"
          onClick={() => { setField("canGiveRides", false); markTouched("canGiveRides") }}
        />
      </div>
      {showErr ? <div className="field-error" style={{ marginTop: 10 }}>Please choose one option.</div> : null}
    </div>
  )
}

function ChoiceCard({ selected, icon, title, onClick }) {
  return (
    <button
      type="button"
      className={"choice-card" + (selected ? " choice-selected" : "")}
      onClick={onClick}
    >
      <div className="choice-icon">{icon}</div>
      <div className="choice-title">{title}</div>
    </button>
  )
}
