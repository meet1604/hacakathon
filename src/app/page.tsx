import Link from "next/link";
import type { Metadata } from "next";
import { AnimateIn, StaggerIn, StaggerChild } from "@/components/landing/AnimateIn";

export const metadata: Metadata = {
  title: "MediTriage — AI Symptom Pre-Screener",
  description:
    "Describe your symptoms in plain language and get trusted care guidance in seconds — in your language, any time, anywhere.",
};

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-bg">
      {/* ── Sticky nav ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 md:px-10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-primary font-serif text-[16px] font-bold text-white shadow-sm">
              M
            </div>
            <span className="text-[16px] font-semibold tracking-[-0.4px] text-text-1">
              MediTriage
            </span>
          </div>

          <nav className="hidden items-center gap-0.5 md:flex" aria-label="Main navigation">
            {[
              { href: "#features", label: "Features" },
              { href: "#how-it-works", label: "How it works" },
              { href: "#outcomes", label: "Outcomes" },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="rounded-lg px-3 py-1.5 text-[14px] font-medium text-text-2 transition-colors hover:bg-bg-tint hover:text-text-1"
              >
                {label}
              </a>
            ))}
          </nav>

          <nav className="flex items-center gap-2" aria-label="Auth navigation">
            <Link
              href="/login"
              className="hidden rounded-xl px-3 py-2 text-[14px] font-medium text-text-2 transition-colors hover:bg-bg-tint hover:text-text-1 sm:block"
            >
              Sign in
            </Link>
            <Link
              href="/try"
              className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-[14px] font-semibold text-white shadow-sm transition-all hover:bg-primary-dark active:scale-[.98]"
            >
              Try free →
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Background gradient orbs */}
          <div
            className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
            aria-hidden="true"
          >
            <div className="absolute -top-32 left-1/3 h-[640px] w-[640px] rounded-full bg-primary/7 blur-[100px]" />
            <div className="absolute bottom-0 right-0 h-[480px] w-[560px] rounded-full bg-accent/12 blur-[90px]" />
          </div>

          <div className="mx-auto max-w-7xl px-6 pb-16 pt-16 md:px-10 md:pb-24 md:pt-20">
            <div className="flex flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
              {/* Left: copy */}
              <AnimateIn className="flex-1" delay={0.05}>
                <div className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-light px-3.5 py-1.5 text-[12px] font-semibold text-caution">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  AI-powered · Free · Private
                </div>

                <h1 className="font-serif text-[44px] leading-[1.13] tracking-[-0.5px] text-text-1 md:text-[56px] lg:text-[62px]">
                  Know when to
                  <br />
                  seek{" "}
                  <em className="text-primary">
                    care that
                    <br />
                    counts.
                  </em>
                </h1>

                <p className="mt-5 max-w-lg text-[17px] leading-[1.65] text-text-2 md:text-[18px]">
                  Describe your symptoms in plain language — Hindi, Tamil, or
                  English — and get trusted guidance in seconds. Day or night,
                  any device.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/try"
                    className="flex min-h-[52px] items-center gap-2 rounded-xl bg-primary px-7 text-[16px] font-semibold text-white shadow-md transition-all hover:-translate-y-px hover:bg-primary-dark hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  >
                    <svg
                      width="17"
                      height="17"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                    </svg>
                    Try a free check
                  </Link>
                  <Link
                    href="/signup"
                    className="flex min-h-[52px] items-center gap-2 rounded-xl border border-border bg-surface px-7 text-[16px] font-semibold text-text-1 shadow-sm transition-all hover:border-border-strong hover:shadow-md"
                  >
                    Sign up free
                  </Link>
                </div>

                <p className="mt-3 text-[13px] text-text-3">
                  No login for first check · हिंदी, ગુજરાતી, मराठी supported
                </p>

                <div
                  className="mt-6 flex flex-wrap gap-2"
                  aria-label="Trust indicators"
                >
                  {[
                    {
                      label: "HIPAA-safe",
                      icon: (
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      ),
                    },
                    {
                      label: "Works offline",
                      icon: (
                        <>
                          <path d="M5 12.55a11 11 0 0 1 14.08 0" />
                          <path d="M1.42 9a16 16 0 0 1 21.16 0" />
                          <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                          <line x1="12" y1="20" x2="12.01" y2="20" />
                        </>
                      ),
                    },
                    {
                      label: "4.8 · 12k reviews",
                      icon: (
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      ),
                    },
                  ].map(({ label, icon }) => (
                    <div
                      key={label}
                      className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] font-medium text-text-2 shadow-sm"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-primary"
                        aria-hidden="true"
                      >
                        {icon}
                      </svg>
                      {label}
                    </div>
                  ))}
                </div>
              </AnimateIn>

              {/* Right: desktop app mockup */}
              <AnimateIn className="flex flex-1 justify-center lg:justify-end" delay={0.15} direction="none">
                <DesktopMockup />
              </AnimateIn>
            </div>
          </div>
        </section>

        {/* ── Stats bar ─────────────────────────────────────────────── */}
        <section
          className="border-y border-border bg-bg-tint"
          aria-label="Key statistics"
        >
          <div className="mx-auto max-w-7xl px-6 py-8 md:px-10">
            <StaggerIn className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {[
                { stat: "600M+", label: "Indians lack timely healthcare" },
                { stat: "30%", label: "of ER visits need only self-care" },
                { stat: "60s", label: "to a clear triage decision" },
                { stat: "4.8★", label: "from 12,000+ users" },
              ].map(({ stat, label }) => (
                <StaggerChild key={stat}>
                  <p className="font-serif text-[32px] leading-none text-primary md:text-[38px]">
                    {stat}
                  </p>
                  <p className="mt-2 text-[13px] leading-[1.45] text-text-2 md:text-[14px]">
                    {label}
                  </p>
                </StaggerChild>
              ))}
            </StaggerIn>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────── */}
        <section id="features" className="px-6 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12">
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[.08em] text-text-3">
                Features
              </p>
              <h2 className="font-serif text-[32px] text-text-1 md:text-[42px]">
                Built for real care decisions
              </h2>
              <p className="mt-3 max-w-lg text-[16px] leading-[1.6] text-text-2">
                MediTriage combines AI clinical reasoning with local language
                understanding so everyone can access informed care guidance.
              </p>
            </div>

            <StaggerIn className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon, title, desc, iconBg }) => (
                <StaggerChild key={title}>
                  <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md h-full">
                    <div
                      className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}
                    >
                      {icon}
                    </div>
                    <h3 className="text-[16px] font-semibold text-text-1">
                      {title}
                    </h3>
                    <p className="mt-2 text-[14px] leading-[1.6] text-text-2">
                      {desc}
                    </p>
                  </div>
                </StaggerChild>
              ))}
            </StaggerIn>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────────── */}
        <section
          id="how-it-works"
          className="border-y border-border bg-bg-tint px-6 py-16 md:px-10 md:py-24"
        >
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[.08em] text-text-3">
                How it works
              </p>
              <h2 className="font-serif text-[32px] text-text-1 md:text-[42px]">
                From symptoms to clarity
              </h2>
            </div>

            <div className="relative grid gap-10 md:grid-cols-3 md:gap-8">
              {/* Connecting line desktop */}
              <div
                className="absolute left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] top-5 hidden h-px bg-border md:block"
                aria-hidden="true"
              />

              {[
                {
                  n: "1",
                  label: "Describe your symptoms",
                  sub: "Type or speak in your language. No medical jargon needed — just tell MediTriage how you're feeling.",
                },
                {
                  n: "2",
                  label: "AI asks follow-ups",
                  sub: "Adaptive questions understand severity, duration, and context — like a doctor intake without the wait.",
                },
                {
                  n: "3",
                  label: "Get clear guidance",
                  sub: "Receive self-care steps, a clinic referral, or emergency action — clearly labelled, in your language.",
                },
              ].map(({ n, label, sub }, i) => (
                <AnimateIn
                  key={n}
                  className="flex flex-col items-center text-center md:items-start md:text-left"
                  delay={i * 0.1}
                >
                  <div className="relative z-10 mb-5 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-[15px] font-bold text-white shadow-sm">
                    {n}
                  </div>
                  <h3 className="text-[17px] font-semibold text-text-1">
                    {label}
                  </h3>
                  <p className="mt-2 text-[14px] leading-[1.65] text-text-2">
                    {sub}
                  </p>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── Severity outcomes ─────────────────────────────────────── */}
        <section id="outcomes" className="px-6 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-10">
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[.08em] text-text-3">
                Outcomes
              </p>
              <h2 className="font-serif text-[32px] text-text-1 md:text-[42px]">
                4 clear outcomes
              </h2>
              <p className="mt-3 max-w-lg text-[16px] leading-[1.6] text-text-2">
                Every triage session ends with one of four unambiguous verdicts
                — no vague &quot;it might be serious.&quot;
              </p>
            </div>

            <StaggerIn className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  n: "01",
                  label: "Emergency",
                  sub: "Call 108 now",
                  detail:
                    "Chest pain, stroke signs, severe breathing difficulty, or other life-threatening conditions.",
                  border: "border-emergency/25",
                  bg: "bg-emergency-bg",
                  text: "text-emergency",
                  dot: "bg-emergency",
                },
                {
                  n: "02",
                  label: "See doctor today",
                  sub: "Within 24 hours",
                  detail:
                    "Symptoms that need prompt medical attention but are not immediately life-threatening.",
                  border: "border-caution/25",
                  bg: "bg-caution-bg",
                  text: "text-caution",
                  dot: "bg-caution",
                },
                {
                  n: "03",
                  label: "See doctor soon",
                  sub: "Within a week",
                  detail:
                    "Persistent or worsening symptoms that a doctor should evaluate in the near term.",
                  border: "border-caution/15",
                  bg: "bg-caution-bg/50",
                  text: "text-caution",
                  dot: "bg-caution/60",
                },
                {
                  n: "04",
                  label: "Self-care",
                  sub: "Rest & monitor",
                  detail:
                    "Symptoms manageable at home with rest, fluids, and over-the-counter remedies.",
                  border: "border-selfcare/25",
                  bg: "bg-selfcare-bg",
                  text: "text-selfcare",
                  dot: "bg-selfcare",
                },
              ].map(({ n, label, sub, detail, border, bg, text, dot }) => (
                <StaggerChild key={label}>
                  <div className={`rounded-2xl border p-5 ${border} ${bg} h-full`}>
                    <div className="mb-3 flex items-start justify-between">
                      <div
                        className={`mt-1 h-2.5 w-2.5 rounded-full ${dot}`}
                        aria-hidden="true"
                      />
                      <span className="text-[11px] font-medium text-text-3">
                        {n}
                      </span>
                    </div>
                    <p className={`text-[16px] font-semibold ${text}`}>{label}</p>
                    <p className={`mt-0.5 text-[13px] font-medium opacity-70 ${text}`}>
                      {sub}
                    </p>
                    <p className="mt-3 text-[13px] leading-[1.55] text-text-2">
                      {detail}
                    </p>
                  </div>
                </StaggerChild>
              ))}
            </StaggerIn>
          </div>
        </section>

        {/* ── Testimonials ──────────────────────────────────────────── */}
        <section className="border-y border-border bg-bg-tint px-6 py-16 md:px-10 md:py-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12 text-center">
              <p className="mb-2 text-[12px] font-semibold uppercase tracking-[.08em] text-text-3">
                Stories
              </p>
              <h2 className="font-serif text-[32px] text-text-1 md:text-[42px]">
                Real families, real decisions
              </h2>
            </div>

            <StaggerIn className="grid gap-4 md:grid-cols-3">
              {[
                {
                  quote:
                    "My son had high fever at midnight. MediTriage said go to the ER immediately — he had severe dehydration. It saved us hours of delay.",
                  name: "Sunita R.",
                  loc: "Pune, Maharashtra",
                  initials: "SR",
                },
                {
                  quote:
                    "Used it for my father's chest pain. It flagged emergency instantly and walked us through calling for help. We didn't panic — we followed the steps.",
                  name: "Arjun K.",
                  loc: "Bangalore, Karnataka",
                  initials: "AK",
                },
                {
                  quote:
                    "I was worried about my headache for days. MediTriage reassured me it was tension and gave self-care tips. Saved me an unnecessary clinic visit.",
                  name: "Priya S.",
                  loc: "Chennai, Tamil Nadu",
                  initials: "PS",
                },
              ].map(({ quote, name, loc, initials }) => (
                <StaggerChild key={name}>
                  <figure className="rounded-2xl border border-border bg-surface p-6 shadow-sm h-full">
                    <blockquote className="text-[14px] leading-[1.7] text-text-2">
                      &ldquo;{quote}&rdquo;
                    </blockquote>
                    <figcaption className="mt-5 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-[13px] font-semibold text-primary">
                        {initials}
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-text-1">
                          {name}
                        </p>
                        <p className="text-[12px] text-text-3">{loc}</p>
                      </div>
                    </figcaption>
                  </figure>
                </StaggerChild>
              ))}
            </StaggerIn>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-primary px-6 py-16 text-center md:py-24">
          <div
            className="pointer-events-none absolute inset-0 overflow-hidden"
            aria-hidden="true"
          >
            <div className="absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/5 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-primary-dark/60 blur-2xl" />
          </div>

          <AnimateIn className="relative z-10">
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[.1em] text-white/55">
              Get started
            </p>
            <h2 className="font-serif text-[32px] text-white md:text-[48px]">
              Try your first check —
              <br className="hidden md:block" />
              no signup needed
            </h2>
            <p className="mt-4 text-[16px] text-white/70 md:text-[18px]">
              Instant AI-powered triage in your language, on any device.
            </p>
            <Link
              href="/try"
              className="mt-9 inline-flex min-h-[56px] items-center gap-2 rounded-xl bg-white px-10 text-[17px] font-semibold text-primary shadow-md transition-all hover:shadow-xl active:scale-[.98]"
            >
              Start free check →
            </Link>
            <p className="mt-5 text-[13px] text-white/50">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-white/75 underline underline-offset-2 hover:text-white"
              >
                Sign in
              </Link>
            </p>
          </AnimateIn>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-surface px-6 py-8 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center gap-6 md:flex-row md:justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-[7px] bg-primary font-serif text-[13px] font-bold text-white">
                M
              </div>
              <span className="text-[14px] font-semibold text-text-2">
                MediTriage
              </span>
            </div>

            <div className="flex gap-6">
              <Link
                href="/about"
                className="text-[13px] text-text-3 hover:text-text-2"
              >
                About
              </Link>
              <Link
                href="/privacy"
                className="text-[13px] text-text-3 hover:text-text-2"
              >
                Privacy
              </Link>
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-text-3 hover:text-text-2"
              >
                GitHub
              </a>
            </div>
          </div>
          <p className="mt-6 text-center text-[12px] leading-[1.65] text-text-3 md:text-left">
            MediTriage provides informational guidance only and is not a
            substitute for professional medical advice, diagnosis, or treatment.
            Always consult a qualified healthcare provider. In an emergency,
            call 108.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ── Desktop browser app mockup ─────────────────────────────────────
function DesktopMockup() {
  return (
    <div
      className="animate-float relative w-full max-w-[580px] lg:max-w-[640px]"
      aria-hidden="true"
      role="presentation"
    >
      {/* Glow orbs behind the window */}
      <div className="absolute -bottom-8 -right-8 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -top-8 -left-8 h-56 w-56 rounded-full bg-accent/15 blur-2xl" />

      {/* Browser window frame */}
      <div className="relative overflow-hidden rounded-[16px] border border-border bg-bg shadow-xl">
        {/* Chrome bar */}
        <div className="flex items-center gap-3 border-b border-border bg-bg-tint px-4 py-3">
          <div className="flex gap-1.5" aria-hidden="true">
            <div className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <div className="h-3 w-3 rounded-full bg-[#FFBD2E]" />
            <div className="h-3 w-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="flex flex-1 items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-[11px] text-text-3">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            meditriage.app/check
          </div>
        </div>

        {/* App UI */}
        <div className="flex" style={{ height: "390px" }}>
          {/* Sidebar */}
          <div className="w-44 shrink-0 border-r border-border bg-surface px-3 py-4">
            <div className="mb-5 flex items-center gap-1.5 px-1">
              <div className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-primary font-serif text-[11px] font-bold text-white">
                M
              </div>
              <span className="text-[12px] font-semibold text-text-1">
                MediTriage
              </span>
            </div>

            <div className="mb-4 flex w-full items-center gap-1.5 rounded-lg bg-primary px-2.5 py-2 text-[11px] font-medium text-white">
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New check
            </div>

            <p className="mb-2 px-1 text-[9px] font-semibold uppercase tracking-widest text-text-3">
              Recent
            </p>
            {[
              { label: "Headache & fatigue", dot: "bg-selfcare" },
              { label: "Chest pain", dot: "bg-emergency" },
              { label: "Stomach ache", dot: "bg-caution" },
            ].map(({ label, dot }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] text-text-2"
              >
                <div
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`}
                  aria-hidden="true"
                />
                <span className="truncate">{label}</span>
              </div>
            ))}

            <div className="absolute bottom-0 left-0 w-44 border-t border-border bg-surface p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                  U
                </div>
                <div>
                  <p className="text-[10px] font-medium text-text-1">User</p>
                  <p className="text-[9px] text-text-3">Free plan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main chat area */}
          <div className="relative flex flex-1 flex-col">
            <div className="flex items-center border-b border-border bg-surface px-4 py-3">
              <div>
                <p className="text-[12px] font-semibold text-text-1">
                  Symptom Check
                </p>
                <p className="text-[10px] text-text-3">AI-powered triage</p>
              </div>
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-hidden px-4 pb-3 pt-4">
              {/* AI greeting (always visible) */}
              <div className="flex max-w-[82%] gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                  M
                </div>
                <div className="rounded-[10px] rounded-tl-[3px] bg-bg-tint px-3 py-2 text-[11px] leading-[1.5] text-text-1">
                  Hi! Tell me your symptoms. I&apos;ll ask a few questions and
                  give you clear guidance.
                </div>
              </div>

              {/* User message (animated) */}
              <div className="dsk-msg1 self-end max-w-[76%] rounded-[10px] rounded-br-[3px] bg-primary px-3 py-2 text-[11px] leading-[1.5] text-white">
                Severe headache, blurry vision, and neck stiffness
              </div>

              {/* Typing dots (animated) */}
              <div className="dsk-typing flex max-w-[50%] items-center gap-1 rounded-[10px] rounded-tl-[3px] bg-bg-tint px-3 py-2.5">
                <span
                  className="mockup-dot h-1.5 w-1.5 rounded-full bg-text-3"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="mockup-dot h-1.5 w-1.5 rounded-full bg-text-3"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="mockup-dot h-1.5 w-1.5 rounded-full bg-text-3"
                  style={{ animationDelay: "300ms" }}
                />
              </div>

              {/* Severity result card (animated) */}
              <div className="dsk-result max-w-[88%] rounded-[10px] rounded-tl-[3px] border border-caution/25 bg-caution-bg p-3">
                <div className="mb-1.5 flex items-center gap-1.5">
                  <div className="flex h-4 w-4 items-center justify-center rounded-full bg-caution">
                    <svg
                      width="8"
                      height="8"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="12" y1="9" x2="12" y2="13" />
                      <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </div>
                  <p className="text-[11px] font-bold text-caution">
                    See doctor today
                  </p>
                </div>
                <p className="text-[10px] leading-[1.5] text-text-2">
                  Sudden severe headache with neck stiffness and visual changes
                  requires prompt evaluation today. Visit urgent care or ER.
                </p>
                <div className="mt-2 flex gap-1.5">
                  <button className="rounded-md bg-caution px-2 py-1 text-[9px] font-semibold text-white">
                    Find clinic
                  </button>
                  <button className="rounded-md border border-caution/30 px-2 py-1 text-[9px] font-medium text-caution">
                    More info
                  </button>
                </div>
              </div>
            </div>

            {/* Input bar */}
            <div className="border-t border-border px-4 py-3">
              <div className="flex items-center gap-2 rounded-xl border border-border bg-bg px-3 py-2">
                <p className="flex-1 text-[11px] text-text-3">
                  Describe your symptoms…
                </p>
                <button className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-white">
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Feature cards data ─────────────────────────────────────────────
const FEATURES = [
  {
    title: "Talk in your language",
    desc: "Describe symptoms in Hindi, Tamil, Telugu, Gujarati, Marathi, or English. MediTriage understands and responds naturally.",
    iconBg: "bg-primary/8 text-primary",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    title: "Instant triage in 60 seconds",
    desc: "Adaptive follow-up questions hone in on your situation. No endless forms — just a focused conversation and a clear answer.",
    iconBg: "bg-caution/8 text-caution",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
  },
  {
    title: "Private by design",
    desc: "Your health data stays yours. No profile built, no ads served, no data sold. HIPAA-aligned and offline-capable.",
    iconBg: "bg-selfcare/8 text-selfcare",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Family profiles",
    desc: "Manage health checks for parents, children, and relatives from one account. Track full history per member.",
    iconBg: "bg-accent/20 text-accent",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    title: "Exportable PDF reports",
    desc: "Share a full symptom summary with your doctor — timeline, severity assessment, and care recommendations included.",
    iconBg: "bg-primary/8 text-primary",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    title: "Emergency detection",
    desc: "Automatically recognizes red-flag symptoms like chest pain or stroke signs and escalates immediately to emergency guidance.",
    iconBg: "bg-emergency/8 text-emergency",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
];
