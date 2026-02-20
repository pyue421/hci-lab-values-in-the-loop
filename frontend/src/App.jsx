import React from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import Home from "./views/home"
import OnboardingFlow from "./views/onboardingflow"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<OnboardingFlow />} />
      <Route path="/onboarding" element={<OnboardingFlow />} />
      <Route path="/home" element={<Home />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
