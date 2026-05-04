
// MediTriage — All 8 Screens

// ─── 1. LANDING ──────────────────────────────────────────────────────────────
const LandingScreen = () => {
  const [lang, setLang] = React.useState('EN');
  return (
    <div className="screen-wrap screen-landing">
      <header className="landing-header">
        <div className="landing-logo"><span className="logo-mark">M</span><span className="logo-word">MediTriage</span></div>
        <LangPill active={lang} setActive={setLang} />
      </header>

      <div className="landing-hero">
        <div className="hero-eyebrow"><IconSparkles size={14} /><span>AI-powered · Free · Private</span></div>
        <h1 className="hero-headline">Know when to seek<br /><em>care that counts.</em></h1>
        <p className="hero-sub">Describe your symptoms in plain language — Hindi, Tamil, or Telugu — and get trusted guidance in seconds.</p>
        <Btn variant="primary" size="lg" full>
          <IconHeartPulse size={18} /> Start symptom check
        </Btn>
        <p className="hero-note">No sign-up required &nbsp;·&nbsp; 3 free checks daily</p>
      </div>

      <div className="trust-row">
        <TrustBadge icon={<IconShieldCheck size={16} />} label="HIPAA-safe" />
        <TrustBadge icon={<IconWifi size={16} />} label="Works offline" />
        <TrustBadge icon={<IconStar size={16} />} label="4.8 · 12k reviews" />
      </div>

      <div className="how-it-works">
        <SectionLabel>How it works</SectionLabel>
        <div className="steps-col">
          <Step n="1" label="Describe symptoms" sub="Type or speak in your language" />
          <Step n="2" label="AI asks follow-ups" sub="Adaptive questions, 60 seconds" />
          <Step n="3" label="Get clear guidance" sub="Self-care, clinic, or emergency" last />
        </div>
      </div>

      <div className="landing-footer-cta">
        <Btn variant="ghost" full>Sign in for full history &amp; reports</Btn>
      </div>
    </div>
  );
};

// ─── 2. SYMPTOM INPUT ────────────────────────────────────────────────────────
const SymptomInputScreen = () => {
  const chips = ['Fever & chills', 'Headache', 'Chest pain', 'Cough', 'Stomach pain', 'Dizziness'];
  return (
    <div className="screen-wrap">
      <TopBar title="New Check" back action={<IconInfo size={20} />} />
      <div className="screen-body">
        <h2 className="screen-heading">What's bothering you?</h2>
        <p className="screen-sub">Describe in your own words — no medical terms needed.</p>

        <div className="symptom-input-wrap">
          <textarea className="symptom-textarea" rows={5}
            placeholder="e.g. I've had a high fever since yesterday morning, my body aches, and I feel very tired…" />
          <div className="input-footer">
            <span className="char-hint">Hindi / தமி / తె also accepted</span>
            <MicBtn />
          </div>
        </div>

        <div className="chips-row">
          {chips.map(c => <button key={c} className="chip">{c}</button>)}
        </div>

        <div className="privacy-note">
          <IconShieldCheck size={14} />
          <span>Your symptoms are never stored without consent.</span>
        </div>

        <Btn variant="primary" size="lg" full><IconChevronRight size={18} />Analyse symptoms</Btn>
      </div>
      <BottomNav active="home" />
    </div>
  );
};

// ─── 3. ADAPTIVE CHAT ────────────────────────────────────────────────────────
const ChatScreen = () => (
  <div className="screen-wrap">
    <TopBar title="Follow-up questions" back />
    <ProgressBar pct={55} label="Step 2 of 3 — Gathering details" />
    <div className="chat-body">
      <Bubble role="ai">How long have you had the fever? Is it constant or does it come and go?</Bubble>
      <Bubble role="user">It started yesterday evening. It's constant — around 102°F.</Bubble>
      <Bubble role="ai">Any other symptoms? Cough, difficulty breathing, rash, or stiff neck?</Bubble>
      <Bubble role="user">Slight cough, no breathing trouble. No rash.</Bubble>
      <Bubble role="ai">Have you been around anyone who was sick recently, or travelled in the last week?</Bubble>
      <ThinkingDots />
    </div>
    <div className="chat-input-bar">
      <input className="chat-input" type="text" placeholder="Type your reply…" />
      <button className="chat-send"><IconMic size={18} /></button>
      <button className="chat-send primary"><IconChevronRight size={18} /></button>
    </div>
  </div>
);

// ─── 4. RESULT — SELF-CARE ───────────────────────────────────────────────────
const ResultSelfCareScreen = () => (
  <div className="screen-wrap">
    <TopBar title="Your result" back />
    <div className="screen-body result-body">
      <SeverityHero
        tone="selfcare"
        icon={<IconShieldCheck size={28} />}
        title="Self-care at home"
        subtitle="Low severity · Monitor for 3–5 days"
      />

      <Card className="result-summary">
        <p className="result-summary-text">Likely a <strong>common cold</strong> or mild viral infection. Symptoms should resolve with rest and hydration. No urgent medical visit needed.</p>
      </Card>

      <SectionLabel>Suggested OTC remedies</SectionLabel>
      <Card>
        <MedRow name="Paracetamol 500 mg" dose="Every 6 hours if needed" note="max 4g/day" />
        <MedRow name="Saline nasal spray" dose="2 sprays each nostril, 3×/day" />
        <MedRow name="Vitamin C 500 mg" dose="Once daily" />
        <p className="med-disclaimer">Always confirm with a pharmacist before taking new medication.</p>
      </Card>

      <SectionLabel>Care checklist</SectionLabel>
      <Card>
        <CheckItem>Rest — aim for 8+ hours sleep</CheckItem>
        <CheckItem>Drink 2–3 L of fluids daily</CheckItem>
        <CheckItem>Monitor temperature every 4 hours</CheckItem>
        <CheckItem checked={false}>Return if fever exceeds 104°F or lasts &gt;3 days</CheckItem>
      </Card>

      <Btn variant="outline" full><IconDownload size={16} />Save as doctor's note PDF</Btn>
    </div>
    <BottomNav active="home" />
  </div>
);

// ─── 5. RESULT — SEE DOCTOR ──────────────────────────────────────────────────
const ResultSeeDoctorScreen = () => (
  <div className="screen-wrap">
    <TopBar title="Your result" back />
    <div className="screen-body result-body">
      <SeverityHero
        tone="caution"
        icon={<IconAlertTriangle size={28} />}
        title="See a doctor soon"
        subtitle="Moderate severity · Within 24 hours"
      />

      <Card tint="caution" className="result-summary">
        <p className="result-summary-text">Symptoms suggest a <strong>bacterial throat infection</strong> or early flu. Self-care alone may not be enough — a doctor can prescribe appropriate treatment.</p>
      </Card>

      <SectionLabel>Urgency timeline</SectionLabel>
      <Card>
        <div className="urgency-row"><div className="urgency-dot caution" /><div><strong>Within 24 hours</strong><br /><span className="dim">Book a clinic appointment or visit a PHC</span></div></div>
        <div className="urgency-row"><div className="urgency-dot warn" /><div><strong>Go to emergency if</strong><br /><span className="dim">Breathing difficulty, confusion, or fever above 104°F</span></div></div>
      </Card>

      <SectionLabel>Recommended specialist</SectionLabel>
      <SpecialtyCard name="General Physician / GP" sub="Available at your nearest PHC or clinic" />

      <SectionLabel>What to tell the doctor</SectionLabel>
      <Card>
        <CheckItem>Fever since: yesterday evening, ~102°F</CheckItem>
        <CheckItem>Slight dry cough, no breathlessness</CheckItem>
        <CheckItem>No travel in past 2 weeks</CheckItem>
        <CheckItem>No known allergies</CheckItem>
      </Card>

      <Btn variant="outline" full><IconDownload size={16} />Download doctor's summary PDF</Btn>
    </div>
    <BottomNav active="home" />
  </div>
);

// ─── 6. EMERGENCY ────────────────────────────────────────────────────────────
const EmergencyScreen = () => (
  <div className="screen-wrap emergency-screen">
    <div className="emergency-body">
      <div className="emergency-icon-wrap">
        <IconAlertTriangle size={52} />
      </div>
      <h1 className="emergency-headline">Seek emergency care<br />immediately.</h1>
      <p className="emergency-sub">Your symptoms may indicate a <strong>serious condition</strong> requiring urgent medical attention. Do not wait.</p>

      <a href="tel:108" className="emergency-call-btn">
        <IconPhone size={28} />
        <span>Call 108</span>
        <span className="emergency-call-sub">National Ambulance Service</span>
      </a>

      <div className="emergency-alt">
        <div className="emergency-alt-item"><IconMapPin size={18} /><span>Find nearest emergency room</span></div>
        <div className="emergency-alt-item"><IconPhone size={18} /><span>Ask someone to drive you now</span></div>
      </div>

      <div className="emergency-warning-list">
        <p className="emergency-warn-title">Warning signs observed:</p>
        <div className="emergency-warn-item">Severe chest pain or tightness</div>
        <div className="emergency-warn-item">Difficulty breathing at rest</div>
        <div className="emergency-warn-item">Sudden confusion or unresponsiveness</div>
      </div>
    </div>
  </div>
);

// ─── 7. DASHBOARD ────────────────────────────────────────────────────────────
const DashboardScreen = () => (
  <div className="screen-wrap">
    <TopBar title="Dashboard" action={<><IconBell size={20} />&nbsp;<IconUser size={20} /></>} />
    <div className="screen-body">
      <div className="dash-greeting">
        <div>
          <h2 className="dash-name">Good morning, Priya</h2>
          <p className="dash-date">Sunday, 27 Apr 2026</p>
        </div>
        <Btn variant="primary" size="sm"><IconPlus size={14} />New check</Btn>
      </div>

      <div className="stat-row">
        <StatCard value="12" label="Total checks" icon={<IconActivity size={16} />} />
        <StatCard value="3" label="This month" icon={<IconCalendar size={16} />} />
        <StatCard value="Low" label="Avg severity" icon={<IconTrendingUp size={16} />} />
      </div>

      <Card className="last-check-card">
        <div className="last-check-head">
          <SectionLabel>Last check — 3 days ago</SectionLabel>
          <Badge label="Self-care" tone="selfcare" />
        </div>
        <p className="last-check-summary">Mild cold symptoms. Resolved with rest and hydration over 4 days.</p>
        <Btn variant="ghost" size="sm"><IconFileText size={14} />View full report</Btn>
      </Card>

      <SectionLabel>Recent history</SectionLabel>
      <Card>
        <TimelineItem date="24 Apr" summary={{ label: 'Self-care', text: 'Mild cold' }} tone="selfcare" />
        <TimelineItem date="12 Apr" summary={{ label: 'See doctor', text: 'Throat infection' }} tone="caution" />
        <TimelineItem date="2 Apr" summary={{ label: 'Self-care', text: 'Seasonal allergies' }} tone="selfcare" last />
      </Card>

      <Btn variant="outline" full><IconHistory size={16} />View full history</Btn>
    </div>
    <BottomNav active="history" />
  </div>
);

// ─── 8. LOADING + ERROR ──────────────────────────────────────────────────────
const LoadingErrorScreen = () => {
  const [state, setState] = React.useState('loading');
  return (
    <div className="screen-wrap">
      <TopBar title="Analysing…" back />
      <div className="screen-body">
        {state === 'loading' && (
          <div className="loading-state">
            <div className="loading-spinner-wrap">
              <div className="loading-ring" />
              <IconHeartPulse size={32} className="loading-icon" />
            </div>
            <p className="loading-title">Analysing your symptoms…</p>
            <p className="loading-sub">Cross-referencing with clinical guidelines</p>
            <div className="skeleton-stack">
              <Skeleton h={20} w="70%" />
              <Skeleton h={16} w="90%" />
              <Skeleton h={16} w="55%" />
              <Skeleton h={80} />
              <Skeleton h={60} />
            </div>
            <button className="state-toggle dim" onClick={() => setState('error')}>
              Simulate error →
            </button>
          </div>
        )}
        {state === 'error' && (
          <div className="error-state">
            <div className="error-icon"><IconX size={32} /></div>
            <h3 className="error-title">Something went wrong</h3>
            <p className="error-sub">We couldn't complete the analysis. Your data was not saved. Please check your connection and try again.</p>
            <Btn variant="primary" size="lg" full onClick={() => setState('loading')}>
              <IconLoader size={16} className="spin" />Try again
            </Btn>
            <Btn variant="ghost" full>Go back</Btn>
            <button className="state-toggle dim" onClick={() => setState('loading')}>
              ← Back to loading
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, {
  LandingScreen, SymptomInputScreen, ChatScreen,
  ResultSelfCareScreen, ResultSeeDoctorScreen,
  EmergencyScreen, DashboardScreen, LoadingErrorScreen,
});
