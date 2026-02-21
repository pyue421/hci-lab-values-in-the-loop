import React from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import Home from "./views/home"
import OnboardingFlow from "./views/onboardingflow"
import OnboardingPreferences from "./views/onboarding-preferences"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/onboarding/mandatory" replace />} />
      <Route path="/onboarding" element={<Navigate to="/onboarding/mandatory" replace />} />
      <Route path="/onboarding/mandatory" element={<OnboardingFlow />} />
      <Route path="/onboarding/preferences" element={<OnboardingPreferences />} />
      <Route path="/home" element={<Home />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
