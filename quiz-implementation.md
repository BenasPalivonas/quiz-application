# Quiz Application — Implementation Plan

Stack: Next.js (Turborepo monorepo) + Laravel 13 API (Sanctum token auth) + PostgreSQL.

**Format: personality quiz** ("What Animal Are You?"-style), not trivia. There is no correct/incorrect answer — choices are plain text with no metadata, and on completion an LLM infers a personalized result directly from which choices were picked (their text) plus how quickly each question was answered. This was a deliberate pivot: the bonus requirement asks for "a personalized response based on the user's answers," which a personality-quiz format satisfies directly — the AI *is* the product, rather than a recap bolted onto a score. See the AI bonus section below for the reasoning.

Choices were briefly tagged with a structured `trait` field (e.g. "adventurous") so a deterministic, AI-independent result could be computed as a fallback. That was dropped: the fallback behavior for a failed AI call is simply to show an error in the frontend ("quiz failed to generate an answer"), so there was nothing left for the structured tag to fall back to — see "AI bonus" below.

## 1. Backend — done

### Auth
Token-based auth via Laravel Sanctum (bearer tokens, not cookie/SPA mode — simplest across two separate dev servers).

| Method | Route | Notes |
|---|---|---|
| POST | `/api/register` | `{ name, email, password }` → `201 { user, token }` |
| POST | `/api/login` | `{ email, password }` → `200 { user, token }`, `422` on bad credentials |
| POST | `/api/logout` | auth required, revokes current token |
| GET | `/api/user` | auth required, returns current user |

All other routes below require `Authorization: Bearer <token>`.

### Data model
```
users
quizzes          (user_id FK — owner)
questions        (quiz_id FK, text, order)
choices          (question_id FK, text, order)
quiz_attempts    (quiz_id FK, user_id FK, started_at, completed_at, ai_feedback)
attempt_answers  (quiz_attempt_id FK, question_id FK, choice_id FK, time_spent_ms)
```
- Choices carry no metadata beyond their text — there is no fixed, predetermined "result" stored anywhere, and no taxonomy to invent when authoring a quiz. Quiz creation is just "write a question, write N choices." The personality result is inferred entirely by the LLM at completion time, from the choice text picked and the timing data.
- `attempt_answers` has a unique constraint on `(quiz_attempt_id, question_id)` — answering the same question twice on one attempt overwrites, doesn't duplicate.
- `time_spent_ms` is an integer column — millisecond precision as required.

### Authorization rules
- Any authenticated user can view and attempt **any** quiz.
- Only the owner (`quiz.user_id`) can update/delete their own quiz (`QuizPolicy`, returns `403` otherwise).
- An attempt can only be answered/completed/viewed by the user who started it (`403` otherwise).

### Quiz endpoints
| Method | Route | Body | Response |
|---|---|---|---|
| GET | `/api/quizzes` | — | paginated list, **no** nested questions, includes `questions_count` |
| GET | `/api/quizzes/{quiz}` | — | quiz with `questions[].choices[]` (for taking/editing) |
| POST | `/api/quizzes` | `{ title, questions: [{ text, choices: [{ text }] }] }` | created quiz, same shape as GET show |
| PUT/PATCH | `/api/quizzes/{quiz}` | same as store, `questions` optional (`sometimes`) — if present, **replaces** all questions/choices | owner only |
| DELETE | `/api/quizzes/{quiz}` | — | `204`, owner only |

Example GET `/api/quizzes/{quiz}` response:
```json
{
  "data": {
    "id": 1,
    "title": "What Animal Are You?",
    "user_id": 3,
    "is_owner": false,
    "questions": [
      {
        "id": 10,
        "text": "It's a free Saturday with no plans. What do you do?",
        "order": 0,
        "choices": [
          { "id": 40, "text": "Round up friends for something spontaneous", "order": 0 },
          { "id": 41, "text": "Curl up with a book and total quiet", "order": 1 }
        ]
      }
    ],
    "created_at": "...",
    "updated_at": "..."
  }
}
```

### Attempt endpoints
| Method | Route | Body | Response |
|---|---|---|---|
| POST | `/api/quizzes/{quiz}/attempts` | — | `201`, starts an attempt (`started_at = now()`) |
| POST | `/api/attempts/{attempt}/answers` | `{ question_id, choice_id, time_spent_ms }` | upserts one answer; `422` if the choice doesn't belong to the question |
| POST | `/api/attempts/{attempt}/complete` | — | sets `completed_at`, triggers AI feedback (see below), returns full result |
| GET | `/api/attempts/{attempt}` | — | same shape as complete, for reloading results |

Example complete/show response:
```json
{
  "data": {
    "id": 7,
    "quiz_id": 1,
    "quiz_title": "What Animal Are You?",
    "started_at": "...",
    "completed_at": "...",
    "ai_feedback": "You are: The Curious Fox. You lean into spontaneity...",
    "answers": [
      {
        "id": 22,
        "question_id": 10,
        "question_text": "It's a free Saturday with no plans. What do you do?",
        "choice_id": 40,
        "choice_text": "Round up friends for something spontaneous",
        "time_spent_ms": 4321
      }
    ]
  }
}
```

### AI bonus — the centerpiece, not a decoration
`App\Services\AiFeedbackService::generate()` calls Google's Gemini API (`/v1beta/interactions`) on `complete` with: the quiz title, and every question the user answered — the choice text they picked and how long they took per question (ms → seconds). It asks the model to write a titled, personalized result ("You are: The Curious Fox") grounded in the actual choices made, inferring what those specific answers suggest about the person, and optionally commenting on pace (impulsive vs. deliberate) using the timing data. There is no structured trait data to fall back on — the AI does all of the interpretive work. Requires `GEMINI_API_KEY` in `.env`; if it's unset, or the API call fails for any reason, `generate()` returns `null` and `complete` still succeeds (`200`, attempt data intact) with `ai_feedback: null`. The decision here: no deterministic fallback result is computed — if the AI can't produce one, the frontend is expected to show an explicit failure state ("quiz failed to generate an answer") rather than a synthesized substitute.

### Tooling
- Seeder: demo user `test@example.com` / `password` + a 5-question "What Animal Are You?" sample quiz (`DatabaseSeeder` → `QuizSeeder`).
- Factories for every model.
- 12 feature tests covering register/login, quiz CRUD + ownership authorization, full attempt flow with ms-precision timing, cross-user attempt protection, invalid choice/question pairing, and the AI feedback step mocked via `Http::fake()` for both a successful response and a failed one (asserting `complete` still returns `200` with `ai_feedback: null`).
- Pint clean, matches existing CI (`vendor/bin/pint --test`, `php artisan test`).

### Not yet done / known gap
Migrations haven't been run against the real Postgres container on this machine (Docker Desktop wasn't running). Tests pass against in-memory SQLite (what `phpunit.xml` uses), but `php artisan migrate --seed` against Postgres + a manual API smoke test is still outstanding before calling the backend fully verified.

## 2. Frontend — what's needed

Current state: Turborepo scaffold only (`apps/web` is still the blank Next.js default, `packages/features` is empty). Nothing quiz-specific exists yet.

### 2.1 Foundation
- [ ] API client (`fetch` wrapper) pointed at `NEXT_PUBLIC_API_URL`, attaching `Authorization: Bearer <token>` from stored auth state.
- [ ] Auth state: store token + user after login/register (e.g. a cookie or localStorage + a small context/store), redirect unauthenticated users to login.
- [ ] Shared TS types matching the API resource shapes above (Quiz, Question, Choice, QuizAttempt, AttemptAnswer) — likely in `packages/features` or a `packages/api-types` package.
- [ ] Error handling convention for `401` (redirect to login), `403`, `422` (map `errors` object to form field errors).

### 2.2 Auth pages
- [ ] Register page/form.
- [ ] Login page/form.
- [ ] Logout action.

### 2.3 Quiz browsing & taking (the graded core loop)
- [ ] Quiz list page — `GET /api/quizzes`, paginated.
- [ ] Quiz detail/start page — `GET /api/quizzes/{id}`, "Start Quiz" button → `POST /api/quizzes/{id}/attempts`.
- [ ] Quiz-taking flow, one question at a time (or single page, either works):
  - Capture a start timestamp when a question is presented (`performance.now()` or `Date.now()`).
  - On answer selection/submit, compute elapsed ms and `POST /api/attempts/{id}/answers` with `{ question_id, choice_id, time_spent_ms }`.
  - On last question, `POST /api/attempts/{id}/complete`.
- [ ] Results page — the AI-generated personalized result (`ai_feedback`) is the sole result and the centerpiece of this page. If `ai_feedback` is `null` (AI unavailable or the call failed), show an explicit failure state — e.g. "Quiz failed to generate a personalized answer" — rather than any synthesized substitute; per-question answers + time spent can still render underneath as supporting detail regardless.

### 2.4 Quiz management (owner CRUD)
- [ ] "My quizzes" list.
- [ ] Create quiz form — title + dynamic question/choice builder (add/remove questions and choices — just text, no extra tagging) → `POST /api/quizzes`.
- [ ] Edit quiz form — same builder, pre-filled → `PUT /api/quizzes/{id}`.
- [ ] Delete quiz action (owner only; hide/disable the control for non-owners using `is_owner` from the API).

### 2.5 Polish / tooling already in place to use
- [ ] Playwright e2e (`apps/e2e` already scaffolded) covering: register → create quiz → take it → see results with AI feedback.
- [ ] Wire `packages/ui` components as needed instead of the current starter demo components (card/gradient/turborepo-logo can be deleted once real UI replaces them).

### Suggested build order
1. Foundation (API client, types, auth state) + auth pages — nothing else works without this.
2. Quiz-taking flow (list → detail → attempt → results) — this is the core graded loop, prioritize it.
3. Quiz management CRUD.
4. E2E tests.
