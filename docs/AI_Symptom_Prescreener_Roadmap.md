# AI Symptom Pre-Screener — 24-Hour Hackathon Roadmap

> **Project**: AI-powered symptom triage assistant
> **Stack**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + Supabase (Postgres) + Anthropic Claude API
> **Goal**: Production-grade, deployed, judge-ready in 24 hours
> **Hackathon**: FrontierHack — AI-First, Ship It

---

## Table of Contents

1. [Pre-Hackathon Checklist](#1-pre-hackathon-checklist)
2. [Architecture Overview](#2-architecture-overview)
3. [Coding Standards (Read First)](#3-coding-standards-read-first)
4. [Hour-by-Hour Roadmap](#4-hour-by-hour-roadmap)
5. [Project Structure](#5-project-structure)
6. [Database Schema](#6-database-schema)
7. [Claude API Integration](#7-claude-api-integration)
8. [System Prompt Design](#8-system-prompt-design)
9. [Frontend Implementation](#9-frontend-implementation)
10. [Killer Features Implementation](#10-killer-features-implementation)
11. [Deployment](#11-deployment)
12. [Demo Video Script](#12-demo-video-script)
13. [Submission Checklist](#13-submission-checklist)
14. [Common Pitfalls & Fixes](#14-common-pitfalls--fixes)

---

## 1. Pre-Hackathon Checklist

Complete these BEFORE the clock starts. They don't count against your 24 hours but save 2-3 hours later.

### Accounts (create all of these)

- [ ] GitHub account ready, new repo created (private or public)
- [ ] Vercel account (sign in with GitHub)
- [ ] Supabase account at supabase.com
- [ ] Anthropic Console account at console.anthropic.com
- [ ] OpenRouter account as backup at openrouter.ai

### Local environment

- [ ] Node.js 20+ installed (`node -v` to verify)
- [ ] pnpm installed globally: `npm i -g pnpm`
- [ ] Git configured with your name/email
- [ ] VS Code with these extensions: ESLint, Prettier, Tailwind CSS IntelliSense, Prisma
- [ ] A browser with React DevTools

### API keys to have ready

- [ ] `ANTHROPIC_API_KEY` from console.anthropic.com (use team's $10 budget)
- [ ] Supabase project URL + anon key + service role key
- [ ] Vercel deployment connected to GitHub repo

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER (mobile/desktop)                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS
┌──────────────────────────▼──────────────────────────────────┐
│              Next.js 15 App (Vercel Edge)                    │
│  ┌─────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  React Client   │  │  Server Actions │  │  API Routes  │  │
│  │  (Tailwind UI)  │◄─┤  (form submit) │  │ /api/triage  │  │
│  └─────────────────┘  └────────────────┘  └──────┬───────┘  │
└────────────────────────────────────────────────────┼─────────┘
                                                    │
              ┌─────────────────────────────────────┼─────────┐
              │                                     │         │
        ┌─────▼──────┐                      ┌──────▼──────┐  │
        │  Supabase  │                      │  Anthropic  │  │
        │  (Postgres │                      │  Claude API │  │
        │   + Auth)  │                      │  (Sonnet)   │  │
        └────────────┘                      └─────────────┘  │
                                                              │
                                                Server-side ──┘
                                              (API key safe)
```

### Why this architecture is scalable

- **Stateless API routes**: Each request is independent → horizontal scaling on Vercel.
- **Server-side AI calls**: API key never exposed; rate limiting and caching at the edge.
- **Postgres via Supabase**: Connection pooling built-in; can handle 10k+ concurrent users.
- **Edge deployment**: Vercel runs your Next.js app close to users globally.
- **Separation of concerns**: UI logic, business logic (lib/), AI logic (services/), data (db/) all separated.

---

## 3. Coding Standards (Read First)

These rules apply to every file you write. Following them = scalable code reviewers won't laugh at.

### 3.1 TypeScript rules

- **No `any` types.** Use `unknown` if truly unknown, then narrow with type guards.
- **All API responses validated with Zod.** Never trust LLM output without parsing.
- **Strict mode on** in `tsconfig.json` (`"strict": true`).
- **Prefer `type` over `interface`** for consistency, except when you need declaration merging.

### 3.2 File organization

- **One component per file**, named the same as the file (`SymptomChat.tsx` exports `SymptomChat`).
- **Max 200 lines per file.** If bigger, split into smaller pieces.
- **Co-locate**: tests, styles, and types live next to the component.
- **Barrel exports** (`index.ts`) only at module boundaries, not for every folder.

### 3.3 Naming

- **Components**: PascalCase (`SeverityBadge`)
- **Functions/variables**: camelCase (`analyzeSymptoms`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_FOLLOWUP_ROUNDS`)
- **Files for components**: PascalCase.tsx
- **Files for utilities**: kebab-case.ts (`format-summary.ts`)
- **Database tables**: snake_case plural (`triage_sessions`)

### 3.4 Error handling

- **Never let an error crash the page.** Wrap every API call in try/catch.
- **Always return typed errors**: `{ ok: false, error: { code, message } }` shape.
- **Log on the server, show friendly messages on the client.** Never leak stack traces.
- **Specific error codes**: `RATE_LIMITED`, `AI_TIMEOUT`, `INVALID_INPUT`, `DB_ERROR`.

### 3.5 React rules

- **Server Components by default.** Only add `"use client"` when you need state, effects, or browser APIs.
- **Suspense boundaries** around any async data fetching for proper loading states.
- **No prop drilling beyond 2 levels.** Use Context or composition.
- **Keys on lists must be stable IDs**, never array indices.
- **`useEffect` is a last resort.** Prefer derived state and event handlers.

### 3.6 API design

- **REST principles**: `POST /api/triage` for creating triage, `GET /api/sessions/:id` for retrieving.
- **Always validate input** with Zod schema as the first line of the handler.
- **Return consistent envelope**: `{ ok: true, data }` or `{ ok: false, error }`.
- **Status codes mean something**: 400 for bad input, 401 unauthorized, 429 rate limit, 500 server.
- **Idempotency**: same input should produce same result (cache when possible).

### 3.7 Security

- **Never expose API keys to the client.** All AI calls go through `/api/*` routes.
- **Validate ALL user input** server-side. Client validation is UX only.
- **Use Supabase RLS (Row Level Security)** so users can only see their own sessions.
- **Rate limit**: max 20 triage requests per IP per hour.
- **No PII in logs.** Don't log raw symptom text in production.

### 3.8 Git workflow

- **Conventional commits**: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `style:`.
- **Small commits, often.** Aim for one commit per logical change.
- **Branch per feature**: `feat/adaptive-triage`, `feat/voice-input`.
- **PRs required** even if you're solo (rules want visible teamwork).
- **Never commit `.env*` files.** Add to `.gitignore` immediately.

---

## 4. Hour-by-Hour Roadmap

Each hour has explicit deliverables. If you fall behind, mark and continue — never block the next phase.

### Phase 1: Foundation (Hours 0–2)

#### Hour 0:00–0:30 — Project initialization

- [ ] Create new GitHub repo `ai-symptom-prescreener`
- [ ] Clone locally
- [ ] Run `pnpm create next-app@latest .` with these options:
  - TypeScript: Yes
  - ESLint: Yes
  - Tailwind CSS: Yes
  - `src/` directory: Yes
  - App Router: Yes
  - Import alias: `@/*`
- [ ] First commit: `chore: initialize next.js project`
- [ ] Push to GitHub

#### Hour 0:30–1:00 — Dependencies and config

```bash
pnpm add @anthropic-ai/sdk @supabase/supabase-js @supabase/ssr zod
pnpm add framer-motion lucide-react clsx tailwind-merge
pnpm add @react-pdf/renderer
pnpm add -D @types/node prettier prettier-plugin-tailwindcss
```

- [ ] Configure `prettier.config.js` with Tailwind plugin
- [ ] Add `.prettierrc` and run `pnpm prettier --write .`
- [ ] Configure ESLint rules (no-explicit-any, no-unused-vars)
- [ ] Create folder structure (see Section 5)
- [ ] Commit: `chore: add dependencies and tooling`

#### Hour 1:00–1:30 — Environment and Supabase

- [ ] Create Supabase project (note project URL and keys)
- [ ] Create `.env.local`:
  ```
  ANTHROPIC_API_KEY=sk-ant-...
  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
  SUPABASE_SERVICE_ROLE_KEY=eyJ...
  ```
- [ ] Add `.env.local` to `.gitignore` (verify it's there)
- [ ] Create `.env.example` with same keys but empty values
- [ ] Run database migrations (see Section 6)

#### Hour 1:30–2:00 — Vercel deployment + smoke test

- [ ] Connect GitHub repo to Vercel
- [ ] Add all environment variables to Vercel dashboard
- [ ] Trigger first deploy — verify "hello world" appears at production URL
- [ ] Bookmark the live URL (you'll need it for submission)
- [ ] Commit: `chore: configure deployment`

**Phase 1 done. You should have:** Empty Next.js app live on the internet, GitHub repo with commits, Supabase database ready.

---

### Phase 2: Core AI Engine (Hours 2–6)

#### Hour 2:00–3:00 — Type system and schemas

Create `src/lib/triage/schema.ts` with Zod schemas for:

- [ ] `TriageInputSchema` — what the API accepts
- [ ] `TriageResponseSchema` — what Claude must return
- [ ] `SeverityEnum` — emergency | clinic_today | clinic_soon | self_care
- [ ] `RedFlagSchema` — structured red flag with category and reason
- [ ] `MessageSchema` — conversation history format

Reference implementation in Section 7. Test schemas with sample data.

#### Hour 3:00–4:00 — Anthropic client wrapper

Create `src/lib/ai/anthropic-client.ts`:

- [ ] Singleton client with proper error handling
- [ ] Wrapper function `analyzeSymptoms(messages, language)` 
- [ ] JSON extraction utility (strips markdown fences if Claude adds them)
- [ ] Zod validation of response — retry once if invalid
- [ ] Timeout handling (10 seconds max)
- [ ] Error mapping: rate limit → friendly error, timeout → retry suggestion

#### Hour 4:00–5:00 — System prompt engineering

This is THE most important hour. Quality of your prompt = quality of your product.

- [ ] Write `src/lib/ai/prompts/triage-system.ts` with the full prompt
- [ ] Include red flag rules (see Section 8)
- [ ] Include JSON schema in prompt (LLM does better when shown the shape)
- [ ] Add language placeholder
- [ ] Add examples of GOOD and BAD responses (few-shot)
- [ ] Test manually with these scenarios:
  - "I have chest pain and sweating" → must be emergency
  - "Slight headache" → self_care
  - "Fever for 3 days" → ask follow-up first
  - "My grandmother is having trouble speaking" → emergency (stroke)

#### Hour 5:00–6:00 — API route

Create `src/app/api/triage/route.ts`:

- [ ] POST handler with Zod input validation
- [ ] Rate limiting (simple in-memory or Upstash if time)
- [ ] Call `analyzeSymptoms` with conversation history
- [ ] Save session to Supabase (anonymous OK for MVP)
- [ ] Return validated typed response
- [ ] Test with curl or Thunder Client:
  ```bash
  curl -X POST http://localhost:3000/api/triage \
    -H "Content-Type: application/json" \
    -d '{"messages":[{"role":"user","content":"chest pain"}],"language":"English"}'
  ```
- [ ] Commit: `feat: add triage API endpoint`

**Phase 2 done. You should have:** A working backend that accepts symptoms and returns structured triage decisions. Test it 10 times with different inputs before moving on.

---

### Phase 3: Core UI (Hours 6–12)

#### Hour 6:00–7:00 — Design system foundations

- [ ] Define CSS variables in `globals.css` for colors, spacing, fonts
- [ ] Choose font pairing — pick distinctive fonts, not Inter (e.g., Fraunces + IBM Plex Sans, or Sora + DM Sans)
- [ ] Add Google Fonts in `layout.tsx`
- [ ] Create severity color tokens:
  - `--severity-emergency`: red
  - `--severity-urgent`: amber
  - `--severity-soon`: yellow
  - `--severity-self`: green
- [ ] Create `src/components/ui/` primitives: Button, Card, Badge, Input

#### Hour 7:00–9:00 — Conversational UI

Create `src/components/triage/TriageChat.tsx`:

- [ ] Message list with user / assistant bubbles
- [ ] Input area with text + voice (mic button)
- [ ] Quick-reply chips when Claude suggests options (tap instead of type)
- [ ] Auto-scroll to latest message
- [ ] "Claude is thinking..." indicator with animated dots
- [ ] Mobile-first responsive layout (test at 375px width)
- [ ] Empty state with example prompts: "I have a fever", "Headache for 2 days", "Chest pain"

#### Hour 9:00–10:30 — Severity result screen

Create `src/components/triage/SeverityResult.tsx`:

- [ ] Big visual indicator (traffic light style)
- [ ] Severity label in user's language
- [ ] Plain-language reasoning from Claude
- [ ] List of red flags if any
- [ ] Action button based on severity:
  - Emergency: "Call 108 NOW" (large red button, pulsing)
  - Clinic today: "Find nearest clinic" (links to Google Maps)
  - Clinic soon: "Schedule appointment" 
  - Self-care: shows OTC suggestions
- [ ] "Download summary for doctor" button (PDF)
- [ ] "Start new check" button

#### Hour 10:30–11:30 — Emergency lockout flow

This is a critical safety feature judges will notice.

- [ ] Create `src/components/triage/EmergencyScreen.tsx`
- [ ] When severity = emergency, replace ENTIRE screen with this
- [ ] Massive red background, white text, pulsing animation
- [ ] Local emergency number based on detected location (108 for India)
- [ ] One-tap call button (`<a href="tel:108">`)
- [ ] Symptom checklist: "If person has these signs, do this..." (basic first aid)
- [ ] "I've called for help" button to acknowledge

#### Hour 11:30–12:00 — Landing page

- [ ] Hero section with clear value prop
- [ ] "Start symptom check" CTA
- [ ] Three-step explainer (describe → answer → get guidance)
- [ ] Disclaimer prominently shown
- [ ] Footer with credits, GitHub link, demo video link
- [ ] Commit: `feat: complete core UI flow`

**Phase 3 done. You should have:** A user can type symptoms, see Claude respond, and get a triage result. Mobile responsive. Looks polished.

---

### Phase 4: Killer Features (Hours 12–16)

Pick features in this priority order. Cut from the bottom if running late.

#### Hour 12:00–13:00 — Voice input

- [ ] Create `src/lib/hooks/useSpeechRecognition.ts`
- [ ] Use Web Speech API (`webkitSpeechRecognition`)
- [ ] Add mic button to input area
- [ ] Visual feedback when listening (pulsing red dot)
- [ ] Auto-stop after silence
- [ ] Fallback message if browser doesn't support it
- [ ] Test on actual mobile device

#### Hour 13:00–14:00 — Multilingual support

- [ ] Language toggle in header (English / हिंदी / ગુજરાતી / मराठी)
- [ ] Persist choice in localStorage
- [ ] Pass language to system prompt
- [ ] Translate UI strings: create `src/lib/i18n/translations.ts`
- [ ] Use Claude itself to translate UI strings if you don't speak them
- [ ] Test with one full session in Hindi

#### Hour 14:00–15:00 — Doctor summary PDF

- [ ] Create `src/lib/pdf/DoctorSummaryPDF.tsx` using @react-pdf/renderer
- [ ] Include: patient-described symptoms, red flags found, severity assessment, follow-up answers, triage decision, timestamp
- [ ] Professional header with disclaimer "AI pre-screening, not a diagnosis"
- [ ] Download button on result screen
- [ ] Test PDF opens correctly on mobile and desktop

#### Hour 15:00–16:00 — OTC medicine suggestions (carefully)

This is your "extra patience" feature. Implement defensively.

- [ ] ONLY show when severity = `self_care`
- [ ] Show only well-known OTC categories (paracetamol, ORS, throat lozenges)
- [ ] Each suggestion includes: purpose, key cautions, "consult pharmacist" reminder
- [ ] NEVER suggest doses for children under 12
- [ ] NEVER suggest for pregnant users (add a checkbox to disclose)
- [ ] Big disclaimer: "These are general suggestions, not prescriptions"
- [ ] Commit: `feat: add OTC suggestions for mild cases`

**Phase 4 done. Take a 15-minute break. Eat something. Hydrate.**

---

### Phase 5: Polish (Hours 16–20)

This phase wins or loses the hackathon. Don't skip.

#### Hour 16:00–17:00 — Loading and error states

- [ ] Skeleton loaders for chat messages
- [ ] "Claude is analyzing..." with progress hints ("Checking symptoms... Looking for red flags... Preparing recommendation...")
- [ ] Error boundary on the main page
- [ ] Network failure: "Connection lost — your conversation is saved" + retry button
- [ ] AI timeout: friendly message, suggest rephrase
- [ ] Form validation errors shown inline, never as alerts

#### Hour 17:00–18:00 — Animations and micro-interactions

- [ ] Framer Motion stagger on message reveal
- [ ] Smooth severity color transition on result screen
- [ ] Subtle pulse on the emergency button
- [ ] Page transitions between landing → chat → result
- [ ] Don't overdo it — sophisticated > flashy

#### Hour 18:00–19:00 — Accessibility and edge cases

- [ ] All buttons have `aria-label`
- [ ] Form inputs have associated labels
- [ ] Color contrast passes WCAG AA (use Lighthouse)
- [ ] Keyboard navigation works end-to-end
- [ ] Screen reader announces severity changes
- [ ] Test with very long input (paste 1000 words)
- [ ] Test with empty input
- [ ] Test rapid clicking (debouncing)

#### Hour 19:00–20:00 — Real device testing + final polish

- [ ] Open on your actual phone (not just dev tools)
- [ ] Test full flow on iOS Safari and Android Chrome
- [ ] Fix any responsive bugs found
- [ ] Run Lighthouse audit, fix critical issues
- [ ] Add medical disclaimer to every page footer
- [ ] Add About / Privacy page (one paragraph each is fine)
- [ ] Final commit: `chore: polish and a11y fixes`
- [ ] Push and verify production deploy works

**Phase 5 done. Your app is judge-ready.**

---

### Phase 6: Submission (Hours 20–24)

#### Hour 20:00–21:30 — Demo video

This is what judges actually watch first. Don't rush.

- [ ] Write a script (see Section 12)
- [ ] Use OBS or Loom to record
- [ ] Practice run-through twice
- [ ] Record final take — under 5 minutes
- [ ] Show: real symptoms → adaptive questions → severity result → emergency edge case → PDF download
- [ ] Highlight the AI reasoning visually
- [ ] Upload to YouTube unlisted or Loom
- [ ] Note: rules say "Record video before 4 PM" — if your hackathon ends at 6 PM, target 4 PM hard.

#### Hour 21:30–22:30 — One-page document

Use the provided template. Cover:

- [ ] Problem statement (3-4 sentences)
- [ ] Solution overview
- [ ] Tech stack
- [ ] AI integration details (this is what they grade hardest)
- [ ] Key features
- [ ] What's next (post-hackathon roadmap)
- [ ] Team members and contributions

#### Hour 22:30–23:30 — Final QA and buffer

- [ ] One full end-to-end test on production URL
- [ ] Test all 4 severity levels (have prepared test inputs)
- [ ] Test offline behavior (turn off wifi)
- [ ] Verify GitHub repo has all commits and a good README
- [ ] Verify deploy URL is publicly accessible (test in incognito)
- [ ] Buffer for one bug fix

#### Hour 23:30–24:00 — Submit

- [ ] Submit demo video link
- [ ] Submit GitHub repo link
- [ ] Submit one-page doc
- [ ] Submit live URL
- [ ] Submit landing page link (if separate)
- [ ] Verify submission went through
- [ ] Close laptop. You earned it.

---

## 5. Project Structure

```
ai-symptom-prescreener/
├── public/
│   ├── icons/
│   └── og-image.png
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── triage/
│   │   │   │   └── route.ts          # POST /api/triage
│   │   │   └── sessions/
│   │   │       └── [id]/
│   │   │           └── route.ts      # GET /api/sessions/:id
│   │   ├── (marketing)/
│   │   │   └── page.tsx              # Landing page
│   │   ├── triage/
│   │   │   └── page.tsx              # Main app
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── error.tsx                 # Global error boundary
│   ├── components/
│   │   ├── ui/                       # Primitives (no domain logic)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Input.tsx
│   │   ├── triage/                   # Feature-specific
│   │   │   ├── TriageChat.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── SeverityResult.tsx
│   │   │   ├── EmergencyScreen.tsx
│   │   │   ├── OTCSuggestions.tsx
│   │   │   └── VoiceInputButton.tsx
│   │   └── shared/
│   │       ├── LanguageToggle.tsx
│   │       ├── DisclaimerFooter.tsx
│   │       └── ErrorBoundary.tsx
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── anthropic-client.ts   # Wrapper around SDK
│   │   │   ├── prompts/
│   │   │   │   └── triage-system.ts
│   │   │   └── extract-json.ts
│   │   ├── triage/
│   │   │   ├── schema.ts             # Zod schemas
│   │   │   ├── types.ts              # TypeScript types
│   │   │   ├── red-flags.ts          # Red flag detection
│   │   │   └── severity.ts           # Severity helpers
│   │   ├── db/
│   │   │   ├── supabase-server.ts    # Server-side client
│   │   │   ├── supabase-client.ts    # Browser client
│   │   │   └── queries.ts            # All DB queries
│   │   ├── i18n/
│   │   │   └── translations.ts
│   │   ├── hooks/
│   │   │   ├── useSpeechRecognition.ts
│   │   │   └── useTriageSession.ts
│   │   ├── pdf/
│   │   │   └── DoctorSummaryPDF.tsx
│   │   └── utils/
│   │       ├── cn.ts                 # clsx + tailwind-merge
│   │       ├── rate-limit.ts
│   │       └── logger.ts
│   └── styles/
│       └── tokens.css                # CSS variables
├── supabase/
│   └── migrations/
│       └── 0001_initial.sql
├── .env.example
├── .env.local                        # gitignored
├── .eslintrc.json
├── .prettierrc
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 6. Database Schema

### `supabase/migrations/0001_initial.sql`

```sql
-- Enable required extensions
create extension if not exists "uuid-ossp";

-- Triage sessions table
create table public.triage_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  anonymous_id text,                          -- for non-logged-in users
  language text not null default 'English',
  conversation jsonb not null default '[]'::jsonb,
  final_severity text check (final_severity in ('emergency', 'clinic_today', 'clinic_soon', 'self_care')),
  red_flags jsonb default '[]'::jsonb,
  doctor_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Either user_id OR anonymous_id must be present
  constraint user_or_anon check (user_id is not null or anonymous_id is not null)
);

-- Index for quick lookups
create index idx_sessions_user on public.triage_sessions(user_id);
create index idx_sessions_anon on public.triage_sessions(anonymous_id);
create index idx_sessions_created on public.triage_sessions(created_at desc);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_sessions_updated
  before update on public.triage_sessions
  for each row execute function update_updated_at();

-- Row Level Security
alter table public.triage_sessions enable row level security;

-- Users can read their own sessions
create policy "Users read own sessions"
  on public.triage_sessions for select
  using (auth.uid() = user_id);

-- Users can insert their own sessions
create policy "Users insert own sessions"
  on public.triage_sessions for insert
  with check (auth.uid() = user_id or user_id is null);

-- Service role has full access (for API routes)
-- Service role bypasses RLS automatically

-- Rate limiting table (simple version)
create table public.rate_limits (
  id uuid primary key default uuid_generate_v4(),
  identifier text not null,                   -- IP or user ID
  endpoint text not null,
  count int not null default 1,
  window_start timestamptz not null default now()
);

create index idx_rate_limits_lookup on public.rate_limits(identifier, endpoint, window_start);
```

Run this in Supabase SQL editor or via CLI.

---

## 7. Claude API Integration

### 7.1 Client wrapper

**`src/lib/ai/anthropic-client.ts`**

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { TriageResponseSchema, type TriageResponse, type Message } from "@/lib/triage/schema";
import { TRIAGE_SYSTEM_PROMPT } from "./prompts/triage-system";
import { extractJSON } from "./extract-json";
import { logger } from "@/lib/utils/logger";

const MODEL = "claude-sonnet-4-5";  // Verify latest at docs.claude.com
const MAX_TOKENS = 1024;
const TIMEOUT_MS = 15_000;
const MAX_RETRIES = 1;

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");
    _client = new Anthropic({ apiKey, timeout: TIMEOUT_MS });
  }
  return _client;
}

export type AnalyzeResult =
  | { ok: true; data: TriageResponse }
  | { ok: false; error: { code: string; message: string } };

export async function analyzeSymptoms(
  messages: Message[],
  language: string = "English"
): Promise<AnalyzeResult> {
  const client = getClient();
  const systemPrompt = TRIAGE_SYSTEM_PROMPT.replace("{{LANGUAGE}}", language);

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.messages.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      });

      const text = response.content
        .filter((block) => block.type === "text")
        .map((block) => (block.type === "text" ? block.text : ""))
        .join("");

      const json = extractJSON(text);
      const parsed = TriageResponseSchema.safeParse(json);

      if (!parsed.success) {
        logger.warn("Claude returned invalid schema", { issues: parsed.error.issues });
        if (attempt < MAX_RETRIES) continue;
        return { ok: false, error: { code: "INVALID_AI_RESPONSE", message: "Could not parse triage decision" } };
      }

      return { ok: true, data: parsed.data };
    } catch (err) {
      logger.error("Claude API error", { err });
      if (err instanceof Anthropic.APIError) {
        if (err.status === 429) {
          return { ok: false, error: { code: "RATE_LIMITED", message: "Service is busy. Please try again in a moment." } };
        }
        if (err.status === 401) {
          return { ok: false, error: { code: "AUTH_ERROR", message: "Service unavailable" } };
        }
      }
      if (attempt >= MAX_RETRIES) {
        return { ok: false, error: { code: "AI_ERROR", message: "Could not analyze symptoms right now." } };
      }
    }
  }

  return { ok: false, error: { code: "UNKNOWN", message: "Unknown error" } };
}
```

### 7.2 JSON extraction utility

**`src/lib/ai/extract-json.ts`**

```typescript
export function extractJSON(text: string): unknown {
  // Strip markdown code fences
  let cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  
  // Find first { and last } to extract JSON object
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.slice(start, end + 1);
  }

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse JSON: ${(err as Error).message}`);
  }
}
```

### 7.3 Zod schemas

**`src/lib/triage/schema.ts`**

```typescript
import { z } from "zod";

export const SeverityEnum = z.enum(["emergency", "clinic_today", "clinic_soon", "self_care"]);
export type Severity = z.infer<typeof SeverityEnum>;

export const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(5000),
});
export type Message = z.infer<typeof MessageSchema>;

export const FollowupQuestionSchema = z.object({
  q: z.string().min(1),
  options: z.array(z.string()).max(6).optional(),
});

export const RedFlagSchema = z.object({
  category: z.string(),
  description: z.string(),
});

export const OTCSuggestionSchema = z.object({
  name: z.string(),
  purpose: z.string(),
  caution: z.string(),
});

export const TriageResponseSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("ask_followup"),
    followup_questions: z.array(FollowupQuestionSchema).min(1).max(3),
    red_flags: z.array(RedFlagSchema).default([]),
    reasoning: z.string(),
  }),
  z.object({
    action: z.literal("triage"),
    severity: SeverityEnum,
    red_flags: z.array(RedFlagSchema).default([]),
    reasoning: z.string(),
    doctor_summary: z.string(),
    suggested_otc: z.array(OTCSuggestionSchema).max(3).optional(),
  }),
]);
export type TriageResponse = z.infer<typeof TriageResponseSchema>;

export const TriageInputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
  language: z.string().default("English"),
  sessionId: z.string().uuid().optional(),
});
export type TriageInput = z.infer<typeof TriageInputSchema>;
```

### 7.4 API route

**`src/app/api/triage/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { analyzeSymptoms } from "@/lib/ai/anthropic-client";
import { TriageInputSchema } from "@/lib/triage/schema";
import { rateLimit } from "@/lib/utils/rate-limit";
import { saveSession } from "@/lib/db/queries";
import { logger } from "@/lib/utils/logger";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const limited = await rateLimit(ip, "triage", { max: 20, windowMs: 3600_000 });
    if (limited) {
      return NextResponse.json(
        { ok: false, error: { code: "RATE_LIMITED", message: "Too many requests. Try again later." } },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = TriageInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: { code: "INVALID_INPUT", message: "Invalid request" } },
        { status: 400 }
      );
    }

    const result = await analyzeSymptoms(parsed.data.messages, parsed.data.language);
    if (!result.ok) {
      return NextResponse.json(result, { status: 502 });
    }

    // Save async, don't block the response
    saveSession({
      sessionId: parsed.data.sessionId,
      messages: parsed.data.messages,
      response: result.data,
      language: parsed.data.language,
      anonymousId: ip,
    }).catch((err) => logger.error("Failed to save session", { err }));

    return NextResponse.json({ ok: true, data: result.data });
  } catch (err) {
    logger.error("Triage route error", { err });
    return NextResponse.json(
      { ok: false, error: { code: "SERVER_ERROR", message: "Something went wrong" } },
      { status: 500 }
    );
  }
}
```

---

## 8. System Prompt Design

**`src/lib/ai/prompts/triage-system.ts`**

```typescript
export const TRIAGE_SYSTEM_PROMPT = `You are a medical triage assistant for the AI Symptom Pre-Screener app. You are NOT a doctor and you do NOT diagnose.

Your job is to:
1. Listen to symptoms in plain language
2. Ask focused follow-up questions when needed (max 2 rounds)
3. Decide severity and route the user to the right level of care
4. Generate a structured summary for a real doctor

# CRITICAL: RED FLAGS — these always mean severity = "emergency"

If ANY of these are present, do NOT ask follow-up questions. Immediately return action="triage" with severity="emergency":

- Chest pain with sweating, jaw/arm radiation, or shortness of breath (possible heart attack)
- Sudden one-sided weakness, slurred speech, facial droop (possible stroke — FAST)
- Severe difficulty breathing, blue lips
- Severe allergic reaction with face/throat swelling (anaphylaxis)
- Heavy uncontrolled bleeding
- Loss of consciousness or fainting episodes
- "Worst headache of my life" especially with vomiting or stiff neck
- Suicidal thoughts or intent to harm self or others
- Severe abdominal pain with rigid abdomen
- Seizure that just happened or is happening

# DECISION TREE

After receiving user input:
1. Check for red flags → if found, action=triage, severity=emergency
2. If symptoms are vague or you need more info → action=ask_followup (max 2 rounds total)
3. Otherwise → action=triage with appropriate severity

# SEVERITY LEVELS

- "emergency": Life-threatening, call emergency services NOW (108 in India, 911 US, 999 UK)
- "clinic_today": Should see a doctor within 24 hours
- "clinic_soon": Should see a doctor within a week
- "self_care": Likely manageable at home with rest, fluids, OTC remedies

# OUTPUT FORMAT — ALWAYS RESPOND WITH ONLY THIS JSON

For follow-up:
\`\`\`json
{
  "action": "ask_followup",
  "followup_questions": [
    {"q": "How long have you had this?", "options": ["Less than 1 day", "1-3 days", "More than 3 days"]},
    {"q": "Any fever?", "options": ["Yes", "No", "Not sure"]}
  ],
  "red_flags": [],
  "reasoning": "I want to understand the timeline before giving guidance."
}
\`\`\`

For final triage:
\`\`\`json
{
  "action": "triage",
  "severity": "self_care",
  "red_flags": [],
  "reasoning": "Your symptoms suggest a common viral illness that usually resolves with rest.",
  "doctor_summary": "Patient reports: [structured summary in clinical language]. Duration: X. Associated symptoms: Y. Relevant negatives: Z. No red flags identified.",
  "suggested_otc": [
    {"name": "Paracetamol", "purpose": "For fever and body aches", "caution": "Max 4g/day for adults; consult pharmacist for children"}
  ]
}
\`\`\`

# RULES

- ALWAYS respond in valid JSON only. No markdown, no commentary outside the JSON.
- Respond in this language: {{LANGUAGE}}
- Keep questions simple and answerable by elderly users
- Provide max 3 follow-up questions per round
- Maximum 2 follow-up rounds, then commit to a triage
- Only include "suggested_otc" when severity is "self_care"
- Never include OTC suggestions for children under 12 or pregnant users
- "doctor_summary" must use clinical language and be useful for a real doctor
- "reasoning" must use plain, kind language for the patient

# EXAMPLES

User: "I have chest pain and I'm sweating a lot"
Response:
\`\`\`json
{
  "action": "triage",
  "severity": "emergency",
  "red_flags": [{"category": "Cardiac", "description": "Chest pain with diaphoresis suggests possible cardiac event"}],
  "reasoning": "Your symptoms could indicate a serious heart problem. Please get emergency help immediately — call 108 or go to the nearest ER.",
  "doctor_summary": "Patient presents with chest pain and diaphoresis. Possible acute coronary syndrome. Requires immediate evaluation including ECG and cardiac enzymes."
}
\`\`\`

User: "I have a mild headache"
Response:
\`\`\`json
{
  "action": "ask_followup",
  "followup_questions": [
    {"q": "How long have you had it?", "options": ["A few hours", "1-2 days", "More than 3 days"]},
    {"q": "How severe is the pain?", "options": ["Mild", "Moderate", "Severe"]},
    {"q": "Any other symptoms?", "options": ["Fever", "Nausea", "Vision changes", "None"]}
  ],
  "red_flags": [],
  "reasoning": "I need a bit more information to give you good guidance."
}
\`\`\`
`;
```

---

## 9. Frontend Implementation

### Key principles

1. **Server Components by default** — only `"use client"` for interactive parts
2. **Mobile-first** — design for 375px width, scale up
3. **Optimistic updates** — show user message instantly, then loading state for AI
4. **Accessible** — keyboard, screen reader, color contrast all work

### Main page structure

**`src/app/triage/page.tsx`** (Server Component)

```typescript
import { TriageChat } from "@/components/triage/TriageChat";
import { DisclaimerFooter } from "@/components/shared/DisclaimerFooter";

export default function TriagePage() {
  return (
    <main className="flex min-h-screen flex-col">
      <TriageChat />
      <DisclaimerFooter />
    </main>
  );
}
```

**`src/components/triage/TriageChat.tsx`** (Client Component) — sketch

```typescript
"use client";

import { useState, useTransition } from "react";
import type { Message, TriageResponse } from "@/lib/triage/schema";
import { MessageBubble } from "./MessageBubble";
import { SeverityResult } from "./SeverityResult";
import { EmergencyScreen } from "./EmergencyScreen";
import { VoiceInputButton } from "./VoiceInputButton";

export function TriageChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<TriageResponse | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function send(text: string) {
    if (!text.trim() || isPending) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setError(null);

    startTransition(async () => {
      try {
        const res = await fetch("/api/triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages, language: "English" }),
        });
        const json = await res.json();
        if (!json.ok) {
          setError(json.error.message);
          return;
        }
        setResponse(json.data);
        if (json.data.action === "ask_followup") {
          // Append assistant question to messages
          setMessages([
            ...newMessages,
            { role: "assistant", content: json.data.reasoning },
          ]);
        }
      } catch {
        setError("Connection lost. Please try again.");
      }
    });
  }

  if (response?.action === "triage" && response.severity === "emergency") {
    return <EmergencyScreen response={response} />;
  }

  if (response?.action === "triage") {
    return <SeverityResult response={response} onReset={() => { setMessages([]); setResponse(null); }} />;
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && <EmptyState onPick={send} />}
        {messages.map((m, i) => <MessageBubble key={i} message={m} />)}
        {isPending && <ThinkingIndicator />}
        {response?.action === "ask_followup" && (
          <FollowupQuestions questions={response.followup_questions} onAnswer={send} />
        )}
      </div>
      <div className="border-t p-4 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send(input)}
          placeholder="Describe how you feel..."
          className="flex-1 rounded-lg border px-3 py-2"
          aria-label="Symptom description"
        />
        <VoiceInputButton onTranscript={(t) => setInput(t)} />
        <button
          onClick={() => send(input)}
          disabled={isPending || !input.trim()}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-white disabled:opacity-50"
        >
          Send
        </button>
      </div>
      {error && <ErrorBanner message={error} />}
    </div>
  );
}
```

---

## 10. Killer Features Implementation

### 10.1 Voice input hook

**`src/lib/hooks/useSpeechRecognition.ts`**

```typescript
"use client";
import { useEffect, useRef, useState } from "react";

type Options = { lang?: string; onResult?: (text: string) => void };

export function useSpeechRecognition({ lang = "en-IN", onResult }: Options = {}) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setSupported(false);
      return;
    }
    const rec = new SR();
    rec.lang = lang;
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript;
      onResult?.(text);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
  }, [lang, onResult]);

  function start() {
    if (!recognitionRef.current || listening) return;
    setListening(true);
    recognitionRef.current.start();
  }

  function stop() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  return { listening, supported, start, stop };
}
```

### 10.2 Emergency screen

**`src/components/triage/EmergencyScreen.tsx`**

```typescript
"use client";
import { motion } from "framer-motion";

export function EmergencyScreen({ response }: { response: any }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-red-600 text-white p-6"
      role="alert"
      aria-live="assertive"
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        className="text-6xl mb-4"
      >
        ⚠️
      </motion.div>
      <h1 className="text-4xl font-bold mb-2">Seek Emergency Care</h1>
      <p className="text-xl text-center mb-6 max-w-md">{response.reasoning}</p>
      <a
        href="tel:108"
        className="bg-white text-red-600 text-3xl font-bold px-8 py-4 rounded-full mb-4 shadow-lg"
      >
        📞 Call 108 Now
      </a>
      <ul className="text-left max-w-sm space-y-2">
        {response.red_flags?.map((flag: any, i: number) => (
          <li key={i} className="bg-red-700 p-3 rounded">
            <strong>{flag.category}:</strong> {flag.description}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}
```

### 10.3 PDF export

**`src/lib/pdf/DoctorSummaryPDF.tsx`**

```typescript
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer";
import type { TriageResponse, Message } from "@/lib/triage/schema";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  subheader: { fontSize: 10, color: "#666", marginBottom: 16 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: "bold", marginBottom: 4, color: "#222" },
  body: { lineHeight: 1.4 },
  disclaimer: { fontSize: 9, color: "#888", marginTop: 20, fontStyle: "italic" },
});

export function DoctorSummaryPDF({ response, messages, date }: {
  response: TriageResponse & { action: "triage" };
  messages: Message[];
  date: Date;
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>AI Pre-Screening Summary</Text>
        <Text style={styles.subheader}>Generated {date.toLocaleString()}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Severity Assessment</Text>
          <Text style={styles.body}>{response.severity.toUpperCase()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Patient Description</Text>
          {messages.filter((m) => m.role === "user").map((m, i) => (
            <Text key={i} style={styles.body}>• {m.content}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Clinical Summary</Text>
          <Text style={styles.body}>{response.doctor_summary}</Text>
        </View>

        {response.red_flags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Red Flags Identified</Text>
            {response.red_flags.map((flag, i) => (
              <Text key={i} style={styles.body}>• {flag.category}: {flag.description}</Text>
            ))}
          </View>
        )}

        <Text style={styles.disclaimer}>
          This is an AI-generated pre-screening, not a medical diagnosis. Use only as a starting point for clinical evaluation.
        </Text>
      </Page>
    </Document>
  );
}

export async function downloadPDF(props: Parameters<typeof DoctorSummaryPDF>[0]) {
  const blob = await pdf(<DoctorSummaryPDF {...props} />).toBlob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `triage-summary-${Date.now()}.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## 11. Deployment

### Vercel deployment steps

1. Push final code to GitHub
2. Vercel → "Import Project" → select your repo
3. **Environment variables** (set in Vercel dashboard):
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Build command: `pnpm build` (default)
5. Output directory: `.next` (default)
6. Deploy
7. Verify production URL works
8. Add custom domain if you have one (optional)

### Pre-deployment checklist

- [ ] All `console.log` removed from production code
- [ ] `next.config.js` has `productionBrowserSourceMaps: false`
- [ ] No hardcoded API keys anywhere in code
- [ ] Image optimization configured
- [ ] Security headers added
- [ ] OG image and favicon set

### `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};
module.exports = nextConfig;
```

---

## 12. Demo Video Script

Target: under 5 minutes, ideally 3:30.

### Structure (timestamps)

**0:00–0:20 — Hook**
"Healthcare access in rural India is broken. Today I'm showing you an AI symptom pre-screener that gives anyone, anywhere, instant medical triage in their own language."

**0:20–0:40 — Problem**
Show statistics: 600M Indians lack timely access to doctors, OPD wait times average 4 hours, elderly delay critical visits.

**0:40–1:00 — Solution overview**
Quick whip through the architecture: Next.js + Claude AI + multilingual + voice + PDF.

**1:00–2:00 — Live demo: mild case**
- Open app on phone
- Speak in Hindi: "Mujhe halki si khansi hai do din se"
- Show Claude's adaptive follow-up questions
- Show self_care result with OTC suggestions
- Highlight: "Notice it asked exactly the right follow-up questions"

**2:00–2:45 — Live demo: emergency case**
- Speak: "I have chest pain and I'm sweating"
- Show INSTANT emergency lockout screen
- Show one-tap call button
- Highlight: "No follow-up questions, immediately routes to emergency"

**2:45–3:15 — Doctor summary**
- Go back to mild case
- Tap "Download for doctor"
- Show clinical PDF that the doctor receives
- Highlight: "This saves 10 minutes in the consultation"

**3:15–3:45 — Technical wow**
- Show Claude's adaptive reasoning briefly
- Highlight scalability: edge deployment, structured output, type-safe pipeline

**3:45–4:15 — Impact and close**
- "Built in 24 hours, deployed at [URL], open source"
- "This isn't a chatbot — it's a triage decision system that thinks like a doctor"
- "Thank you"

### Recording tips

- Use a clean phone background, no notifications
- Clear audio matters more than 4K video
- Practice transitions twice before recording
- Edit out long Claude wait times if any
- Add captions for accessibility
- Export at 1080p, MP4

---

## 13. Submission Checklist

### Final submission package

- [ ] **Demo video** (under 5 min) uploaded to YouTube unlisted or Loom
- [ ] **GitHub repo** public, with good README, license, and full commit history
- [ ] **One-page document** filled out using provided template
- [ ] **Live URL** working, tested in incognito mode
- [ ] **Landing page** (optional) — can be the home route of your app

### README.md must include

- [ ] Project name and tagline
- [ ] Demo video link
- [ ] Live URL
- [ ] Screenshot/GIF of the app
- [ ] Problem statement
- [ ] Solution
- [ ] Tech stack
- [ ] Local setup instructions
- [ ] Environment variables list
- [ ] AI integration details
- [ ] Team members
- [ ] License (MIT recommended)

### What judges grade on (from rules)

1. **Real Problem, Real Solution** — your healthcare angle is strong, lean into rural/elderly access
2. **AI Deeply Integrated** — emphasize adaptive questioning, not just "we use AI"
3. **Actually Works** — verified live URL, no broken flows
4. **Clean & Polished** — animations, error states, mobile-first UI
5. **Team Collaboration** — multiple contributors visible in commits, PR reviews

---

## 14. Common Pitfalls & Fixes

### Claude returns invalid JSON

- Symptom: Zod validation fails
- Fix: Strengthen system prompt with explicit JSON schema, add retry with "Respond with valid JSON only" reminder

### Vercel build fails

- Symptom: TypeScript errors blocking deploy
- Fix: Run `pnpm build` locally before pushing; never disable type checking

### API timeout on Vercel

- Symptom: Function times out at 10s on free tier
- Fix: Set `maxDuration = 30` in route, upgrade to Pro if needed, or stream the response

### Web Speech API not working

- Symptom: Mic button does nothing
- Fix: Only works on HTTPS (Vercel is fine, localhost works on Chrome but not Safari), check browser support

### Mobile keyboard covers input

- Symptom: User can't see what they're typing on phone
- Fix: Use `dvh` units, scroll input into view on focus

### Rate limit too aggressive

- Symptom: User hits limit during demo
- Fix: Whitelist demo IPs, or use generous limits (60/hour) until after judging

### Supabase RLS blocks inserts

- Symptom: Anonymous sessions can't be saved
- Fix: Use service role key in API route (bypasses RLS), never expose to client

### Claude responses too slow

- Symptom: 5+ second wait
- Fix: Switch to a faster Sonnet variant, reduce `max_tokens`, show progress indicator with stages

### Emergency screen fires on false positive

- Symptom: "I had chest pain last year" triggers emergency
- Fix: Improve system prompt to focus on CURRENT acute symptoms, add "is this happening now?" check

### Translations are awkward

- Symptom: Claude's Hindi sounds robotic
- Fix: Add to system prompt: "Use natural, conversational Hindi as spoken in everyday life, not formal Hindi"

### PDF won't generate on mobile Safari

- Symptom: Click does nothing on iPhone
- Fix: Use `react-pdf` with browser fallback, or generate server-side with Puppeteer

---

## Final Words

A few hard truths for the 24 hours:

1. **Polish beats features.** A 3-feature app that works perfectly beats a 10-feature app that mostly works.
2. **Cut early, cut often.** If something isn't done by the hour deadline, cut it. Don't go down rabbit holes.
3. **Test on real devices.** Dev tools lie. Your phone tells the truth.
4. **Record demo at hour 20, not 23.** This is non-negotiable.
5. **Sleep is a feature.** A 4-hour nap mid-hackathon makes the last 12 hours 2x productive.
6. **Commit often.** Every working state is a checkpoint you can revert to.
7. **Read the rules twice.** Make sure your submission matches exactly what they ask for.

You're solving a real problem with real impact. Ship it.

Good luck. 🚀
