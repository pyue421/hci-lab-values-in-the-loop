const LOCAL_QUESTION_BANK = [
  { id: "q1", prompt: "During rides, you prefer:", a: "A calm, quiet ride where we can relax with little to no conversation.", b: "A friendly ride with light conversation to make the trip feel social and welcoming." },
  { id: "q2", prompt: "Pickup timing matters most when it is:", a: "Right on schedule, so I can plan my day confidently around exact pickup times.", b: "Flexible within a few minutes, as long as updates are shared clearly and early." },
  { id: "q3", prompt: "For route planning you value:", a: "The fastest route overall, even if it changes day to day based on traffic.", b: "A consistent, predictable route that helps me avoid uncertainty and stress." },
  { id: "q4", prompt: "In shared rides you prioritize:", a: "Lower trip cost, even if that means minor detours or a slightly longer ride.", b: "Higher comfort, with fewer detours and a smoother, more direct ride experience." },
  { id: "q5", prompt: "When plans change, you prefer:", a: "Immediate real-time updates so I can quickly adapt and make new plans.", b: "One clear summary message before pickup with all key changes in one place." },
  { id: "q6", prompt: "Driver behavior you value more:", a: "Smooth, steady driving that feels safe and comfortable throughout the trip.", b: "Fast and efficient driving that helps us arrive as quickly as possible." },
  { id: "q7", prompt: "For recurring trips, you'd rather:", a: "Ride with familiar people to build trust and predictable ride habits over time.", b: "Ride with whoever is available if it improves convenience and flexibility." },
  { id: "q8", prompt: "You care most about:", a: "Reducing environmental impact through efficient shared rides and fewer vehicles.", b: "Reducing travel uncertainty with dependable timing and clear expectations." },
  { id: "q9", prompt: "At pickup points, you prefer:", a: "The closest pickup location, even if it is slightly less visible to others.", b: "A safer, well-lit, and clearly visible pickup location, even if it is farther." },
  { id: "q10", prompt: "You feel best matched with riders who are:", a: "Highly punctual and reliable about arriving exactly when they say they will.", b: "Easygoing and adaptable when small delays or changes happen." },
  { id: "q11", prompt: "For wait time tolerance, you prefer:", a: "No waiting at pickup, so rides start exactly at the planned time.", b: "A short wait of up to five minutes, if communication stays clear and respectful." },
  { id: "q12", prompt: "For communication style, you prefer:", a: "Brief and direct messages that focus only on what is essential.", b: "Warm, conversational messages that feel personal and friendly." },
]

const DEFAULT_SET_SIZE = 10
const STORAGE_KEY = "vitl_onboarding_v1"
const QUESTIONS_CACHE_KEY = "vitl_onboarding_questions_v1"
const CACHE_TTL_MS = 30 * 60 * 1000

export async function loadOnboardingQuestions({ size = DEFAULT_SET_SIZE, regenSeed = 0, signal } = {}) {
  const context = getUserContext()
  if (regenSeed === 0) {
    const cached = getCachedQuestions(size, context)
    if (cached) {
      return { questions: cached.questions, source: "cache", error: null }
    }
  }

  const result = await fetchAiQuestions({ size, context, regenSeed, signal })
  if (result.ok) {
    if (result.source === "openrouter" || result.source === "ai") {
      setCachedQuestions(result.questions, size, context)
    }
    return {
      questions: result.questions,
      source: result.source || "ai",
      error: result.error || null,
    }
  }

  return {
    questions: buildFallbackQuestionSet(LOCAL_QUESTION_BANK, size, regenSeed),
    source: "fallback",
    error: result.error,
  }
}

export async function regenerateCurrentOnboardingQuestion({ excludePrompts = [], regenSeed = 0, signal } = {}) {
  const context = getUserContext()
  const result = await fetchAiQuestions({
    size: 1,
    context,
    regenSeed: regenSeed || Date.now(),
    mode: "single",
    excludePrompts,
    signal,
  })

  if (result.ok) {
    const next = result.questions[0]
    if (next) {
      return {
        ok: true,
        question: next,
        source: result.source || "ai",
        error: result.error || null,
      }
    }
  }

  const fallbackPool = buildFallbackQuestionSet(LOCAL_QUESTION_BANK, LOCAL_QUESTION_BANK.length, regenSeed || Date.now())
  const excluded = new Set(excludePrompts.map((x) => String(x || "").trim().toLowerCase()))
  const nextFallback = fallbackPool.find((q) => !excluded.has(q.prompt.toLowerCase())) || fallbackPool[0]
  if (!nextFallback) {
    return { ok: false, error: "Unable to regenerate question" }
  }

  return {
    ok: true,
    question: nextFallback,
    source: "fallback",
    error: "AI generation unavailable",
  }
}

async function fetchAiQuestions({ size, context, regenSeed, mode = "batch", excludePrompts = [], signal }) {
  const apiBase = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "")
  const endpoint = `${apiBase}/api/onboarding/questions`

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ count: size, context, regenSeed, mode, excludePrompts }),
      signal,
    })

    if (!response.ok) {
      return { ok: false, error: `AI service unavailable (${response.status})` }
    }

    const payload = await response.json()
    const questions = sanitizeQuestions(payload, size)
    if (questions.length < size) {
      return { ok: false, error: "AI returned invalid question format" }
    }

    return {
      ok: true,
      questions,
      source: payload?.source || "ai",
      error: payload?.source === "fallback" ? "AI generation unavailable" : null,
    }
  } catch (error) {
    if (error?.name === "AbortError") {
      throw error
    }
    return { ok: false, error: "Unable to load AI questions" }
  }
}

function sanitizeQuestions(payload, size) {
  const rawList = Array.isArray(payload) ? payload : payload?.questions
  if (!Array.isArray(rawList)) return []

  const dedup = new Set()
  const cleaned = []

  for (const item of rawList) {
    const prompt = safeText(item?.prompt)
    const a = safeText(item?.a)
    const b = safeText(item?.b)
    if (!prompt || !a || !b) continue
    const key = prompt.toLowerCase()
    if (dedup.has(key)) continue
    dedup.add(key)
    cleaned.push({ id: "", prompt, a, b })
    if (cleaned.length >= size) break
  }

  return cleaned.map((q, idx) => ({ ...q, id: `q${idx + 1}` }))
}

function safeText(value) {
  if (typeof value !== "string") return ""
  const trimmed = value.trim().replace(/\s+/g, " ")
  if (trimmed.length < 8 || trimmed.length > 200) return ""
  return trimmed
}

function buildFallbackQuestionSet(bank, size, seed) {
  const withWeight = [...bank].map((q, i) => ({ q, sort: pseudoRand(i + 1, seed + 1) }))
  withWeight.sort((a, b) => a.sort - b.sort)
  return withWeight.slice(0, size).map((x) => x.q)
}

function pseudoRand(x, seed) {
  const n = Math.sin(x * 12.9898 + seed * 78.233) * 43758.5453
  return n - Math.floor(n)
}

function getUserContext() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const saved = JSON.parse(raw)
    return {
      aviationTerm: saved?.aviationTerm || "",
      canGiveRides: saved?.canGiveRides,
      homeAddress: saved?.homeAddress || "",
      destinationAddress: saved?.destinationAddress || "",
    }
  } catch {
    return {}
  }
}

function getCachedQuestions(size, context) {
  try {
    const raw = localStorage.getItem(QUESTIONS_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.ts || Date.now() - parsed.ts > CACHE_TTL_MS) return null
    if (parsed?.size !== size) return null
    if (parsed?.contextHash !== hashContext(context)) return null
    const questions = sanitizeQuestions(parsed?.questions, size)
    if (questions.length < size) return null
    return { questions }
  } catch {
    return null
  }
}

function setCachedQuestions(questions, size, context) {
  try {
    localStorage.setItem(
      QUESTIONS_CACHE_KEY,
      JSON.stringify({
        ts: Date.now(),
        size,
        contextHash: hashContext(context),
        questions,
      })
    )
  } catch {
    // no-op
  }
}

function hashContext(context) {
  const input = JSON.stringify(context || {})
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i)
    hash |= 0
  }
  return String(hash)
}
