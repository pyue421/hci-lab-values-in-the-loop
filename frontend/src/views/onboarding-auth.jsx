import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const STORAGE_KEY = "vitl_onboarding_v1"

export default function OnboardingAuth() {
  const navigate = useNavigate()
  const [mode, setMode] = useState("signup") // signup | login
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [codeSent, setCodeSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [expectedCode, setExpectedCode] = useState("")
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const saved = JSON.parse(raw)
      setMode(saved?.authMode === "login" ? "login" : "signup")
      setEmail(saved?.email || "")
      setPassword(saved?.password || "")
      setVerified(Boolean(saved?.emailVerified))
    } catch {
      // ignore bad local data
    }
  }, [])

  function persistAuth(partial = {}) {
    const raw = localStorage.getItem(STORAGE_KEY)
    let existing = {}
    if (raw) {
      try {
        existing = JSON.parse(raw)
      } catch {
        existing = {}
      }
    }
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        ...existing,
        authMode: mode,
        email,
        password,
        ...partial,
      })
    )
  }

  function isEmailValid(value) {
    return value.trim().includes("@") && value.trim().length >= 5
  }

  function canContinue() {
    const credentialsOk = isEmailValid(email) && password.trim().length >= 6
    if (!credentialsOk) return false
    return mode === "login" ? true : verified
  }

  function sendCode() {
    setError("")
    setInfo("")
    if (!isEmailValid(email)) {
      setError("Please enter a valid email.")
      return
    }
    const generated = String(Math.floor(100000 + Math.random() * 900000))
    setExpectedCode(generated)
    setCodeSent(true)
    setVerified(false)
    setInfo(`Verification code sent. Demo code: ${generated}`)
  }

  function verifyCode() {
    setError("")
    if (verificationCode.trim() !== expectedCode) {
      setVerified(false)
      setError("Incorrect verification code.")
      return
    }
    setVerified(true)
    setInfo("Email verified.")
  }

  function continueToOnboarding() {
    if (!canContinue()) {
      setError(mode === "signup" ? "Please complete email verification first." : "Please complete login details.")
      return
    }
    persistAuth({ emailVerified: mode === "signup" ? verified : true })
    navigate("/onboarding/mandatory")
  }

  return (
    <div className="onb-page">
      <div className="onb-card auth-card-shell">
        <div className="onb-header auth-header">
          <div className="onb-title">Sign up / Log in</div>
          <div className="onb-subtitle">Continue to onboarding</div>
        </div>

        <div className="onb-body">
          <div className="onb-section">
            <div className="auth-mode-row">
              <button type="button" className={`btn ${mode === "login" ? "btn-primary" : "btn-ghost"}`} onClick={() => { setMode("login"); setCodeSent(false); setVerified(false); setError(""); setInfo("") }}>
                Login
              </button>
              <button type="button" className={`btn ${mode === "signup" ? "btn-primary" : "btn-ghost"}`} onClick={() => { setMode("signup"); setError(""); setInfo("") }}>
                Sign up
              </button>
            </div>

            <Field label="Email Address" value={email} onChange={setEmail} placeholder="you@example.com" />
            <Field label="Password" value={password} onChange={setPassword} placeholder="Minimum 6 characters" type="password" />

            {mode === "signup" && (
              <div className="auth-verify-block">
                <div className="auth-verify-actions">
                  <button type="button" className="btn btn-ghost" onClick={sendCode}>
                    {codeSent ? "Resend Code" : "Send Code"}
                  </button>
                </div>
                {codeSent && (
                  <div className="auth-code-row">
                    <Field label="Verification Code" value={verificationCode} onChange={setVerificationCode} placeholder="6-digit code" />
                    <button type="button" className="btn btn-primary" onClick={verifyCode}>
                      Verify
                    </button>
                  </div>
                )}
              </div>
            )}

            {info ? <div className="auth-info">{info}</div> : null}
            {error ? <div className="field-error">{error}</div> : null}
          </div>
        </div>

        <div className="onb-footer">
          <div />
          <button type="button" className="btn btn-primary" onClick={continueToOnboarding} disabled={!canContinue()}>
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="field">
      <div className="field-label">
        <span>{label}</span>
      </div>
      <input
        className="input"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}
