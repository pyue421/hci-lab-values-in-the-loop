import hashlib
import json
import os
import random
import re
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib import error, request


QUESTION_BANK = [
    {
        "id": "q1",
        "prompt": "During rides, you prefer:",
        "a": "A calm, quiet ride where we can relax with little to no conversation.",
        "b": "A friendly ride with light conversation to make the trip feel social and welcoming.",
    },
    {
        "id": "q2",
        "prompt": "Pickup timing matters most when it is:",
        "a": "Right on schedule, so I can plan my day confidently around exact pickup times.",
        "b": "Flexible within a few minutes, as long as updates are shared clearly and early.",
    },
    {
        "id": "q3",
        "prompt": "For route planning you value:",
        "a": "The fastest route overall, even if it changes day to day based on traffic.",
        "b": "A consistent, predictable route that helps me avoid uncertainty and stress.",
    },
    {
        "id": "q4",
        "prompt": "In shared rides you prioritize:",
        "a": "Lower trip cost, even if that means minor detours or a slightly longer ride.",
        "b": "Higher comfort, with fewer detours and a smoother, more direct ride experience.",
    },
    {
        "id": "q5",
        "prompt": "When plans change, you prefer:",
        "a": "Immediate real-time updates so I can quickly adapt and make new plans.",
        "b": "One clear summary message before pickup with all key changes in one place.",
    },
    {
        "id": "q6",
        "prompt": "Driver behavior you value more:",
        "a": "Smooth, steady driving that feels safe and comfortable throughout the trip.",
        "b": "Fast and efficient driving that helps us arrive as quickly as possible.",
    },
    {
        "id": "q7",
        "prompt": "For recurring trips, you'd rather:",
        "a": "Ride with familiar people to build trust and predictable ride habits over time.",
        "b": "Ride with whoever is available if it improves convenience and flexibility.",
    },
    {
        "id": "q8",
        "prompt": "You care most about:",
        "a": "Reducing environmental impact through efficient shared rides and fewer vehicles.",
        "b": "Reducing travel uncertainty with dependable timing and clear expectations.",
    },
    {
        "id": "q9",
        "prompt": "At pickup points, you prefer:",
        "a": "The closest pickup location, even if it is slightly less visible to others.",
        "b": "A safer, well-lit, and clearly visible pickup location, even if it is farther.",
    },
    {
        "id": "q10",
        "prompt": "You feel best matched with riders who are:",
        "a": "Highly punctual and reliable about arriving exactly when they say they will.",
        "b": "Easygoing and adaptable when small delays or changes happen.",
    },
    {
        "id": "q11",
        "prompt": "For wait time tolerance, you prefer:",
        "a": "No waiting at pickup, so rides start exactly at the planned time.",
        "b": "A short wait of up to five minutes, if communication stays clear and respectful.",
    },
    {
        "id": "q12",
        "prompt": "For communication style, you prefer:",
        "a": "Brief and direct messages that focus only on what is essential.",
        "b": "Warm, conversational messages that feel personal and friendly.",
    },
]


def load_env_file():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(env_path):
        return
    with open(env_path, "r", encoding="utf-8") as fh:
        for raw_line in fh:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


def clamp_count(raw_count):
    try:
        n = int(raw_count)
    except (TypeError, ValueError):
        return 10
    return max(1, min(20, n))


def safe_text(value):
    if not isinstance(value, str):
        return ""
    compact = " ".join(value.strip().split())
    if len(compact) < 8 or len(compact) > 200:
        return ""
    return compact


DISALLOWED_TOPIC_PATTERNS = [
    r"\bpay(?:ment|ing)?\b",
    r"\bfare(?:s)?\b",
    r"\bprice(?:s|d|ing)?\b",
    r"\bcost(?:s|ly)?\b",
    r"\bdiscount(?:s|ed)?\b",
    r"\bsubscription(?:s)?\b",
    r"\bpromo(?:tion|code|codes)?\b",
    r"\bwallet\b",
    r"\bcredit\s*card\b",
    r"\bdebit\s*card\b",
    r"\bcash\b",
    r"\bvenmo\b",
    r"\bpaypal\b",
    r"\bapple\s*pay\b",
    r"\bgoogle\s*pay\b",
    r"\bapp\b",
    r"\bfeature(?:s)?\b",
    r"\bui\b",
    r"\binterface\b",
    r"\bsettings?\b",
    r"\bnotification(?:s)?\b",
    r"\bbutton(?:s)?\b",
    r"\bin[-\s]?app\b",
    r"\bmessage(?:s|ing)?\b",
    r"\bchat(?:ting)?\b",
    r"\bphone\s*call(?:s)?\b",
    r"\bcall\s+driver(?:s)?\b",
    r"\bcontact\s+method(?:s)?\b",
    r"\bhow\s+to\s+contact\b",
]


def has_disallowed_topic(prompt, a_text, b_text):
    full = f"{prompt} {a_text} {b_text}".lower()
    for pattern in DISALLOWED_TOPIC_PATTERNS:
        if re.search(pattern, full):
            return True
    return False


def sanitize_questions(items, count):
    if not isinstance(items, list):
        return []
    seen = set()
    cleaned = []
    for item in items:
        prompt = safe_text(item.get("prompt") if isinstance(item, dict) else None)
        a_text = safe_text(item.get("a") if isinstance(item, dict) else None)
        b_text = safe_text(item.get("b") if isinstance(item, dict) else None)
        if not prompt or not a_text or not b_text:
            continue
        if has_disallowed_topic(prompt, a_text, b_text):
            continue
        key = prompt.lower()
        if key in seen:
            continue
        seen.add(key)
        cleaned.append({"id": "", "prompt": prompt, "a": a_text, "b": b_text})
        if len(cleaned) >= count:
            break
    return [{**q, "id": f"q{i + 1}"} for i, q in enumerate(cleaned)]


def fallback_questions(count, context, regen_seed=0):
    context_seed = json.dumps({"context": context or {}, "regen_seed": regen_seed}, sort_keys=True)
    seed_hex = hashlib.sha256(context_seed.encode("utf-8")).hexdigest()[:16]
    rng = random.Random(int(seed_hex, 16))
    options = QUESTION_BANK[:]
    rng.shuffle(options)
    return [{**q, "id": f"q{i + 1}"} for i, q in enumerate(options[:count])]


def strip_json_fence(text):
    if not isinstance(text, str):
        return ""
    raw = text.strip()
    if raw.startswith("```"):
        raw = re.sub(r"^```(?:json)?\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
    return raw.strip()


def generate_with_openrouter(count, context, mode="batch", exclude_prompts=None):
    api_key = os.getenv("OPENROUTER_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("OPENROUTER_API_KEY is not set")

    model = os.getenv("OPENROUTER_MODEL", "google/gemini-2.0-flash-001").strip()
    app_name = os.getenv("OPENROUTER_APP_NAME", "values-in-the-loop")
    referer = os.getenv("OPENROUTER_SITE_URL", "http://localhost:5173")

    system_prompt = (
        "Goal: Generate A/B questions to elicit user values for matching users for carpooling. "
        "Focus on higher-level value dimensions such as punctuality, efficiency, trustworthiness, kindness, "
        "safety, communication, flexibility, comfort, environmental impact, reliability, and fairness. "
        "Questions must reveal meaningful tradeoffs between values, not surface-level wording changes. "
        "Do not ask about processes like payment methods, fares, pricing, or discounts. "
        "Vocabulary should be simple and accessible, avoiding jargon or abstract concepts. "
        "Return strict JSON only with this exact shape: "
        "{\"questions\":[{\"prompt\":\"...\",\"a\":\"...\",\"b\":\"...\"}]}. "
        "No markdown. No commentary. No extra keys."
    )

    if mode == "single":
        banned = ", ".join((exclude_prompts or [])[:8])
        user_prompt = (
            "Generate 1 unique A/B question tailored to carpooling values. "
            "Target one meaningful value tradeoff (e.g., punctuality vs flexibility, efficiency vs comfort). "
            "Do not mention app features, payment, fares, or pricing. "
            "Keep it concise and scenario-based. Options must be <= 140 chars. "
            f"Avoid these prompts: {banned}. "
            f"User context: {json.dumps(context or {}, ensure_ascii=True)}"
        )
    else:
        user_prompt = (
            f"Generate {count} unique A/B questions tailored to carpooling. "
            "Each question should map to one primary value tradeoff (e.g., punctuality vs flexibility, "
            "efficiency vs comfort, consistency vs flexibility, sustainability vs speed). "
            "Do not ask about app features, payment methods, fares, or pricing. "
            "Each prompt should be concise and scenario-based. "
            "Each option should be clear, balanced, and <= 160 chars. "
            "Avoid repeating the same value pairing across multiple questions. "
            f"User context: {json.dumps(context or {}, ensure_ascii=True)}"
        )

    payload = {
        "model": model,
        "temperature": 0.6 if mode == "single" else 0.8,
        "max_tokens": 260 if mode == "single" else 900,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "response_format": {"type": "json_object"},
    }

    req = request.Request(
        "https://openrouter.ai/api/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": referer,
            "X-Title": app_name,
        },
        method="POST",
    )

    attempts = 2 if mode == "single" else 3
    last_error = None
    for _ in range(attempts):
        try:
            with request.urlopen(req, timeout=12 if mode == "single" else 25) as resp:
                body = resp.read().decode("utf-8")
            parsed = json.loads(body)
            content = (
                parsed.get("choices", [{}])[0]
                .get("message", {})
                .get("content", "")
            )
            json_text = strip_json_fence(content)
            maybe_payload = json.loads(json_text)
            maybe_questions = maybe_payload.get("questions") if isinstance(maybe_payload, dict) else maybe_payload
            cleaned = sanitize_questions(maybe_questions, count)
            if len(cleaned) >= count:
                return cleaned
            last_error = RuntimeError("Insufficient valid questions after filtering disallowed topics")
        except Exception as e:
            last_error = e
    raise last_error or RuntimeError("Generation failed")


class AppHandler(BaseHTTPRequestHandler):
    def _send_json(self, payload, status=200):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send_json({"ok": True})

    def do_GET(self):
        if self.path == "/health":
            self._send_json({"ok": True})
            return
        self._send_json({"error": "Not found"}, status=404)

    def do_POST(self):
        if self.path != "/api/onboarding/questions":
            self._send_json({"error": "Not found"}, status=404)
            return

        try:
            length = int(self.headers.get("Content-Length", "0"))
            raw = self.rfile.read(length).decode("utf-8") if length else "{}"
            payload = json.loads(raw)
        except (ValueError, json.JSONDecodeError):
            self._send_json({"error": "Invalid JSON body"}, status=400)
            return

        count = clamp_count(payload.get("count"))
        context = payload.get("context", {})
        regen_seed = payload.get("regenSeed", 0)
        mode = payload.get("mode", "batch")
        exclude_prompts = payload.get("excludePrompts", [])

        try:
            target_count = 1 if mode == "single" else count
            questions = generate_with_openrouter(target_count, context, mode=mode, exclude_prompts=exclude_prompts)
            if len(questions) < target_count:
                raise RuntimeError("Model returned insufficient valid questions")
            self._send_json({"questions": questions, "source": "openrouter"})
            return
        except error.HTTPError as e:
            detail = e.read().decode("utf-8", errors="ignore")
            print(f"OpenRouter HTTP error {e.code}: {detail}")
        except Exception as e:
            print(f"OpenRouter error: {e}")

        # Safe fallback so frontend still works during setup/rate limits.
        self._send_json(
            {
                "questions": fallback_questions(count, context, regen_seed),
                "source": "fallback",
            }
        )


def run():
    load_env_file()
    host = os.getenv("BACKEND_HOST", "127.0.0.1")
    port = int(os.getenv("BACKEND_PORT", "8000"))
    server = ThreadingHTTPServer((host, port), AppHandler)
    print(f"Backend running on http://{host}:{port}")
    server.serve_forever()


if __name__ == "__main__":
    run()
