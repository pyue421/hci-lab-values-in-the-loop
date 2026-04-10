# Value Elicitation - HCI Research Project

## Project Overview

**Project Name:** Values in the Loop  
**Purpose:** HCI research project exploring value elicitation through A/B card selection to match aviation students for carpooling to aviation training centres.

**Core Concept:** The application uses progressive disclosure to elicit user values through binary choices (A/B cards), then algorithmically matches students with compatible values and practical carpooling needs. This addresses both the functional need (transportation to aviation centre) and the research question (how to effectively elicit and operationalize human values in matching systems).

**Target Users:** Aviation students who need regular transportation to aviation training centres for flight instruction and simulator time.

## Architecture & Tech Stack

### Frontend
- **Framework:** React 18 + Vite 7
- **Routing:** React Router DOM v6
- **Animation:** Framer Motion v12
- **Styling:** Custom CSS (no framework)
- **Build Tool:** Vite with ESLint
- **Dev Server:** Default port 5173

### Backend
- **Runtime:** Python 3.x
- **Server:** Custom ThreadingHTTPServer (stdlib, not Flask/FastAPI)
- **AI Integration:** OpenRouter API (Google Gemini 2.0 Flash model)
- **Configuration:** .env file for secrets
- **Default Port:** 8000

### Key Dependencies
- `framer-motion`: Page transitions and card animations
- `react-router-dom`: Multi-step onboarding flow
- OpenRouter SDK: Dynamic A/B question generation

## Project Structure

```
hci-lab-values-in-the-loop/
├── frontend/
│   ├── src/
│   │   ├── views/
│   │   │   ├── onboarding-auth.jsx          # Email capture & consent
│   │   │   ├── onboardingflow.jsx           # Mandatory info (journey, DOB, aviation details)
│   │   │   ├── onboarding-preferences.jsx   # A/B value elicitation cards
│   │   │   └── home.jsx                     # Main matching dashboard
│   │   ├── components/
│   │   │   └── home/
│   │   │       ├── calendar.jsx             # Scheduling interface
│   │   │       ├── map.jsx                  # Route visualization
│   │   │       ├── cards.jsx                # Match cards with compatibility scores
│   │   │       ├── values.jsx               # User value profile visualization
│   │   │       └── data.js                  # Mock match data
│   │   ├── services/                        # API client (if exists)
│   │   ├── App.jsx                          # Route configuration
│   │   └── main.jsx                         # React entry point
│   ├── package.json
│   └── vite.config.js
└── backend/
    ├── app.py                                # HTTP server + OpenRouter integration
    └── .env                                  # API keys (gitignored)
```

## User Flow

### 1. Onboarding - Authentication (`/onboarding/auth`)
- Email capture for research participation
- Consent acknowledgment
- Data stored in localStorage (`vitl_auth_v1`)

### 2. Onboarding - Mandatory Info (`/onboarding/mandatory`)
**Step 0: Journey Setup**
- Home address (autocomplete with local suggestions)
- Destination address (aviation centre)

**Step 1: About You**
- Date of birth (YYYY/MM/DD format)
- Aviation term (e.g., "Winter 2026")
- Aviation license level (e.g., "PPL", "CPL student")

**Step 2: Car Access**
- Binary choice: Can you give rides occasionally?
- Determines driver vs. rider role in matching

Progress saved to localStorage (`vitl_onboarding_v1`) after each step.

### 3. Onboarding - Value Elicitation (`/onboarding/preferences`)
- **A/B Card Selection:** Users choose between two value-laden options
- **Dynamic Generation:** Questions generated via OpenRouter API based on:
  - User context (journey, aviation info, car access)
  - Previous answers (adaptive questioning)
  - Value dimensions: punctuality, flexibility, communication style, comfort, efficiency, safety, trust, sustainability
- **Fallback:** 12 hand-crafted questions in `QUESTION_BANK` if API unavailable
- **Progress Tracking:** Shows cards answered (e.g., "7 / 12")
- **Regeneration:** Users can request new questions if current ones feel irrelevant
- Responses stored in localStorage (`vitl_preferences_v1`)

### 4. Home Dashboard (`/home`)
**Layout:** Split-pane interface with resizable dividers
- **Left Pane:**
  - Map: Route visualization with pickup/dropoff points
  - Match Cards: List of potential carpool partners with compatibility scores
- **Right Pane:**
  - Calendar: Schedule coordination (top)
  - Values Panel: User's value profile + selected match comparison (bottom)

**Matching Logic (Conceptual):**
- Compatibility score derived from value alignment (A/B choices)
- Practical constraints: overlapping schedules, route compatibility, car access
- Visual feedback: percentage match, shared values highlighted

## Key Features

### Value Elicitation System
**Philosophy:** Binary forced-choice questions reveal latent values through tradeoffs, not Likert scales. Each question targets a specific value dimension (e.g., punctuality vs. flexibility).

**Question Design Principles:**
- Scenario-based, not abstract
- Balanced options (~140-160 chars each)
- No UI/payment/feature questions (disallowed topics filtered in backend)
- Focus on higher-order values: trust, fairness, communication, efficiency, comfort

**AI-Assisted Generation:**
- OpenRouter API with Gemini 2.0 Flash
- System prompt enforces value-focused, jargon-free language
- Adaptive mode: single-question generation excludes prior prompts
- Batch mode: generates full set (default 12 questions)

### Matching Algorithm (Mock Data)
Located in `frontend/src/components/home/data.js`:
- `matches`: Array of potential carpool partners with compatibility scores
- `valueWeights`: User's inferred value profile from A/B selections
- Real implementation would use collaborative filtering or distance metrics on value vectors

### Resizable Dashboard
- Vertical divider: Adjusts map/matches vs. calendar/values width (30-70%)
- Horizontal divider: Adjusts calendar vs. values height (34-74%)
- Smooth drag interactions with cursor feedback

## Backend API

### Endpoints

**`POST /api/onboarding/questions`**
Generate A/B value questions.

**Request:**
```json
{
  "count": 12,                    // 1-20, default 10
  "context": {                     // User's onboarding data
    "homeAddress": "Waterloo, ON",
    "destinationAddress": "Region of Waterloo Intl Airport",
    "aviationTerm": "Winter 2026",
    "canGiveRides": false
  },
  "mode": "batch",                 // "batch" or "single"
  "regenSeed": 0,                  // Varies fallback shuffle
  "excludePrompts": ["..."]        // For single mode: avoid repeats
}
```

**Response:**
```json
{
  "questions": [
    {
      "id": "q1",
      "prompt": "During rides, you prefer:",
      "a": "A calm, quiet ride...",
      "b": "A friendly ride with light conversation..."
    }
  ],
  "source": "openrouter" | "fallback"
}
```

**`GET /health`**
Health check. Returns `{"ok": true}`.

### Environment Variables
```bash
# Required
OPENROUTER_API_KEY=sk-or-...

# Optional
OPENROUTER_MODEL=google/gemini-2.0-flash-001
OPENROUTER_APP_NAME=values-in-the-loop
OPENROUTER_SITE_URL=http://localhost:5173
BACKEND_HOST=127.0.0.1
BACKEND_PORT=8000
```

## Code Conventions

### React Components
- **Functional components** with hooks (no class components)
- **Named exports** for views (`export default function ViewName()`)
- **Local state** for UI concerns (useState)
- **localStorage** for persistence (no backend user DB yet)
- **CSS Modules equivalent:** Separate `.css` files co-located with components

### State Management
- **No global state library** (Redux/Zustand)
- **localStorage keys:**
  - `vitl_auth_v1`: Email + consent
  - `vitl_onboarding_v1`: Journey + personal info + step progress
  - `vitl_preferences_v1`: A/B question responses
- **Data format:** JSON serialized objects

### Styling
- **No Tailwind/Bootstrap:** Custom CSS for full design control
- **Naming:** BEM-like (`.onboarding-card`, `.onboarding-card__title`)
- **Layout:** Flexbox and CSS Grid
- **Animations:** Framer Motion for page transitions, card flips, progress indicators

### Backend
- **Minimal dependencies:** Stdlib only (no Flask overhead)
- **Error handling:** Try OpenRouter first, fallback to static questions
- **CORS:** Enabled for local development (`Access-Control-Allow-Origin: *`)
- **Retry logic:** 2-3 attempts for API calls with exponential backoff (implicit in attempts loop)

## Development Workflow

### Running Locally
```bash
# Terminal 1: Backend
cd backend
python app.py
# Runs on http://127.0.0.1:8000

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### Environment Setup
1. Copy `backend/.env.example` to `backend/.env` (if template exists)
2. Add OpenRouter API key: `OPENROUTER_API_KEY=sk-or-...`
3. API key required for dynamic question generation (fallback available without)

### Testing the Flow
1. Navigate to `http://localhost:5173`
2. Auto-redirects to `/onboarding/auth`
3. Complete 3-step onboarding (auth → mandatory → preferences)
4. Land on `/home` dashboard with mock matches

## Design Principles

### Progressive Disclosure
Onboarding is split into digestible chunks to reduce cognitive load:
1. Auth (low friction, just email)
2. Mandatory info (practical constraints for matching)
3. Value preferences (12 cards, can regenerate)

### Value-Centric Matching
Unlike traditional carpooling apps (optimize route/time only), this system prioritizes value alignment:
- Does rider prefer punctuality or flexibility?
- Do they value quiet rides or social conversation?
- Environmental impact vs. speed?

### Transparency
- Users see their own value profile (radar chart or bar graph)
- Comparison view shows overlap with selected match
- Compatibility score explained by shared values

## Research Context

**HCI Question:** How can we elicit human values in a way that:
1. Feels natural and engaging (not survey fatigue)
2. Reveals true preferences (forced tradeoffs, not "strongly agree" on everything)
3. Operationalizes values into actionable matching (not just demographic filters)

**Data Collection:**
- A/B selection patterns
- Regeneration frequency (proxy for question relevance)
- Match acceptance rates (validates value alignment hypothesis)

## Future Enhancements

### Short-term
- Real backend database (replace localStorage)
- User authentication (Firebase Auth or similar)
- Real matching algorithm (cosine similarity on value vectors)
- In-app messaging for matched users

### Research Extensions
- A/B test: value-based matching vs. traditional proximity matching
- Longitudinal study: does value alignment predict carpool longevity?
- Qualitative interviews: how do users interpret their value profiles?

## Notes for Development

### When adding new value dimensions:
1. Update `QUESTION_BANK` in `backend/app.py` with example questions
2. Modify system prompt in `generate_with_openrouter()` to include new dimension
3. Test that disallowed topic filter doesn't block legitimate questions

### When modifying onboarding:
- Keep localStorage keys versioned (`_v1`, `_v2`) to avoid migration issues
- Update `STORAGE_KEY` constants if schema changes
- Test back button behavior (progress should restore correctly)

### When working with animations:
- Framer Motion `variants` defined inline (see `onboarding-preferences.jsx`)
- Exit animations require wrapping routes in `<AnimatePresence>`
- Keep animation durations under 300ms for snappy feel

### Performance considerations:
- API calls timeout at 12s (single) or 25s (batch)
- Fallback questions are deterministically shuffled (same seed = same order)
- Match list is client-side filtered (no pagination yet)

## Git Workflow

- **Main branch:** Stable, deployed version (if applicable)
- **Feature branches:** Descriptive names (`feature/adaptive-questions`, `fix/calendar-timezone`)
- **Commits:** Descriptive messages focused on "why" not "what"
- **No force-push** to shared branches

## Contact & Context

**Research Lead:** [Your name/lab]  
**Institution:** University of Waterloo (inferred from location suggestions)  
**Project Status:** Prototype / User study preparation  
**Data Handling:** Local storage only (no server persistence yet), ensure IRB compliance before scaling
