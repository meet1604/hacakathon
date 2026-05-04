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
8. [Full Dashboard Functionality & Data Persistence](#8-full-dashboard-functionality--data-persistence) ← **NEW**
9. [System Prompt Design](#9-system-prompt-design)
10. [Landing Page, Auth & Dashboard](#10-landing-page-auth--dashboard)
11. [Frontend Implementation](#11-frontend-implementation)
12. [Killer Features Implementation](#12-killer-features-implementation)
13. [Deployment](#13-deployment)
14. [Demo Video Script](#14-demo-video-script)
15. [Submission Checklist](#15-submission-checklist)
16. [Common Pitfalls & Fixes](#16-common-pitfalls--fixes)

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
pnpm add @react-pdf/renderer recharts date-fns
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

### Phase 3: Auth + Landing + Dashboard Shell (Hours 6–10)

(Same as before — see original roadmap. Delivers the public landing page, auth flows, anonymous trial gate, and a navigable but mostly-stubbed dashboard.)

**Phase 3 done.** You should have: A landing page, working auth (email + Google), anonymous trial with signup wall, and a dashboard shell where authed users land.

---

### Phase 4: Core UI — Triage Flow (Hours 10–14)

(Same as before — see original roadmap. Delivers `TriageChat`, `SeverityResult`, `EmergencyScreen`, voice input button, mobile-first responsive layout.)

**Phase 4 done.**

---

### Phase 5: Dashboard Features — UI Layer (Hours 14–17)

This phase builds the **UI shells** for every dashboard page. Phase 8 wires them to real data.

- [ ] History page UI (list, filters, empty state)
- [ ] Reports/PDFs page UI (grid of cards)
- [ ] Family members page UI (CRUD form)
- [ ] Insights page UI (charts with mock data)
- [ ] Settings page UI (profile, preferences, danger zone)

**Phase 5 done. Take a 15-minute break.**

---

### Phase 6: Polish (Hours 17–20)

(Same as before — loading states, animations, accessibility, real-device testing.)

---

### Phase 7: Voice + Multilingual + PDF (Hours 20–22)

(Same as before — voice input hook, language toggle, PDF generator.)

---

### Phase 8: Full Dashboard Functionality & Data Persistence (Hours 22–24) ← **NEW & CRITICAL**

> **Why this phase exists:** As of now, every dashboard page is a shell — Dashboard, History, Reports, Family, Insights, and Settings render UI but nothing is persisted, queried, or wired to the database. This phase makes every page **fully functional** with end-to-end data flow: every triage interaction is stored, every page reads from the database, every action mutates state correctly with optimistic UI and proper error handling.
>
> This is the difference between "demo" and "product." Judges will click around. Empty states must be intentional, not accidental.

#### 8.0 Audit current state (15 min — Hour 22:00–22:15)

Before writing any code, run through every dashboard page and document what's broken:

- [ ] `/dashboard` — Does it show real recent checks or hardcoded mocks?
- [ ] `/dashboard/history` — Does it query `triage_sessions` or render a static list?
- [ ] `/dashboard/pdfs` (Reports) — Can users actually download a PDF for a past session?
- [ ] `/dashboard/family` — Do add/edit/delete persist to `family_members`?
- [ ] `/dashboard/insights` — Are charts driven by real aggregations or fake numbers?
- [ ] `/dashboard/settings` — Does updating language/profile actually save?

Write findings into a single `PHASE_8_AUDIT.md` checklist. Commit so the team sees it.

#### 8.1 Database completeness pass (Hour 22:15–22:35)

Run this migration (`0003_dashboard_completeness.sql`) to fill schema gaps the existing tables don't cover. **Idempotent — safe to re-run.**

```sql
-- ============================================================
-- 0003_dashboard_completeness.sql
-- Ensures every dashboard feature has a backing table/columns.
-- ============================================================

-- 1. Triage sessions: extend with fields the dashboard needs
alter table public.triage_sessions
  add column if not exists title text,                     -- short auto-generated label for lists
  add column if not exists symptoms_summary text,          -- one-line summary for cards
  add column if not exists patient_name text,              -- denormalized for fast list rendering
  add column if not exists status text default 'completed' -- in_progress | completed | abandoned
    check (status in ('in_progress', 'completed', 'abandoned')),
  add column if not exists last_message_at timestamptz default now(),
  add column if not exists message_count int default 0,
  add column if not exists deleted_at timestamptz;         -- soft delete

create index if not exists idx_sessions_status on public.triage_sessions(user_id, status);
create index if not exists idx_sessions_not_deleted on public.triage_sessions(user_id, created_at desc)
  where deleted_at is null;

-- 2. Reports: persisted PDF metadata (we generate PDFs on demand,
--    but track which sessions have been "saved as report" by user)
create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.triage_sessions(id) on delete cascade,
  title text not null,
  notes text,                                              -- user's own notes added later
  created_at timestamptz default now(),
  unique(user_id, session_id)
);

create index if not exists idx_reports_user on public.reports(user_id, created_at desc);
alter table public.reports enable row level security;

drop policy if exists "Users manage own reports" on public.reports;
create policy "Users manage own reports"
  on public.reports for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 3. User settings (denormalized from profiles for quick reads)
alter table public.profiles
  add column if not exists timezone text default 'Asia/Kolkata',
  add column if not exists notification_email boolean default true,
  add column if not exists onboarding_completed boolean default false,
  add column if not exists deleted_at timestamptz;

-- 4. Insights cache (so we don't recompute on every page load)
create table if not exists public.insights_cache (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  computed_at timestamptz default now()
);

alter table public.insights_cache enable row level security;
drop policy if exists "Users read own insights" on public.insights_cache;
create policy "Users read own insights"
  on public.insights_cache for select using (auth.uid() = user_id);

-- 5. Audit log (optional but professional — judges notice this)
create table if not exists public.activity_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  action text not null,           -- e.g. 'session.created', 'family.added'
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_activity_user on public.activity_log(user_id, created_at desc);
alter table public.activity_log enable row level security;
drop policy if exists "Users read own activity" on public.activity_log;
create policy "Users read own activity"
  on public.activity_log for select using (auth.uid() = user_id);

-- 6. RLS for sessions: ensure update/delete are also covered
drop policy if exists "Users update own sessions" on public.triage_sessions;
create policy "Users update own sessions"
  on public.triage_sessions for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users delete own sessions" on public.triage_sessions;
create policy "Users delete own sessions"
  on public.triage_sessions for delete
  using (auth.uid() = user_id);
```

Run in Supabase SQL editor → verify in Table Editor that every column exists.

#### 8.2 Centralized data access layer (Hour 22:35–22:55)

Every page reads/writes through `src/lib/db/queries.ts`. **No page component should call `supabase.from()` directly.** This makes it trivial to add caching, logging, or swap the DB later.

Create `src/lib/db/queries.ts`:

```typescript
import { createSupabaseServer } from "./supabase-server";
import { supabaseAdmin } from "./supabase-admin";
import type { TriageSession, FamilyMember, Profile, Report } from "@/lib/triage/types";

// ─── SESSIONS ────────────────────────────────────────────────
export async function getRecentSessions(userId: string, limit = 5) {
  const sb = await createSupabaseServer();
  const { data, error } = await sb
    .from("triage_sessions")
    .select("id, title, symptoms_summary, final_severity, created_at, patient_name, status")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`getRecentSessions: ${error.message}`);
  return data ?? [];
}

export async function getAllSessions(
  userId: string,
  filters: { severity?: string; from?: string; to?: string; q?: string } = {}
) {
  const sb = await createSupabaseServer();
  let query = sb
    .from("triage_sessions")
    .select("*")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (filters.severity) query = query.eq("final_severity", filters.severity);
  if (filters.from) query = query.gte("created_at", filters.from);
  if (filters.to) query = query.lte("created_at", filters.to);
  if (filters.q) query = query.ilike("symptoms_summary", `%${filters.q}%`);

  const { data, error } = await query;
  if (error) throw new Error(`getAllSessions: ${error.message}`);
  return data ?? [];
}

export async function getSessionById(userId: string, sessionId: string) {
  const sb = await createSupabaseServer();
  const { data, error } = await sb
    .from("triage_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .single();
  if (error) throw new Error(`getSessionById: ${error.message}`);
  return data;
}

export async function softDeleteSession(userId: string, sessionId: string) {
  const sb = await createSupabaseServer();
  const { error } = await sb
    .from("triage_sessions")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", sessionId)
    .eq("user_id", userId);
  if (error) throw new Error(`softDeleteSession: ${error.message}`);
}

// ─── FAMILY ──────────────────────────────────────────────────
export async function listFamilyMembers(userId: string) {
  const sb = await createSupabaseServer();
  const { data, error } = await sb
    .from("family_members")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });
  if (error) throw new Error(`listFamilyMembers: ${error.message}`);
  return data ?? [];
}

export async function upsertFamilyMember(
  userId: string,
  member: Partial<FamilyMember> & { nickname: string }
) {
  const sb = await createSupabaseServer();
  const payload = { ...member, user_id: userId };
  const { data, error } = await sb
    .from("family_members")
    .upsert(payload)
    .select()
    .single();
  if (error) throw new Error(`upsertFamilyMember: ${error.message}`);
  return data;
}

export async function deleteFamilyMember(userId: string, memberId: string) {
  const sb = await createSupabaseServer();
  const { error } = await sb
    .from("family_members")
    .delete()
    .eq("id", memberId)
    .eq("user_id", userId);
  if (error) throw new Error(`deleteFamilyMember: ${error.message}`);
}

// ─── REPORTS ─────────────────────────────────────────────────
export async function listReports(userId: string) {
  const sb = await createSupabaseServer();
  const { data, error } = await sb
    .from("reports")
    .select("*, triage_sessions(symptoms_summary, final_severity, created_at)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`listReports: ${error.message}`);
  return data ?? [];
}

export async function saveReport(userId: string, sessionId: string, title: string) {
  const sb = await createSupabaseServer();
  const { data, error } = await sb
    .from("reports")
    .upsert({ user_id: userId, session_id: sessionId, title })
    .select()
    .single();
  if (error) throw new Error(`saveReport: ${error.message}`);
  return data;
}

export async function deleteReport(userId: string, reportId: string) {
  const sb = await createSupabaseServer();
  const { error } = await sb
    .from("reports")
    .delete()
    .eq("id", reportId)
    .eq("user_id", userId);
  if (error) throw new Error(`deleteReport: ${error.message}`);
}

// ─── PROFILE / SETTINGS ──────────────────────────────────────
export async function getProfile(userId: string) {
  const sb = await createSupabaseServer();
  const { data, error } = await sb
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw new Error(`getProfile: ${error.message}`);
  return data;
}

export async function updateProfile(userId: string, patch: Partial<Profile>) {
  const sb = await createSupabaseServer();
  const { data, error } = await sb
    .from("profiles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .select()
    .single();
  if (error) throw new Error(`updateProfile: ${error.message}`);
  return data;
}

// ─── INSIGHTS ────────────────────────────────────────────────
export async function computeInsights(userId: string) {
  const sb = await createSupabaseServer();
  const { data: sessions, error } = await sb
    .from("triage_sessions")
    .select("final_severity, created_at, symptoms_summary, language")
    .eq("user_id", userId)
    .is("deleted_at", null)
    .not("final_severity", "is", null);
  if (error) throw new Error(`computeInsights: ${error.message}`);

  const all = sessions ?? [];
  const total = all.length;
  const severityCounts = all.reduce<Record<string, number>>((acc, s) => {
    if (s.final_severity) acc[s.final_severity] = (acc[s.final_severity] ?? 0) + 1;
    return acc;
  }, {});

  // Bucket by month, last 6 months
  const byMonth: Record<string, number> = {};
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    byMonth[key] = 0;
  }
  for (const s of all) {
    const d = new Date(s.created_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (key in byMonth) byMonth[key]++;
  }

  // Top symptom keywords (very simple — split on whitespace, count)
  const stop = new Set(["the", "a", "i", "have", "and", "to", "of", "for", "is", "in", "with"]);
  const wordCounts: Record<string, number> = {};
  for (const s of all) {
    if (!s.symptoms_summary) continue;
    for (const w of s.symptoms_summary.toLowerCase().split(/\W+/)) {
      if (w.length < 4 || stop.has(w)) continue;
      wordCounts[w] = (wordCounts[w] ?? 0) + 1;
    }
  }
  const topSymptoms = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word, count]) => ({ word, count }));

  return { total, severityCounts, byMonth, topSymptoms };
}

// ─── ACTIVITY LOG (fire-and-forget) ──────────────────────────
export async function logActivity(
  userId: string | null,
  action: string,
  entityType?: string,
  entityId?: string,
  metadata: Record<string, unknown> = {}
) {
  if (!userId) return;
  try {
    await supabaseAdmin.from("activity_log").insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata,
    });
  } catch {
    // Logging must never break the request
  }
}
```

#### 8.3 Persist EVERY triage interaction (Hour 22:55–23:10)

Today the `/api/triage` route returns Claude's answer but doesn't always save the full conversation. Fix this so **every message exchange is in the DB**.

In `src/app/api/triage/route.ts`, ensure the following happens for each request:

```typescript
// Pseudocode for the POST handler — adapt to your existing structure.

const { sessionId, message, language, familyMemberId } = parsed.data;
const user = await getUser();             // null if anonymous
const anonId = user ? null : await getOrCreateAnonId();

// 1. Load or create the session row FIRST
let session;
if (sessionId) {
  session = await getSessionById(user!.id, sessionId);
} else {
  const { data, error } = await supabaseAdmin
    .from("triage_sessions")
    .insert({
      user_id: user?.id ?? null,
      anonymous_id: anonId,
      language,
      family_member_id: familyMemberId ?? null,
      conversation: [],
      status: "in_progress",
      symptoms_summary: message.slice(0, 140),
      title: message.slice(0, 60),
    })
    .select()
    .single();
  if (error) throw error;
  session = data;
}

// 2. Append user message to conversation
const updatedConv = [
  ...(session.conversation ?? []),
  { role: "user", content: message, ts: new Date().toISOString() },
];

// 3. Call Claude
const aiResult = await analyzeSymptoms({
  conversation: updatedConv,
  language,
  familyMember: familyMemberId ? await getFamilyMember(user!.id, familyMemberId) : null,
});

// 4. Append assistant response
const finalConv = [
  ...updatedConv,
  { role: "assistant", content: aiResult.message, ts: new Date().toISOString() },
];

// 5. Persist EVERYTHING — this is the key step
await supabaseAdmin
  .from("triage_sessions")
  .update({
    conversation: finalConv,
    last_message_at: new Date().toISOString(),
    message_count: finalConv.length,
    final_severity: aiResult.severity ?? session.final_severity,
    red_flags: aiResult.redFlags ?? session.red_flags,
    doctor_summary: aiResult.doctorSummary ?? session.doctor_summary,
    status: aiResult.action === "triage" ? "completed" : "in_progress",
  })
  .eq("id", session.id);

// 6. Log activity (best-effort)
await logActivity(user?.id ?? null, "session.message", "session", session.id, {
  severity: aiResult.severity,
});

return NextResponse.json({ ok: true, data: { sessionId: session.id, ...aiResult } });
```

**Verify in Supabase Table Editor:** after sending a few messages, the `conversation` column should be a growing JSONB array. If it isn't, the rest of Phase 8 won't work.

#### 8.4 Wire each dashboard page (Hour 23:10–23:40)

Replace mocks/stubs with real queries. Each page becomes a Server Component that fetches data, with a Client Component child for interactions.

##### `/dashboard` (home)

```typescript
// src/app/(dashboard)/dashboard/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/db/supabase-server";
import { getRecentSessions, getProfile } from "@/lib/db/queries";
import { RecentChecks } from "@/components/dashboard/RecentChecks";
import { WelcomeCard } from "@/components/dashboard/WelcomeCard";
import { NewCheckCTA } from "@/components/dashboard/NewCheckCTA";

export default async function DashboardHome() {
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  const [profile, recent] = await Promise.all([
    getProfile(user.id),
    getRecentSessions(user.id, 3),
  ]);

  return (
    <div className="space-y-6">
      <WelcomeCard name={profile?.full_name ?? user.email ?? "there"} />
      <NewCheckCTA />
      <RecentChecks sessions={recent} />
    </div>
  );
}
```

##### `/dashboard/history`

```typescript
// src/app/(dashboard)/dashboard/history/page.tsx
import { Suspense } from "react";
import { createSupabaseServer } from "@/lib/db/supabase-server";
import { getAllSessions } from "@/lib/db/queries";
import { HistoryFilters } from "@/components/dashboard/HistoryFilters";
import { HistoryList } from "@/components/dashboard/HistoryList";
import { HistoryEmptyState } from "@/components/dashboard/HistoryEmptyState";

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function HistoryPage({ searchParams }: Props) {
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const params = await searchParams;

  const sessions = await getAllSessions(user!.id, {
    severity: params.severity,
    from: params.from,
    to: params.to,
    q: params.q,
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Your History</h1>
      <HistoryFilters />
      <Suspense fallback={<div>Loading...</div>}>
        {sessions.length === 0 ? <HistoryEmptyState /> : <HistoryList sessions={sessions} />}
      </Suspense>
    </div>
  );
}
```

`HistoryList` is a Client Component that handles row click → `/dashboard/check/[id]`, and per-row delete via Server Action.

##### `/dashboard/check/[id]` — read-only past session

```typescript
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/db/supabase-server";
import { getSessionById } from "@/lib/db/queries";
import { SessionTranscript } from "@/components/dashboard/SessionTranscript";
import { SeverityResult } from "@/components/triage/SeverityResult";
import { DownloadPDFButton } from "@/components/dashboard/DownloadPDFButton";
import { SaveAsReportButton } from "@/components/dashboard/SaveAsReportButton";

export default async function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();

  let session;
  try {
    session = await getSessionById(user!.id, id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <SeverityResult
        severity={session.final_severity}
        redFlags={session.red_flags}
        summary={session.doctor_summary}
      />
      <SessionTranscript conversation={session.conversation} />
      <div className="flex gap-3">
        <DownloadPDFButton sessionId={session.id} />
        <SaveAsReportButton sessionId={session.id} />
      </div>
    </div>
  );
}
```

##### `/dashboard/pdfs` (Reports)

```typescript
import { createSupabaseServer } from "@/lib/db/supabase-server";
import { listReports } from "@/lib/db/queries";
import { ReportsGrid } from "@/components/dashboard/ReportsGrid";
import { ReportsEmptyState } from "@/components/dashboard/ReportsEmptyState";

export default async function ReportsPage() {
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const reports = await listReports(user!.id);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reports</h1>
      <p className="text-sm text-gray-600">
        Saved triages you can share with your doctor.
      </p>
      {reports.length === 0 ? <ReportsEmptyState /> : <ReportsGrid reports={reports} />}
    </div>
  );
}
```

The "Save as Report" action on a session detail page calls a Server Action that writes to the `reports` table; the Reports page renders cards with "Download PDF" and "Delete" buttons.

##### `/dashboard/family`

```typescript
import { createSupabaseServer } from "@/lib/db/supabase-server";
import { listFamilyMembers } from "@/lib/db/queries";
import { FamilyManager } from "@/components/dashboard/FamilyManager";

export default async function FamilyPage() {
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const members = await listFamilyMembers(user!.id);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Family Members</h1>
      <p className="text-sm text-gray-600">
        Add people you triage for. Their age and conditions help the AI give safer guidance.
      </p>
      <FamilyManager initialMembers={members} />
    </div>
  );
}
```

`FamilyManager` is a Client Component using `useOptimistic` for snappy add/edit/remove. All mutations go through Server Actions in `src/lib/family/actions.ts`.

##### `/dashboard/insights`

```typescript
import { createSupabaseServer } from "@/lib/db/supabase-server";
import { computeInsights } from "@/lib/db/queries";
import { InsightsDashboard } from "@/components/dashboard/InsightsDashboard";
import { InsightsEmptyState } from "@/components/dashboard/InsightsEmptyState";

export default async function InsightsPage() {
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const insights = await computeInsights(user!.id);

  if (insights.total < 3) return <InsightsEmptyState count={insights.total} />;
  return <InsightsDashboard insights={insights} />;
}
```

`InsightsDashboard` uses `recharts`: severity donut, monthly bar chart, top-symptoms list. Pure presentational — all calc in `computeInsights`.

##### `/dashboard/settings`

```typescript
import { createSupabaseServer } from "@/lib/db/supabase-server";
import { getProfile } from "@/lib/db/queries";
import { SettingsForm } from "@/components/dashboard/SettingsForm";
import { DangerZone } from "@/components/dashboard/DangerZone";

export default async function SettingsPage() {
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  const profile = await getProfile(user!.id);

  return (
    <div className="space-y-8 max-w-2xl">
      <section>
        <h1 className="text-2xl font-bold">Settings</h1>
        <SettingsForm profile={profile} email={user!.email!} />
      </section>
      <DangerZone />
    </div>
  );
}
```

`SettingsForm` posts to `updateProfileAction` (server action) — fields: full name, preferred language, timezone, email notifications. `DangerZone` has "Delete all my data" and "Delete account" — both wired to actions that soft-delete then sign out.

#### 8.5 Server Actions for mutations (Hour 23:40–23:50)

Create `src/lib/dashboard/actions.ts`:

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createSupabaseServer } from "@/lib/db/supabase-server";
import {
  upsertFamilyMember,
  deleteFamilyMember,
  saveReport,
  deleteReport,
  softDeleteSession,
  updateProfile,
  logActivity,
} from "@/lib/db/queries";

async function requireUser() {
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  return user;
}

const FamilySchema = z.object({
  id: z.string().uuid().optional(),
  nickname: z.string().min(1).max(40),
  relation: z.string().max(40).optional(),
  age_band: z.enum(["child", "teen", "adult", "elderly"]),
  known_conditions: z.string().max(500).optional(),
});

export async function saveFamilyMemberAction(formData: FormData) {
  const user = await requireUser();
  const parsed = FamilySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Invalid input" };
  const member = await upsertFamilyMember(user.id, parsed.data);
  await logActivity(user.id, "family.upsert", "family_member", member.id);
  revalidatePath("/dashboard/family");
  return { ok: true, data: member };
}

export async function deleteFamilyMemberAction(memberId: string) {
  const user = await requireUser();
  await deleteFamilyMember(user.id, memberId);
  await logActivity(user.id, "family.delete", "family_member", memberId);
  revalidatePath("/dashboard/family");
  return { ok: true };
}

export async function saveAsReportAction(sessionId: string, title: string) {
  const user = await requireUser();
  const report = await saveReport(user.id, sessionId, title);
  await logActivity(user.id, "report.save", "report", report.id);
  revalidatePath("/dashboard/pdfs");
  return { ok: true, data: report };
}

export async function deleteReportAction(reportId: string) {
  const user = await requireUser();
  await deleteReport(user.id, reportId);
  revalidatePath("/dashboard/pdfs");
  return { ok: true };
}

export async function deleteSessionAction(sessionId: string) {
  const user = await requireUser();
  await softDeleteSession(user.id, sessionId);
  await logActivity(user.id, "session.delete", "session", sessionId);
  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard");
  return { ok: true };
}

const ProfileSchema = z.object({
  full_name: z.string().max(80).optional(),
  preferred_language: z.enum(["English", "Hindi", "Gujarati", "Marathi"]),
  timezone: z.string().max(60).optional(),
  notification_email: z.preprocess((v) => v === "on" || v === true, z.boolean()),
});

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();
  const parsed = ProfileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Invalid settings" };
  await updateProfile(user.id, parsed.data);
  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}
```

**Always**:
- Validate with Zod at the top of every action.
- Call `requireUser()` first.
- Call `revalidatePath` for every page that reads the changed data.
- Return `{ ok, error?, data? }` — never throw to the client.

#### 8.6 Loading + error + empty states (Hour 23:50–23:55)

Each dashboard route gets:
- `loading.tsx` — skeleton matching final layout
- `error.tsx` — friendly retry UI
- An empty state component when the query returns 0 rows

Example `src/app/(dashboard)/dashboard/history/loading.tsx`:

```typescript
export default function HistoryLoading() {
  return (
    <div className="space-y-3 animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-20 bg-gray-100 rounded-lg" />
      ))}
    </div>
  );
}
```

Empty states matter — they're how a judge with a fresh account experiences the product. Use friendly copy + a CTA:

> *"No checks yet. Your first triage will appear here. → Start a check"*

#### 8.7 End-to-end smoke test (Hour 23:55–24:00)

Run this exact sequence in incognito, on a real phone if possible:

1. Sign up with a fresh email
2. Navigate to `/dashboard` → see welcome card, empty recent checks
3. Click "New Check" → run a full triage to completion
4. Return to `/dashboard` → the just-completed check appears in Recent
5. `/dashboard/history` → same check listed; click it → full transcript + result
6. Click "Save as Report" → confirm → `/dashboard/pdfs` shows it
7. Click "Download PDF" → PDF renders with the conversation
8. `/dashboard/family` → add "Mom (elderly)" → returns to list with the new member
9. Run another check → pick "Mom" as the patient → verify the saved session has `family_member_id` populated in DB
10. `/dashboard/insights` → with 2 sessions still shows empty state ("unlock at 3"); add one more, refresh, charts render
11. `/dashboard/settings` → change language to Hindi → save → reload → still Hindi
12. Sign out → try `/dashboard` → redirected to `/login` ✓

If any step fails, fix it before submitting. **A broken page judges click into is worse than a missing feature.**

#### 8.8 Final commit

```bash
git add .
git commit -m "feat: phase 8 — full dashboard functionality with database persistence

- migration 0003: reports, insights cache, activity log, soft delete, status
- centralized data access layer (src/lib/db/queries.ts)
- every triage interaction persisted to triage_sessions.conversation
- /dashboard, /history, /check/[id], /pdfs, /family, /insights, /settings all wired to real data
- server actions for all mutations with zod validation
- loading + error + empty states for every route
- activity log for audit trail
- full smoke test passing"
git push
```

**Phase 8 done.** Every page is real. Every interaction persists. Empty states are intentional. The product is no longer a demo.

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
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── try/page.tsx
│   │   │   ├── about/page.tsx
│   │   │   └── privacy/page.tsx
│   │   ├── (dashboard)/              # Auth-required routes
│   │   │   ├── layout.tsx
│   │   │   └── dashboard/
│   │   │       ├── page.tsx          # Dashboard home (real data)
│   │   │       ├── loading.tsx
│   │   │       ├── error.tsx
│   │   │       ├── new/page.tsx
│   │   │       ├── check/[id]/
│   │   │       │   ├── page.tsx      # Read-only past session
│   │   │       │   ├── loading.tsx
│   │   │       │   └── not-found.tsx
│   │   │       ├── history/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── loading.tsx
│   │   │       │   └── error.tsx
│   │   │       ├── pdfs/
│   │   │       │   ├── page.tsx      # Reports
│   │   │       │   └── loading.tsx
│   │   │       ├── family/
│   │   │       │   ├── page.tsx
│   │   │       │   └── loading.tsx
│   │   │       ├── insights/
│   │   │       │   ├── page.tsx
│   │   │       │   └── loading.tsx
│   │   │       └── settings/
│   │   │           └── page.tsx
│   │   ├── auth/callback/route.ts
│   │   ├── api/
│   │   │   ├── triage/route.ts
│   │   │   ├── sessions/[id]/route.ts
│   │   │   └── pdf/[id]/route.ts     # PDF generation endpoint
│   │   ├── layout.tsx
│   │   ├── globals.css
│   │   └── error.tsx
│   ├── middleware.ts
│   ├── components/
│   │   ├── ui/                       # Primitives
│   │   ├── landing/                  # Landing page sections
│   │   ├── auth/                     # LoginForm, SignupForm, SignupWall
│   │   ├── dashboard/                # NEW — many components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MobileTabBar.tsx
│   │   │   ├── UserMenu.tsx
│   │   │   ├── WelcomeCard.tsx
│   │   │   ├── NewCheckCTA.tsx
│   │   │   ├── RecentChecks.tsx
│   │   │   ├── HistoryList.tsx
│   │   │   ├── HistoryFilters.tsx
│   │   │   ├── HistoryEmptyState.tsx
│   │   │   ├── SessionTranscript.tsx
│   │   │   ├── DownloadPDFButton.tsx
│   │   │   ├── SaveAsReportButton.tsx
│   │   │   ├── ReportsGrid.tsx
│   │   │   ├── ReportsEmptyState.tsx
│   │   │   ├── FamilyManager.tsx
│   │   │   ├── FamilyMemberPicker.tsx
│   │   │   ├── InsightsDashboard.tsx
│   │   │   ├── InsightsEmptyState.tsx
│   │   │   ├── SettingsForm.tsx
│   │   │   └── DangerZone.tsx
│   │   ├── triage/                   # TriageChat, SeverityResult, EmergencyScreen
│   │   └── shared/
│   ├── lib/
│   │   ├── auth/                     # actions, get-user, anon-id
│   │   ├── ai/                       # anthropic-client, prompts
│   │   ├── triage/                   # schema, types, red-flags, severity
│   │   ├── db/
│   │   │   ├── supabase-server.ts
│   │   │   ├── supabase-client.ts
│   │   │   ├── supabase-admin.ts
│   │   │   └── queries.ts            # ← ALL DB queries live here
│   │   ├── dashboard/
│   │   │   └── actions.ts            # ← ALL dashboard server actions
│   │   ├── i18n/translations.ts
│   │   ├── hooks/
│   │   ├── pdf/
│   │   │   └── DoctorSummaryPDF.tsx
│   │   └── utils/
│   └── styles/tokens.css
├── supabase/
│   └── migrations/
│       ├── 0001_initial.sql
│       ├── 0002_auth_and_anon.sql
│       └── 0003_dashboard_completeness.sql   # NEW
├── PHASE_8_AUDIT.md                  # checklist from 8.0
├── .env.example
├── .env.local
├── next.config.js
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## 6. Database Schema

### Migration order

1. `0001_initial.sql` — `triage_sessions`, `rate_limits` (existing)
2. `0002_auth_and_anon.sql` — `profiles`, `family_members`, `anonymous_checks`, sessions FK to family (existing)
3. `0003_dashboard_completeness.sql` — `reports`, `insights_cache`, `activity_log`, sessions extensions (NEW — see 8.1)

### Final ERD (after Phase 8)

```
auth.users
   │
   ├──< profiles                  (1:1, extended on signup)
   ├──< family_members            (1:many)
   ├──< triage_sessions           (1:many; also links to family_members)
   ├──< reports                   (1:many; references triage_sessions)
   ├──< insights_cache            (1:1, optional)
   └──< activity_log              (1:many)

anonymous_checks   (keyed by anon_id cookie; references triage_sessions)
rate_limits        (keyed by IP/user)
```

Every user-owned table has RLS enabled with policies restricting access to `auth.uid()`.

---

## 7. Claude API Integration

Existing Phase 2 implementation. Phase 8 addition: `/api/triage` now ALSO writes the full conversation back to `triage_sessions.conversation` on every turn — see Section 8.3.

---

## 8. Full Dashboard Functionality & Data Persistence

**See the detailed Phase 8 in Section 4 above.**

Headline summary of what this phase delivers:

- **Migration `0003_dashboard_completeness.sql`** — adds `reports`, `insights_cache`, `activity_log`, soft delete, session status, denormalized title/summary fields.
- **Centralized data access** in `src/lib/db/queries.ts` — every page calls these functions; no scattered Supabase calls.
- **Centralized mutations** in `src/lib/dashboard/actions.ts` — Server Actions with Zod validation, auth check, revalidation.
- **Every triage exchange persists** — full `conversation` JSONB array updated on each Claude turn.
- **Every dashboard page is wired**: Dashboard home, History (with filters), Session Detail, Reports, Family (CRUD), Insights (computed from real sessions), Settings (profile + danger zone).
- **Loading + error + empty states** for every route.
- **Activity log** for audit trail.
- **End-to-end smoke test** (12 steps) to verify everything before submission.

---

## 9. System Prompt Design

(Same as Phase 2. One small Phase 5 addition: inject `Patient context` block when `family_member_id` is attached. See original Section 8.)

---

## 10. Landing Page, Auth & Dashboard

(Same as original Section 9 — landing page spec, Supabase clients, middleware, auth server actions, anonymous trial gate, dashboard layout shell.)

---

## 11. Frontend Implementation

(Same as original Section 10 — `TriageChat`, `MessageBubble`, `SeverityResult`, `EmergencyScreen`. The triage flow is now backed by Phase 8's persistence layer.)

---

## 12. Killer Features Implementation

### 12.1 Voice input hook

(Same as original — `src/lib/hooks/useSpeechRecognition.ts`.)

### 12.2 Emergency screen

(Same — overrides everything including the signup wall. Safety > conversion.)

### 12.3 PDF export

After Phase 8, PDFs are generated from real session data:

```typescript
// src/app/api/pdf/[id]/route.ts
import { renderToStream } from "@react-pdf/renderer";
import { createSupabaseServer } from "@/lib/db/supabase-server";
import { getSessionById } from "@/lib/db/queries";
import { DoctorSummaryPDF } from "@/lib/pdf/DoctorSummaryPDF";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sb = await createSupabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const session = await getSessionById(user.id, id);
  const stream = await renderToStream(<DoctorSummaryPDF session={session} />);
  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="triage-${id.slice(0, 8)}.pdf"`,
    },
  });
}
```

The "Download PDF" button on the session detail and reports pages just navigates to `/api/pdf/[id]`.

---

## 13. Deployment

(Same as original Section 12. After running the new migration on production Supabase, redeploy Vercel and re-test the 12-step smoke test from 8.7 on the production URL.)

### Pre-deployment checklist (updated)

- [ ] Migrations 0001, 0002, **0003** all applied to production Supabase
- [ ] All `console.log` removed from production code
- [ ] No hardcoded API keys
- [ ] Auth redirect URLs match production in both Supabase + Google Console
- [ ] **Phase 8 smoke test passes on production URL** (not just localhost)

---

## 14. Demo Video Script

(Same as original Section 13, with one addition for Phase 8.)

Add to **2:45–3:15 — Dashboard tour** segment:

> "Notice every page here is real — History pulls from Postgres with RLS, Reports lets me save and download PDFs of past triages, Family lets me add my mom and run age-appropriate checks for her, and Insights aggregates my own data into trends. Nothing here is mocked. This is what the product looks like after a month of use, in 24 hours."

This sentence wins points on **"Product, not Demo"** — explicitly call it out.

---

## 15. Submission Checklist

(Same as original Section 14, with new tests.)

### Phase 8 verification (must pass before submitting)

- [ ] Sign up fresh → dashboard loads → empty state visible everywhere appropriate
- [ ] Run a triage → it appears in Recent Checks AND History within 1 second
- [ ] Open a past session → full conversation transcript renders
- [ ] Save as Report → appears in Reports
- [ ] Download PDF → opens with real session data
- [ ] Add family member → appears in list and in member picker on `/dashboard/new`
- [ ] Triage for family member → session has `family_member_id` set in DB
- [ ] Insights page shows empty state under 3 sessions, real charts at ≥3
- [ ] Update profile → reload → changes persisted
- [ ] Soft-delete a session → disappears from History but row still in DB (deleted_at set)
- [ ] Sign out → all `/dashboard/*` routes redirect to `/login`

---

## 16. Common Pitfalls & Fixes

(All original pitfalls retained. New Phase 8 additions:)

### Conversation column stays empty after sending messages

- Symptom: Sessions have rows but `conversation` JSONB is `[]`
- Fix: The API route is returning before the `update` call. Make sure the `supabaseAdmin.from("triage_sessions").update(...)` is `await`-ed and runs AFTER Claude responds, BEFORE the response is sent.

### Reports page is empty even after saving

- Symptom: `saveAsReportAction` succeeds but Reports list is stale
- Fix: Missing `revalidatePath("/dashboard/pdfs")` in the action. Server Components cache by default; you must invalidate.

### `useOptimistic` resets on every keystroke

- Symptom: Family member form flickers as you type
- Fix: Don't put `useOptimistic` on the input itself. Wrap only the LIST that displays members. Forms own their own state via `useState`.

### Insights page crashes with no sessions

- Symptom: Division by zero or empty array errors in chart
- Fix: Always check `insights.total < 3` and return `<InsightsEmptyState />` first. Charts should never receive empty data.

### RLS blocks reads after signup

- Symptom: Brand-new user sees their own session as 0 rows
- Fix: Verify `auth.uid()` matches `user_id` on the row. The `handle_new_user` trigger and the API route insert must both use the SAME user id. If using `supabaseAdmin` for inserts, explicitly set `user_id = user.id` from the SSR client.

### Soft-deleted sessions still appear

- Symptom: Deleted sessions reappear after a refresh
- Fix: Every query that lists sessions must include `.is("deleted_at", null)`. The index `idx_sessions_not_deleted` enforces this is fast.

### Activity log fills up fast

- Symptom: `activity_log` has thousands of rows in dev
- Fix: Expected — it's an audit log. Add a Supabase scheduled function later to prune > 90 days. For hackathon, ignore.

### Server action returns but UI doesn't update

- Symptom: Add family member, list doesn't change until manual refresh
- Fix: Either (a) call `revalidatePath` in the action and let the Server Component re-render, OR (b) use `useOptimistic` + `useTransition` in the Client Component. Don't try to do both — pick one pattern per surface.

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
8. **The landing page sells the product. The dashboard proves it's real. Phase 8 makes the dashboard real.** Skipping Phase 8 = your product looks like a demo. Doing Phase 8 = your product looks like a startup.

You're solving a real problem with real impact. Ship it.

Good luck. 🚀