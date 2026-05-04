# AI Symptom Pre-Screener — 24-Hour Hackathon Roadmap

> **Project**: AI-powered symptom triage assistant
> **Stack**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + Supabase (Postgres + Auth) + Anthropic Claude API
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
9. [Landing Page, Auth & Dashboard](#9-landing-page-auth--dashboard)
10. [Frontend Implementation](#10-frontend-implementation)
11. [Killer Features Implementation](#11-killer-features-implementation)
12. [Deployment](#12-deployment)
13. [Demo Video Script](#13-demo-video-script)
14. [Submission Checklist](#14-submission-checklist)
15. [Common Pitfalls & Fixes](#15-common-pitfalls--fixes)

---

## 1. Pre-Hackathon Checklist

Complete these BEFORE the clock starts. They don't count against your 24 hours but save 2-3 hours later.

### Accounts (create all of these)

- [ ] GitHub account ready, new repo created (private or public)
- [ ] Vercel account (sign in with GitHub)
- [ ] Supabase account at supabase.com
- [ ] Anthropic Console account at console.anthropic.com
- [ ] OpenRouter account as backup at openrouter.ai
- [ ] Google Cloud Console account for OAuth credentials

### Local environment

- [ ] Node.js 20+ installed (`node -v` to verify)
- [ ] pnpm installed globally: `npm i -g pnpm`
- [ ] Git configured with your name/email
- [ ] VS Code with these extensions: ESLint, Prettier, Tailwind CSS IntelliSense, Prisma
- [ ] A browser with React DevTools

### API keys to have ready

- [ ] `ANTHROPIC_API_KEY` from console.anthropic.com (use team's $10 budget)
- [ ] Supabase project URL + anon key + service role key
- [ ] Google OAuth client ID + secret (from Google Cloud Console → OAuth 2.0 credentials)
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
│                                                              │
│  PUBLIC ROUTES                AUTH-GATED ROUTES              │
│  ┌──────────────┐             ┌──────────────────┐           │
│  │  / (landing) │             │  /dashboard      │           │
│  │  /try (1 use)│  ──signup──▶│  /dashboard/new  │           │
│  │  /login      │             │  /dashboard/...  │           │
│  └──────────────┘             └──────────────────┘           │
│         │                              │                     │
│         ▼                              ▼                     │
│  ┌─────────────────┐         ┌────────────────┐              │
│  │  Server Actions │         │  API Routes    │              │
│  │  + Middleware   │◄────────┤  /api/triage   │              │
│  │  (auth check)   │         │  /api/sessions │              │
│  └─────────────────┘         └──────┬─────────┘              │
└────────────────────────────────────────┼─────────────────────┘
                                         │
              ┌──────────────────────────┼──────────┐
              │                          │          │
        ┌─────▼──────┐            ┌──────▼──────┐  │
        │  Supabase  │            │  Anthropic  │  │
        │  Postgres  │            │  Claude API │  │
        │  + Auth    │            │  (Sonnet)   │  │
        │  + RLS     │            └─────────────┘  │
        └────────────┘                              │
                                       Server-side ─┘
                                     (API key safe)
```

### Why this architecture is scalable

- **Stateless API routes**: Each request is independent → horizontal scaling on Vercel.
- **Server-side AI calls**: API key never exposed; rate limiting and caching at the edge.
- **Postgres via Supabase**: Connection pooling built-in; can handle 10k+ concurrent users.
- **Edge deployment**: Vercel runs your Next.js app close to users globally.
- **Separation of concerns**: UI logic, business logic (lib/), AI logic (services/), data (db/) all separated.
- **Auth at the edge**: Next.js middleware validates Supabase sessions on every protected request — no DB round-trip on each page.
- **Anonymous-first onboarding**: Public landing → 1 free check → auth wall. Lowers friction, drives signups.

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
- **Route groups** for layout separation: `(public)`, `(auth)`, `(dashboard)`.

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
- **Specific error codes**: `RATE_LIMITED`, `AI_TIMEOUT`, `INVALID_INPUT`, `DB_ERROR`, `UNAUTHORIZED`, `FREE_LIMIT_REACHED`.

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
- **Rate limit**: max 20 triage requests per IP per hour (anonymous), 50/hour for authed users.
- **No PII in logs.** Don't log raw symptom text in production.
- **Auth checks in middleware**, not just in components. Defense in depth.
- **Anonymous trial gate**: enforce server-side via `anonymous_checks` table, not just localStorage (clients lie).

### 3.8 Git workflow

- **Conventional commits**: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `style:`.
- **Small commits, often.** Aim for one commit per logical change.
- **Branch per feature**: `feat/adaptive-triage`, `feat/voice-input`, `feat/auth-landing`.
- **PRs required** even if you're solo (rules want visible teamwork).
- **Never commit `.env*` files.** Add to `.gitignore` immediately.

---

## 4. Hour-by-Hour Roadmap

Each hour has explicit deliverables. If you fall behind, mark and continue — never block the next phase.

### Phase 1: Foundation (Hours 0–2) ✅ COMPLETED

#### Hour 0:00–0:30 — Project initialization

- [x] Create new GitHub repo `ai-symptom-prescreener`
- [x] Clone locally
- [x] Run `pnpm create next-app@latest .` with these options:
  - TypeScript: Yes
  - ESLint: Yes
  - Tailwind CSS: Yes
  - `src/` directory: Yes
  - App Router: Yes
  - Import alias: `@/*`
- [x] First commit: `chore: initialize next.js project`
- [x] Push to GitHub

#### Hour 0:30–1:00 — Dependencies and config

```bash
pnpm add @anthropic-ai/sdk @supabase/supabase-js @supabase/ssr zod
pnpm add framer-motion lucide-react clsx tailwind-merge
pnpm add @react-pdf/renderer
pnpm add -D @types/node prettier prettier-plugin-tailwindcss
```

#### Hour 1:00–1:30 — Environment and Supabase

#### Hour 1:30–2:00 — Vercel deployment + smoke test

**Phase 1 done.** ✅

---

### Phase 2: Core AI Engine (Hours 2–6) ✅ COMPLETED

- [x] Type system and Zod schemas
- [x] Anthropic client wrapper with retry/timeout
- [x] System prompt with red flags + few-shot examples
- [x] `/api/triage` route with rate limiting
- [x] Manual testing across all severity levels

**Phase 2 done.** ✅ You should have: A working backend that accepts symptoms and returns structured triage decisions.

---

### Phase 3: Auth + Landing + Dashboard Shell (Hours 6–10) — NEW

**Why this phase exists:** A public landing page that converts visitors into signed-up users is a hard requirement. Anonymous users get exactly one free symptom check, then hit a signup wall before seeing the result. Authed users land on a dashboard that hosts every other feature (history, PDFs, family profiles, insights).

This phase delivers the "front door" of the product — the part judges and visitors hit first.

#### Hour 6:00–6:45 — Supabase Auth setup

- [ ] In Supabase Dashboard → Authentication → Providers:
  - Enable **Email** (with email/password, confirmations OFF for hackathon speed)
  - Enable **Google** — paste OAuth client ID + secret
- [ ] Add redirect URLs: `http://localhost:3000/auth/callback` and `https://<your-vercel-url>/auth/callback`
- [ ] In Google Cloud Console → OAuth credentials, add the same redirect URLs to "Authorized redirect URIs"
- [ ] Add to `.env.local`:
  ```
  NEXT_PUBLIC_SITE_URL=http://localhost:3000
  ```
  (override in Vercel with production URL)
- [ ] Run new migration `0002_auth_and_anon.sql` (see Section 6)
- [ ] Install Supabase SSR helper: already added via `@supabase/ssr` in Phase 1
- [ ] Create `src/lib/db/supabase-server.ts` and `src/lib/db/supabase-client.ts` (see Section 9.2)
- [ ] Commit: `feat: configure supabase auth providers`

#### Hour 6:45–7:30 — Middleware + route groups

- [ ] Create `src/middleware.ts` to refresh session on every request and gate `/dashboard/*`
- [ ] Reorganize `src/app/` into route groups:
  - `(public)/` — landing, login, signup, try
  - `(dashboard)/dashboard/...` — auth-required, shared sidebar layout
  - `auth/callback/route.ts` — OAuth callback handler
- [ ] Create `src/app/(dashboard)/layout.tsx` that calls `getUser()` server-side and redirects to `/login?next=...` if missing
- [ ] Create `src/app/(public)/layout.tsx` — minimal nav (Logo, "Login", "Try Now" CTA)
- [ ] Test: visiting `/dashboard` while signed out redirects to `/login`
- [ ] Commit: `feat: add auth middleware and route groups`

#### Hour 7:30–9:00 — Public landing page (`/`)

This is the page judges see first. Treat it as a product page, not a demo page.

- [ ] Create `src/app/(public)/page.tsx` with these sections (top to bottom):
  1. **Sticky nav** — Logo left, "Login" + "Try Free Check" CTA right. Translucent on scroll.
  2. **Hero** — Two-column on desktop, stacked on mobile.
     - Left: H1 ("Know what your symptoms mean — in 60 seconds"), subhead, primary CTA "Try Free Check" → `/try`, secondary "Sign up free" → `/signup`. Trust line: "No login needed for first check · Available in हिंदी, ગુજરાતી, मराठी".
     - Right: animated phone mockup showing a real triage exchange (use Framer Motion to type out a sample message → show severity badge appearing).
  3. **Severity legend strip** — four pill cards (Emergency / Today / This Week / Self-care) with the same color tokens as the app. Doubles as visual proof of the product.
  4. **"How it works"** — 3 numbered steps, each a `<Card>`: Describe → Adaptive questions → Get guidance + PDF. Icons from `lucide-react`.
  5. **Why it matters** — three stat cards: "600M Indians wait 4+ hrs at OPD", "30% of ER visits could be self-care", "Built with the same model used by clinicians". (Use real-ish stats; cite "WHO India" / "internal research" softly.)
  6. **Demo embed** — placeholder `<div>` for now, replace with your YouTube demo at hour 21.
  7. **Final CTA band** — full-width gradient, "Try your first check — no signup needed" with the same button.
  8. **Footer** — disclaimer (full text), GitHub link, About, Privacy.
- [ ] Use the distinctive font pairing chosen in Phase 3 of original plan (Fraunces + IBM Plex Sans, or Sora + DM Sans).
- [ ] Mobile-first: every section must look great at 375px before you style desktop.
- [ ] Add `<DisclaimerFooter />` shared component.
- [ ] Commit: `feat: public landing page`

#### Hour 9:00–9:45 — Auth pages (`/login`, `/signup`)

Keep these dead simple. One column, max 400px wide, centered.

- [ ] `src/app/(public)/login/page.tsx`:
  - Email + password fields
  - "Continue with Google" button (calls `signInWithOAuth`)
  - Link to `/signup`
  - "Forgot password?" link (skip implementation if time tight, just hide)
  - On submit → server action → redirect to `?next=` URL or `/dashboard`
- [ ] `src/app/(public)/signup/page.tsx`:
  - Same layout, email + password + confirm
  - Google OAuth button
  - Link to `/login`
  - On signup → auto-login → redirect to `/dashboard?welcome=1`
- [ ] `src/app/auth/callback/route.ts` — exchanges OAuth code for session, then redirects
- [ ] Server actions in `src/lib/auth/actions.ts`: `signInWithPassword`, `signUpWithPassword`, `signInWithGoogle`, `signOut`
- [ ] Form validation: Zod, errors shown inline (no alerts)
- [ ] Test all 4 paths end-to-end: email signup, email login, Google signup, Google login
- [ ] Commit: `feat: login and signup with email and google`

#### Hour 9:45–10:30 — Anonymous trial gate (`/try`)

The killer onboarding flow: 1 free check, then signup wall on the result.

- [ ] `src/app/(public)/try/page.tsx` — same `<TriageChat />` component as authed users will use, but wrapped with anonymous tracking
- [ ] On first message: server action issues a signed cookie `anon_id` (UUID) if missing
- [ ] Server-side check before calling `/api/triage`: query `anonymous_checks` table — if `anon_id` already has a completed session, return `FREE_LIMIT_REACHED`
- [ ] Allow the conversation to continue (follow-ups all share one "check") UNTIL `action: "triage"` is returned with a final severity
- [ ] When final severity arrives:
  - Persist a stub row in `anonymous_checks` with `anon_id`, `severity`, `created_at`
  - **Do NOT show the result yet.** Render a `<SignupWall />` overlay instead.
- [ ] `<SignupWall />` (in `src/components/auth/SignupWall.tsx`):
  - Blurred preview of the severity result behind it
  - Headline: "Your result is ready. Create a free account to view it."
  - Bullets: "Save this check to your history · Download doctor PDF · Add family members · See trends over time"
  - Primary "Sign up free" → `/signup?next=/dashboard/check/<sessionId>` (preserves the result)
  - Secondary "Already have an account? Log in" → `/login?next=...`
- [ ] On signup completion, the dashboard fetches that `sessionId` and reveals the full result
- [ ] Commit: `feat: anonymous one-check trial with signup wall`

#### Hour 10:00–10:30 — Dashboard shell

The container; individual feature pages are filled in during Phase 4.

- [ ] `src/app/(dashboard)/layout.tsx`:
  - Sidebar (collapsible on mobile, becomes bottom tab bar < 768px)
  - Sidebar items: New Check (primary, accent color) · History · Saved PDFs · Family · Insights · Settings
  - Top bar: language toggle, user avatar dropdown (Profile, Sign out)
- [ ] `src/app/(dashboard)/dashboard/page.tsx` — landing inside dashboard:
  - Welcome card with first name (or email)
  - Big "Start a new check" CTA → `/dashboard/new`
  - "Recent checks" — last 3 sessions as cards, each linking to `/dashboard/check/<id>`
  - Empty state: "No checks yet. Start your first one →"
- [ ] Stub out the other dashboard routes with placeholder pages so navigation works:
  - `/dashboard/new` — wraps `<TriageChat />`
  - `/dashboard/history` — list of all sessions (build for real in Phase 4)
  - `/dashboard/pdfs` — placeholder
  - `/dashboard/family` — placeholder
  - `/dashboard/insights` — placeholder
  - `/dashboard/settings` — sign out button + delete account
- [ ] Commit: `feat: dashboard shell and navigation`

**Phase 3 done.** You should have: A landing page, working auth (email + Google), anonymous trial with signup wall, and a dashboard shell where authed users land. **Test both onboarding flows on your phone before moving on.**

---

### Phase 4: Core UI — Triage Flow (Hours 10–14)

The triage flow is now used in two contexts: `/try` (anonymous, 1 use) and `/dashboard/new` (authed, unlimited). Build the components once, mount them in both places.

#### Hour 10:00–11:00 — Design system foundations

- [ ] Define CSS variables in `globals.css` for colors, spacing, fonts (apply to both landing and app)
- [ ] Severity color tokens:
  - `--severity-emergency`: red
  - `--severity-urgent`: amber
  - `--severity-soon`: yellow
  - `--severity-self`: green
- [ ] Create `src/components/ui/` primitives: Button, Card, Badge, Input

#### Hour 11:00–12:30 — Conversational UI

Create `src/components/triage/TriageChat.tsx`:

- [ ] Message list with user / assistant bubbles
- [ ] Input area with text + voice (mic button)
- [ ] Quick-reply chips when Claude suggests options (tap instead of type)
- [ ] Auto-scroll to latest message
- [ ] "Claude is thinking..." indicator with animated dots
- [ ] Mobile-first responsive layout (test at 375px width)
- [ ] Empty state with example prompts: "I have a fever", "Headache for 2 days", "Chest pain"
- [ ] Accepts an optional `mode` prop: `"anonymous" | "authed"` to control trial gate behavior

#### Hour 12:30–13:30 — Severity result screen

- [ ] Big visual indicator (traffic light style)
- [ ] Severity label in user's language
- [ ] Plain-language reasoning from Claude
- [ ] List of red flags if any
- [ ] Action button based on severity (call 108 / find clinic / schedule / OTC)
- [ ] "Download summary for doctor" button (PDF) — shown only for authed users; anonymous users see "Sign up to download PDF"
- [ ] "Start new check" button (only for authed; anonymous users see "Sign up for unlimited checks")

#### Hour 13:30–14:00 — Emergency lockout flow

- [ ] `<EmergencyScreen />` overrides everything (including signup wall) when severity = emergency
- [ ] Massive red background, white text, pulsing animation
- [ ] One-tap call button (`<a href="tel:108">`)
- [ ] **Important**: Even anonymous users see the emergency screen WITHOUT a signup wall. Safety > conversion.
- [ ] Commit: `feat: complete core triage UI`

**Phase 4 done.**

---

### Phase 5: Dashboard Features (Hours 14–18)

Each dashboard sub-page becomes real here. Cut from the bottom if running late.

#### Hour 14:00–14:45 — Triage history

- [ ] `src/app/(dashboard)/dashboard/history/page.tsx` — Server Component, fetch all sessions for current user
- [ ] List view: each card shows date, first symptom, severity badge, quick actions
- [ ] Filters: severity, date range, language
- [ ] Click → `/dashboard/check/<id>` — read-only result view with conversation transcript

#### Hour 14:45–15:30 — Saved PDFs

- [ ] `src/app/(dashboard)/dashboard/pdfs/page.tsx`
- [ ] Generate PDFs on-demand from existing sessions (no storage needed for hackathon)
- [ ] Grid of cards, each "Download" regenerates the PDF
- [ ] Group by month
- [ ] PDF generation logic: Section 11.3

#### Hour 15:30–16:30 — Family members

The differentiator. Lets a parent triage for kids, a child for elderly parents.

- [ ] `src/app/(dashboard)/dashboard/family/page.tsx`
- [ ] CRUD UI for `family_members` table: add / edit / remove
- [ ] Each member: nickname, relation, age band (child <12, teen, adult, elderly), known conditions (free text)
- [ ] On `/dashboard/new`, show a member picker at the top: "Who is this check for? Me · Mom · Dad · Add new"
- [ ] Pass member context to system prompt: e.g. "Triage is for a 7-year-old child" — Claude must adjust OTC suggestions, urgency thresholds
- [ ] Commit: `feat: family members and triage-for-others`

#### Hour 16:30–17:30 — Voice input + multilingual

- [ ] `useSpeechRecognition` hook (see Section 11.1)
- [ ] Mic button on chat input
- [ ] Language toggle in dashboard top bar (English / हिंदी / ગુજરાતી / मराठी)
- [ ] Persist choice in `profiles.preferred_language`
- [ ] Pass language to system prompt
- [ ] Translate UI strings: `src/lib/i18n/translations.ts`

#### Hour 17:30–18:00 — Health insights (lightweight)

- [ ] `src/app/(dashboard)/dashboard/insights/page.tsx`
- [ ] Aggregate over user's sessions: severity distribution (donut), check frequency (bar by month), most common symptoms (word cloud or top-5 list)
- [ ] Use `recharts` (already available in your stack)
- [ ] If user has < 3 sessions: empty state with "Insights unlock after 3 checks" — sets expectations and encourages return visits
- [ ] Commit: `feat: dashboard features complete`

**Phase 5 done. Take a 15-minute break. Eat something. Hydrate.**

---

### Phase 6: Polish (Hours 18–21)

This phase wins or loses the hackathon. Don't skip.

#### Hour 18:00–19:00 — Loading and error states

- [ ] Skeleton loaders for chat, history list, dashboard cards
- [ ] "Claude is analyzing..." with progress hints
- [ ] Error boundary on every route group
- [ ] Network failure banners with retry
- [ ] AI timeout: friendly message
- [ ] Form validation errors shown inline, never as alerts
- [ ] **Anonymous-specific**: If `FREE_LIMIT_REACHED`, show a polished modal explaining the limit + signup CTA — never a raw error

#### Hour 19:00–20:00 — Animations and micro-interactions

- [ ] Framer Motion stagger on landing page sections (fade + slide up on scroll)
- [ ] Animated phone mockup on hero
- [ ] Smooth severity color transition on result screen
- [ ] Page transitions between landing → try → signup wall
- [ ] Subtle pulse on emergency button
- [ ] Don't overdo it — sophisticated > flashy

#### Hour 20:00–20:30 — Accessibility

- [ ] All buttons have `aria-label`
- [ ] Form inputs have associated labels
- [ ] Color contrast passes WCAG AA (use Lighthouse)
- [ ] Keyboard navigation works end-to-end including dashboard sidebar
- [ ] Screen reader announces severity changes
- [ ] Test full flow with keyboard only

#### Hour 20:30–21:00 — Real device testing + final polish

- [ ] Open on your actual phone (not just dev tools)
- [ ] Test full flow on iOS Safari and Android Chrome:
  - Landing → Try → Signup wall → Signup → Dashboard
  - Login from a fresh browser
  - Google OAuth on mobile
- [ ] Fix any responsive bugs found
- [ ] Run Lighthouse audit, fix critical issues
- [ ] Add medical disclaimer to every page footer
- [ ] Final commit: `chore: polish and a11y fixes`
- [ ] Push and verify production deploy works

**Phase 6 done. Your app is judge-ready.**

---

### Phase 7: Submission (Hours 21–24)

#### Hour 21:00–22:30 — Demo video

- [ ] Write a script (see Section 13)
- [ ] **Show the landing page** — judges need to see the front door
- [ ] **Show the anonymous → signup → dashboard conversion flow** — this is your unique angle
- [ ] Record under 5 minutes
- [ ] Upload to YouTube unlisted or Loom

#### Hour 22:30–23:30 — One-page document

#### Hour 23:30–24:00 — Submit

- [ ] Submit demo video link, GitHub repo, one-page doc, live URL
- [ ] Verify submission went through

---

## 5. Project Structure

```
ai-symptom-prescreener/
├── public/
│   ├── icons/
│   ├── og-image.png
│   └── hero-mockup.png
├── src/
│   ├── app/
│   │   ├── (public)/                 # Unauthenticated routes
│   │   │   ├── layout.tsx            # Public nav + footer
│   │   │   ├── page.tsx              # Landing page (/)
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── signup/
│   │   │   │   └── page.tsx
│   │   │   ├── try/
│   │   │   │   └── page.tsx          # Anonymous 1-check trial
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   └── privacy/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/              # Auth-required routes
│   │   │   ├── layout.tsx            # Sidebar + auth guard
│   │   │   └── dashboard/
│   │   │       ├── page.tsx          # Dashboard home
│   │   │       ├── new/
│   │   │       │   └── page.tsx      # New triage check
│   │   │       ├── check/
│   │   │       │   └── [id]/
│   │   │       │       └── page.tsx  # View past check
│   │   │       ├── history/
│   │   │       │   └── page.tsx
│   │   │       ├── pdfs/
│   │   │       │   └── page.tsx
│   │   │       ├── family/
│   │   │       │   └── page.tsx
│   │   │       ├── insights/
│   │   │       │   └── page.tsx
│   │   │       └── settings/
│   │   │           └── page.tsx
│   │   ├── auth/
│   │   │   └── callback/
│   │   │       └── route.ts          # OAuth callback handler
│   │   ├── api/
│   │   │   ├── triage/
│   │   │   │   └── route.ts          # POST /api/triage
│   │   │   └── sessions/
│   │   │       └── [id]/
│   │   │           └── route.ts
│   │   ├── layout.tsx                # Root layout (fonts, theme)
│   │   ├── globals.css
│   │   └── error.tsx
│   ├── middleware.ts                 # Auth session refresh + route guard
│   ├── components/
│   │   ├── ui/                       # Primitives (no domain logic)
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Badge.tsx
│   │   │   └── Input.tsx
│   │   ├── landing/                  # Landing page sections
│   │   │   ├── Hero.tsx
│   │   │   ├── PhoneMockup.tsx
│   │   │   ├── SeverityLegend.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── StatCards.tsx
│   │   │   ├── DemoEmbed.tsx
│   │   │   └── FinalCTA.tsx
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── GoogleButton.tsx
│   │   │   └── SignupWall.tsx        # The conversion overlay
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MobileTabBar.tsx
│   │   │   ├── UserMenu.tsx
│   │   │   ├── RecentChecks.tsx
│   │   │   └── FamilyMemberPicker.tsx
│   │   ├── triage/
│   │   │   ├── TriageChat.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   ├── SeverityResult.tsx
│   │   │   ├── EmergencyScreen.tsx
│   │   │   ├── OTCSuggestions.tsx
│   │   │   └── VoiceInputButton.tsx
│   │   └── shared/
│   │       ├── PublicNav.tsx
│   │       ├── LanguageToggle.tsx
│   │       ├── DisclaimerFooter.tsx
│   │       └── ErrorBoundary.tsx
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── actions.ts            # Server actions: signIn, signUp, signOut
│   │   │   ├── get-user.ts           # Server-side current user helper
│   │   │   └── anon-id.ts            # Anonymous tracking
│   │   ├── ai/
│   │   │   ├── anthropic-client.ts
│   │   │   ├── prompts/
│   │   │   │   └── triage-system.ts
│   │   │   └── extract-json.ts
│   │   ├── triage/
│   │   │   ├── schema.ts             # Zod schemas
│   │   │   ├── types.ts
│   │   │   ├── red-flags.ts
│   │   │   └── severity.ts
│   │   ├── db/
│   │   │   ├── supabase-server.ts    # Server-side client (cookies)
│   │   │   ├── supabase-client.ts    # Browser client
│   │   │   ├── supabase-admin.ts     # Service role (API routes only)
│   │   │   └── queries.ts            # All DB queries
│   │   ├── i18n/
│   │   │   └── translations.ts
│   │   ├── hooks/
│   │   │   ├── useSpeechRecognition.ts
│   │   │   └── useTriageSession.ts
│   │   ├── pdf/
│   │   │   └── DoctorSummaryPDF.tsx
│   │   └── utils/
│   │       ├── cn.ts
│   │       ├── rate-limit.ts
│   │       └── logger.ts
│   └── styles/
│       └── tokens.css
├── supabase/
│   └── migrations/
│       ├── 0001_initial.sql
│       └── 0002_auth_and_anon.sql
├── .env.example
├── .env.local
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

(unchanged from Phase 2 — keep your existing migration)

```sql
create extension if not exists "uuid-ossp";

create table public.triage_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  anonymous_id text,
  language text not null default 'English',
  conversation jsonb not null default '[]'::jsonb,
  final_severity text check (final_severity in ('emergency', 'clinic_today', 'clinic_soon', 'self_care')),
  red_flags jsonb default '[]'::jsonb,
  doctor_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_or_anon check (user_id is not null or anonymous_id is not null)
);

create index idx_sessions_user on public.triage_sessions(user_id);
create index idx_sessions_anon on public.triage_sessions(anonymous_id);
create index idx_sessions_created on public.triage_sessions(created_at desc);

-- updated_at trigger
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

alter table public.triage_sessions enable row level security;

create policy "Users read own sessions"
  on public.triage_sessions for select
  using (auth.uid() = user_id);

create policy "Users insert own sessions"
  on public.triage_sessions for insert
  with check (auth.uid() = user_id or user_id is null);

create table public.rate_limits (
  id uuid primary key default uuid_generate_v4(),
  identifier text not null,
  endpoint text not null,
  count int not null default 1,
  window_start timestamptz not null default now()
);

create index idx_rate_limits_lookup on public.rate_limits(identifier, endpoint, window_start);
```

### `supabase/migrations/0002_auth_and_anon.sql` — NEW

```sql
-- 1. Profiles: extends auth.users with app-specific fields
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  preferred_language text default 'English',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users read own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Auto-create profile when a new user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Family members: triage-for-others
create table public.family_members (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null,
  relation text,
  age_band text check (age_band in ('child', 'teen', 'adult', 'elderly')),
  known_conditions text,
  created_at timestamptz default now()
);

create index idx_family_user on public.family_members(user_id);
alter table public.family_members enable row level security;

create policy "Users manage own family"
  on public.family_members for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. Anonymous checks: server-side enforcement of 1-free-check rule
create table public.anonymous_checks (
  anon_id text primary key,
  session_id uuid references public.triage_sessions(id) on delete set null,
  severity text,
  ip text,
  user_agent text,
  created_at timestamptz default now(),
  consumed_at timestamptz
);

create index idx_anon_consumed on public.anonymous_checks(consumed_at);
-- No RLS — accessed only from API routes via service role.

-- 4. Link triage_sessions to family_members (optional)
alter table public.triage_sessions
  add column if not exists family_member_id uuid references public.family_members(id) on delete set null;

create index if not exists idx_sessions_family on public.triage_sessions(family_member_id);

-- 5. Update sessions RLS for authed users to include only their own
drop policy if exists "Users read own sessions" on public.triage_sessions;
create policy "Users read own sessions"
  on public.triage_sessions for select
  using (auth.uid() = user_id);
```

Run this in Supabase SQL editor or via CLI after Phase 2 migration.

---

## 7. Claude API Integration

(Section unchanged — your Phase 2 implementation already covers this. See your existing `src/lib/ai/anthropic-client.ts` and `src/lib/triage/schema.ts`.)

The only addition for Phase 3+: the API route now also writes to `anonymous_checks` for unauthenticated requests. Update `/api/triage/route.ts`:

```typescript
// Inside POST handler, after analyzeSymptoms returns success:
if (!userId && result.data.action === "triage") {
  // Anonymous user just completed their free check
  await supabaseAdmin.from("anonymous_checks").upsert({
    anon_id: anonId,
    session_id: savedSessionId,
    severity: result.data.severity,
    ip,
    user_agent: req.headers.get("user-agent") ?? null,
    consumed_at: new Date().toISOString(),
  });
}

// Before calling analyzeSymptoms for anonymous users:
if (!userId) {
  const { data: existing } = await supabaseAdmin
    .from("anonymous_checks")
    .select("consumed_at")
    .eq("anon_id", anonId)
    .single();
  if (existing?.consumed_at) {
    return NextResponse.json(
      { ok: false, error: { code: "FREE_LIMIT_REACHED", message: "Sign up for unlimited checks." } },
      { status: 403 }
    );
  }
}
```

---

## 8. System Prompt Design

(Section unchanged from Phase 2.)

One small addition for Phase 5 (family members): inject a `Patient context` block when a `family_member_id` is attached to the session.

```typescript
// In analyzeSymptoms call, prepend to system prompt:
const patientContext = familyMember
  ? `\n# PATIENT CONTEXT\nThis triage is for a ${familyMember.age_band} (relation: ${familyMember.relation}). Known conditions: ${familyMember.known_conditions ?? "none"}. Adjust OTC suggestions and urgency thresholds accordingly. Never suggest OTC for child age band.`
  : "";

const systemPrompt = TRIAGE_SYSTEM_PROMPT.replace("{{LANGUAGE}}", language) + patientContext;
```

---

## 9. Landing Page, Auth & Dashboard

This section contains the implementation specs for everything introduced in Phase 3.

### 9.1 Landing page design spec

**Layout** (top to bottom):

| Section | Height (mobile) | Height (desktop) | Notes |
|---|---|---|---|
| Sticky nav | 56px | 64px | Translucent, blurs on scroll |
| Hero | 100dvh | 80vh | Two-column on desktop, stacked mobile |
| Severity legend | auto | auto | 4 pill cards |
| How it works | auto | auto | 3-column grid desktop, stacked mobile |
| Stat cards | auto | auto | 3 cards |
| Demo embed | 16:9 aspect | 16:9 aspect | Placeholder until video done |
| Final CTA band | auto | auto | Full-width gradient |
| Footer | auto | auto | Disclaimer-heavy |

**Color tokens** (use throughout):

```css
:root {
  --bg-primary: #fefcf7;          /* warm off-white */
  --bg-elevated: #ffffff;
  --text-primary: #1a1614;
  --text-muted: #6b635c;
  --accent: #0d7d6b;              /* deep teal — calming, medical */
  --accent-fg: #ffffff;
  --severity-emergency: #dc2626;
  --severity-urgent: #f59e0b;
  --severity-soon: #eab308;
  --severity-self: #16a34a;
  --border: #ebe6dd;
}
```

**Typography**: Pair a warm serif with a clean sans. Recommended:

- Headings: **Fraunces** (700, optical size for big sizes)
- Body: **IBM Plex Sans** (400/500/600)

This pairing reads as "credible but human" — not cold tech, not generic startup.

**Hero copy** (verbatim suggestions):

- H1: `Know what your symptoms mean — in 60 seconds.`
- Subhead: `An AI pre-screener that asks the right follow-up questions, flags red flags, and tells you whether to call 108, see a doctor today, or just rest.`
- Primary button: `Try a free check →` (links to `/try`)
- Secondary button: `Sign up free` (links to `/signup`)
- Trust line: `No login for first check · हिंदी, ગુજરાતી, मराठी supported · Built with Claude`

**Hero animation** (right column on desktop, hidden on mobile to save vertical space):

A phone mockup (iPhone 14 frame, SVG outline) with an animated chat that loops:
1. User bubble fades in: "I have chest pain and sweating"
2. Assistant typing dots
3. Severity badge slides up: red, "Emergency"
4. Pause 2s, fade out, restart

Use Framer Motion `useAnimationControls`.

### 9.2 Supabase clients

**`src/lib/db/supabase-server.ts`** — for Server Components and Server Actions:

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component — ignore (middleware will refresh)
          }
        },
      },
    }
  );
}
```

**`src/lib/db/supabase-client.ts`** — for Client Components:

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

**`src/lib/db/supabase-admin.ts`** — for API routes that need to bypass RLS:

```typescript
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);
```

### 9.3 Middleware

**`src/middleware.ts`**:

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session on every request
  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isProtected = path.startsWith("/dashboard");

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }

  // If signed-in user hits /login or /signup, send them to dashboard
  if (user && (path === "/login" || path === "/signup")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
```

### 9.4 Auth server actions

**`src/lib/auth/actions.ts`**:

```typescript
"use server";

import { createSupabaseServer } from "@/lib/db/supabase-server";
import { redirect } from "next/navigation";
import { z } from "zod";

const CredsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function signInWithPassword(formData: FormData) {
  const parsed = CredsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: "Invalid email or password" };

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, error: error.message };

  const next = (formData.get("next") as string) || "/dashboard";
  redirect(next);
}

export async function signUpWithPassword(formData: FormData) {
  const parsed = CredsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { ok: false, error: "Email and 8+ char password required" };

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.signUp(parsed.data);
  if (error) return { ok: false, error: error.message };

  const next = (formData.get("next") as string) || "/dashboard?welcome=1";
  redirect(next);
}

export async function signInWithGoogle(next: string = "/dashboard") {
  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { ok: false, error: error.message };
  if (data.url) redirect(data.url);
}

export async function signOut() {
  const supabase = await createSupabaseServer();
  await supabase.auth.signOut();
  redirect("/");
}
```

**`src/app/auth/callback/route.ts`**:

```typescript
import { createSupabaseServer } from "@/lib/db/supabase-server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createSupabaseServer();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
```

### 9.5 Anonymous trial gate

**`src/lib/auth/anon-id.ts`**:

```typescript
import { cookies } from "next/headers";
import { randomUUID } from "crypto";

const COOKIE_NAME = "anon_id";
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function getOrCreateAnonId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(COOKIE_NAME)?.value;
  if (existing) return existing;

  const fresh = randomUUID();
  cookieStore.set(COOKIE_NAME, fresh, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ONE_YEAR,
  });
  return fresh;
}
```

**`src/components/auth/SignupWall.tsx`** sketch:

```typescript
"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export function SignupWall({ sessionId }: { sessionId: string }) {
  const next = `/dashboard/check/${sessionId}`;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
    >
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
        <h2 className="text-2xl font-bold mb-2">Your result is ready.</h2>
        <p className="text-gray-600 mb-4">
          Create a free account to view your full triage, save it to your history, and download a doctor-ready PDF.
        </p>
        <ul className="space-y-2 text-sm mb-6">
          <li>✓ Save every check to your private history</li>
          <li>✓ Download doctor-ready PDF summaries</li>
          <li>✓ Add family members and triage for them</li>
          <li>✓ See trends across your symptoms</li>
        </ul>
        <Link
          href={`/signup?next=${encodeURIComponent(next)}`}
          className="block w-full bg-emerald-600 text-white text-center py-3 rounded-lg font-semibold mb-2"
        >
          Sign up free
        </Link>
        <Link
          href={`/login?next=${encodeURIComponent(next)}`}
          className="block w-full text-center py-3 text-gray-700"
        >
          Already have an account? Log in
        </Link>
      </div>
    </motion.div>
  );
}
```

### 9.6 Dashboard layout

**`src/app/(dashboard)/layout.tsx`**:

```typescript
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/db/supabase-server";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { MobileTabBar } from "@/components/dashboard/MobileTabBar";
import { UserMenu } from "@/components/dashboard/UserMenu";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-[var(--bg-primary)]">
      <aside className="hidden md:flex w-64 border-r border-[var(--border)] flex-col">
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b border-[var(--border)] flex items-center justify-end px-4 md:px-8">
          <UserMenu email={user.email!} />
        </header>
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">{children}</main>
      </div>
      <MobileTabBar />
    </div>
  );
}
```

---

## 10. Frontend Implementation

### Key principles

1. **Server Components by default** — only `"use client"` for interactive parts
2. **Mobile-first** — design for 375px width, scale up
3. **Optimistic updates** — show user message instantly, then loading state for AI
4. **Accessible** — keyboard, screen reader, color contrast all work

### Triage page (works for both anonymous and authed)

**`src/app/(public)/try/page.tsx`** (anonymous):

```typescript
import { TriageChat } from "@/components/triage/TriageChat";
import { getOrCreateAnonId } from "@/lib/auth/anon-id";

export default async function TryPage() {
  const anonId = await getOrCreateAnonId();
  return <TriageChat mode="anonymous" anonId={anonId} />;
}
```

**`src/app/(dashboard)/dashboard/new/page.tsx`** (authed):

```typescript
import { TriageChat } from "@/components/triage/TriageChat";
import { createSupabaseServer } from "@/lib/db/supabase-server";

export default async function NewCheckPage() {
  const supabase = await createSupabaseServer();
  const { data: members } = await supabase.from("family_members").select("*");
  return <TriageChat mode="authed" familyMembers={members ?? []} />;
}
```

The `TriageChat` component checks `mode` to decide whether to:
- Show signup wall on final result (anonymous)
- Show family member picker (authed)
- Allow PDF download (authed only)
- Allow "Start new check" (authed only)

(Rest of the section unchanged from original — `MessageBubble`, `SeverityResult`, `EmergencyScreen` are mode-agnostic.)

---

## 11. Killer Features Implementation

### 11.1 Voice input hook

**`src/lib/hooks/useSpeechRecognition.ts`**:

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

### 11.2 Emergency screen

(Unchanged from Phase 2 plan. This component must work for both anonymous and authed — emergency overrides the signup wall. Safety > conversion.)

### 11.3 PDF export

(Unchanged from Phase 2 plan. Authed-only feature. See `src/lib/pdf/DoctorSummaryPDF.tsx`.)

---

## 12. Deployment

### Vercel deployment steps

1. Push final code to GitHub
2. Vercel → "Import Project" → select your repo
3. **Environment variables** (set in Vercel dashboard):
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` ← must be your production URL for OAuth redirects
4. **Important post-deploy steps for auth:**
   - Add production callback URL to Supabase: `https://<your-vercel-url>/auth/callback`
   - Add same URL to Google Cloud Console OAuth credentials
5. Build command: `pnpm build` (default)
6. Output directory: `.next` (default)
7. Deploy
8. Verify production URL works
9. Test full auth flow on production: Google OAuth and email signup both work

### Pre-deployment checklist

- [ ] All `console.log` removed from production code
- [ ] `next.config.js` has `productionBrowserSourceMaps: false`
- [ ] No hardcoded API keys anywhere in code
- [ ] Image optimization configured
- [ ] Security headers added
- [ ] OG image and favicon set
- [ ] Auth redirect URLs match production domain in both Supabase and Google Console
- [ ] Middleware tested on production (try `/dashboard` while signed out → should redirect)

### `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" }, // Google avatars
    ],
  },
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

## 13. Demo Video Script

Target: under 5 minutes, ideally 3:30.

### Structure (timestamps)

**0:00–0:20 — Hook + landing**
"Healthcare access in rural India is broken. Today I'm showing you an AI symptom pre-screener that gives anyone, anywhere, instant medical triage in their own language."
*Show landing page scrolling — judges see the front door first.*

**0:20–0:40 — Problem**
600M Indians lack timely access. OPD wait times 4 hours. Elderly delay critical visits.

**0:40–1:00 — Solution overview**
Quick whip through architecture: Next.js + Claude AI + Supabase Auth + multilingual + voice + PDF.

**1:00–2:00 — The conversion flow (your unique angle)**
- Click "Try free check" — go to `/try` as anonymous user
- Speak in Hindi: "Mujhe halki si khansi hai do din se"
- Show Claude's adaptive follow-ups
- **Hit the signup wall when result is ready** — explain "this is intentional, drives users into the platform"
- Sign up with Google in 2 clicks
- Land on dashboard, see the just-completed check waiting

**2:00–2:45 — Emergency case (no signup needed for safety)**
- Speak: "I have chest pain and I'm sweating"
- Show INSTANT emergency lockout — even for anonymous users, **safety bypasses the signup wall**
- One-tap call button

**2:45–3:15 — Dashboard tour**
- History view with past checks
- Family members — add a child, run a triage for them
- PDF download for doctor

**3:15–3:45 — Technical wow**
- Show Claude's adaptive reasoning briefly
- Highlight: Supabase RLS, anonymous-then-authed architecture, edge deployment, type-safe pipeline

**3:45–4:15 — Impact and close**
- "Built in 24 hours, deployed at [URL], open source"
- "This isn't a chatbot — it's a triage decision system that thinks like a doctor, with a real product around it"
- "Thank you"

### Recording tips

- Use a clean phone background, no notifications
- Clear audio matters more than 4K video
- Practice transitions twice before recording
- Edit out long Claude wait times if any
- Add captions for accessibility
- Export at 1080p, MP4

---

## 14. Submission Checklist

### Final submission package

- [ ] **Demo video** (under 5 min) uploaded to YouTube unlisted or Loom
- [ ] **GitHub repo** public, with good README, license, and full commit history
- [ ] **One-page document** filled out using provided template
- [ ] **Live URL** working, tested in incognito mode
- [ ] **Landing page** is now the home route — no separate URL needed

### README.md must include

- [ ] Project name and tagline
- [ ] Demo video link
- [ ] Live URL
- [ ] Screenshot/GIF of the app (include landing + dashboard)
- [ ] Problem statement
- [ ] Solution
- [ ] Tech stack
- [ ] Local setup instructions (including Supabase + Google OAuth setup)
- [ ] Environment variables list
- [ ] AI integration details
- [ ] Auth + dashboard architecture diagram
- [ ] Team members
- [ ] License (MIT recommended)

### Test these flows in incognito before submitting

- [ ] Land on `/` → click "Try free check" → complete an anonymous check → hit signup wall → sign up → see result
- [ ] Sign in with Google
- [ ] Sign in with email/password
- [ ] Sign out → try `/dashboard` → redirected to `/login`
- [ ] Run a check from dashboard, download PDF
- [ ] Add a family member, run a check for them
- [ ] Trigger emergency severity as anonymous user → no signup wall, emergency screen shows immediately

### What judges grade on (from rules)

1. **Real Problem, Real Solution** — your healthcare angle is strong, lean into rural/elderly access
2. **AI Deeply Integrated** — emphasize adaptive questioning, not just "we use AI"
3. **Actually Works** — verified live URL, no broken flows
4. **Clean & Polished** — animations, error states, mobile-first UI, real landing page
5. **Team Collaboration** — multiple contributors visible in commits, PR reviews
6. **Product, Not Demo** — landing page + auth + dashboard show this is a real product, not a hackathon throwaway

---

## 15. Common Pitfalls & Fixes

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

### Google OAuth redirects to localhost on production

- Symptom: After Google sign-in, lands on `localhost:3000`
- Fix: `NEXT_PUBLIC_SITE_URL` env var on Vercel must be production URL. Also add production callback to BOTH Supabase auth settings AND Google Cloud Console OAuth credentials.

### Anonymous user can bypass 1-check limit by clearing cookies

- Symptom: Same browser, infinite free checks
- Fix: Don't trust the cookie alone. Server-side `anonymous_checks` table is keyed by `anon_id`, but ALSO log IP. For hackathon, cookie-based is acceptable; mention "production version uses fingerprinting + IP heuristics" in your one-pager.

### Signup wall appears for emergency cases

- Symptom: Anonymous user with chest pain hits a signup wall instead of emergency screen
- Fix: In `TriageChat`, check `severity === "emergency"` BEFORE rendering signup wall. Emergency always wins.

### Dashboard layout flashes to public layout briefly

- Symptom: Brief flicker of public nav before dashboard loads
- Fix: Auth check is in the layout (Server Component). If still flickering, ensure middleware also redirects unauthenticated users on `/dashboard/*`.

### `auth.users` and `profiles` desync

- Symptom: User exists in `auth.users` but has no profile row
- Fix: The `handle_new_user` trigger handles this. If it fails (rare), add a fallback in the dashboard layout that creates a profile if missing.

### Middleware loops or breaks static asset requests

- Symptom: Images don't load, infinite redirects
- Fix: The `matcher` config in `middleware.ts` excludes static files. Don't change it without understanding the regex.

### "Invalid login credentials" on a fresh signup

- Symptom: Email signup says success, login fails
- Fix: Email confirmations are ON by default in Supabase. Turn them OFF for hackathon (Authentication → Settings → "Confirm email" → Disabled), or check spam for confirmation email.

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
2. **Cut early, cut often.** If something isn't done by the hour deadline, cut it.
3. **Test on real devices.** Dev tools lie. Your phone tells the truth.
4. **Record demo at hour 21, not 23.** Non-negotiable.
5. **Sleep is a feature.** A 4-hour nap mid-hackathon makes the last 12 hours 2x productive.
6. **Commit often.** Every working state is a checkpoint you can revert to.
7. **Read the rules twice.** Make sure your submission matches exactly what they ask for.
8. **The landing page sells the product.** The dashboard proves it's real. The triage flow earns the trust. All three matter.

You're solving a real problem with real impact. Ship it.

Good luck. 🚀
