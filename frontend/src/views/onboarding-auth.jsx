import React, { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"

const STORAGE_KEY = "vitl_onboarding_v1"

function loadSavedAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export default function OnboardingAuth() {
  const navigate = useNavigate()
  const savedAuth = useMemo(() => loadSavedAuth(), [])
  const [mode, setMode] = useState(savedAuth?.authMode === "signup" ? "signup" : "login") // signup | login
  const [email, setEmail] = useState(savedAuth?.email || "")
  const [password, setPassword] = useState(savedAuth?.password || "")
  const [codeSent, setCodeSent] = useState(false)
  const [verificationCode, setVerificationCode] = useState("")
  const [expectedCode, setExpectedCode] = useState("")
  const [verified, setVerified] = useState(Boolean(savedAuth?.emailVerified))
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")

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

  function credentialsValid() {
    return isEmailValid(email) && password.trim().length >= 6
  }

  function startSignup() {
    if (mode === "signup") return
    if (!credentialsValid()) {
      setError("Please enter a valid email and password (6+ chars).")
      return
    }
    setMode("signup")
    const generated = String(Math.floor(100000 + Math.random() * 900000))
    setExpectedCode(generated)
    setCodeSent(true)
    setVerificationCode("")
    setVerified(false)
    setInfo(`Verification code sent. Demo code: ${generated}`)
    setError("")
  }

  function backToLogin() {
    setMode("login")
    setCodeSent(false)
    setVerificationCode("")
    setExpectedCode("")
    setVerified(false)
    setInfo("")
    setError("")
  }

  function resendCode() {
    const generated = String(Math.floor(100000 + Math.random() * 900000))
    setExpectedCode(generated)
    setCodeSent(true)
    setVerificationCode("")
    setVerified(false)
    setInfo(`Verification code sent. Demo code: ${generated}`)
    setError("")
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

  function loginToOnboarding() {
    setError("")
    setInfo("")
    if (!credentialsValid()) {
      setError("Please enter a valid email and password (6+ chars).")
      return
    }
    persistAuth({ authMode: "login", emailVerified: true })
    navigate("/onboarding/mandatory")
  }

  function continueSignupToOnboarding() {
    setError("")
    if (!credentialsValid()) {
      setError("Please enter a valid email and password (6+ chars).")
      return
    }
    if (!verified) {
      setError("Please complete email verification first.")
      return
    }
    persistAuth({ authMode: "signup", emailVerified: true })
    navigate("/onboarding/mandatory")
  }

  return (
    <div className="onb-page">
      <div className="onb-card auth-card-shell">
        <div className="onb-header auth-header">
          <div className="onb-title">Welcome Abroad</div>
          <div className="onb-subtitle">Log in into an existing account, or enter email and password to sign up</div>
        </div>

        <div className="auth-content-wrap">
          <div className="onb-body">
            <div className="onb-section">
              <Field label="Email Address" value={email} onChange={setEmail} placeholder="you@example.com" />
              <Field label="Password" value={password} onChange={setPassword} placeholder="Minimum 6 characters" type="password" />

              {mode === "signup" && (
                <div className="auth-verify-block">
                  <div className="auth-verify-actions">
                    <button type="button" className="btn btn-ghost" onClick={resendCode}>
                      Resend Code
                    </button>
                  </div>
                  {codeSent && (
                    <div className="auth-code-row">
                      <Field label="Verification Code" value={verificationCode} onChange={setVerificationCode} placeholder="6-digit code" />
                      <button type="button" className="btn btn-primary" onClick={verified ? continueSignupToOnboarding : verifyCode}>
                        {verified ? "Continue" : "Verify"}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {info ? <div className="auth-info">{info}</div> : null}
              {error ? <div className="field-error">{error}</div> : null}
            </div>
          </div>

          <div className="onb-footer auth-footer">
            {mode === "signup" ? (
              <button type="button" className="btn btn-ghost" onClick={backToLogin}>
                Back to log in
              </button>
            ) : (
              <div className="auth-actions">
                <button type="button" className="btn btn-primary" onClick={loginToOnboarding}>
                  Log in
                </button>
                <button type="button" className="btn btn-ghost" onClick={startSignup}>
                  Sign up
                </button>
              </div>
            )}
          </div>
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
