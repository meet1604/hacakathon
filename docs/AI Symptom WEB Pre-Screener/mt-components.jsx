
// MediTriage — Shared UI Components

// ── Buttons ──────────────────────────────────────────────────────────────────
const Btn = ({ children, variant = 'primary', size = 'md', full = false, onClick, disabled, className = '' }) => {
  const base = `btn btn-${variant} btn-${size}${full ? ' btn-full' : ''}${disabled ? ' btn-disabled' : ''} ${className}`;
  return (
    <button className={base} onClick={onClick} disabled={disabled} type="button">
      {children}
    </button>
  );
};

// ── Badge ─────────────────────────────────────────────────────────────────────
const Badge = ({ label, tone = 'sage', dot = true }) => (
  <span className={`badge badge-${tone}`}>
    {dot && <span className="badge-dot" />}
    {label}
  </span>
);

// ── Card ──────────────────────────────────────────────────────────────────────
const Card = ({ children, tint, className = '', style = {} }) => (
  <div className={`card${tint ? ` card-${tint}` : ''} ${className}`} style={style}>
    {children}
  </div>
);

// ── Section label ─────────────────────────────────────────────────────────────
const SectionLabel = ({ children }) => (
  <p className="section-label">{children}</p>
);

// ── Step indicator ────────────────────────────────────────────────────────────
const Step = ({ n, label, sub, last = false }) => (
  <div className="step-item">
    <div className="step-track">
      <div className="step-num">{n}</div>
      {!last && <div className="step-line" />}
    </div>
    <div className="step-body">
      <div className="step-label">{label}</div>
      {sub && <div className="step-sub">{sub}</div>}
    </div>
  </div>
);

// ── Severity hero card ────────────────────────────────────────────────────────
const SeverityHero = ({ tone, icon, title, subtitle }) => (
  <div className={`severity-hero severity-hero-${tone}`}>
    <div className="severity-icon">{icon}</div>
    <div>
      <div className="severity-title">{title}</div>
      <div className="severity-sub">{subtitle}</div>
    </div>
  </div>
);

// ── Chat bubble ───────────────────────────────────────────────────────────────
const Bubble = ({ role, children }) => (
  <div className={`bubble bubble-${role}`}>
    {children}
  </div>
);

// ── Thinking dots ─────────────────────────────────────────────────────────────
const ThinkingDots = () => (
  <div className="bubble bubble-ai thinking-dots">
    <span /><span /><span />
  </div>
);

// ── Progress bar ──────────────────────────────────────────────────────────────
const ProgressBar = ({ pct, label }) => (
  <div className="progress-wrap">
    <div className="progress-label">{label}</div>
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  </div>
);

// ── Checklist item ────────────────────────────────────────────────────────────
const CheckItem = ({ children, checked = true }) => (
  <div className="check-item">
    <div className={`check-mark ${checked ? 'checked' : ''}`}>
      {checked && <IconCheck size={12} />}
    </div>
    <span>{children}</span>
  </div>
);

// ── OTC med row ───────────────────────────────────────────────────────────────
const MedRow = ({ name, dose, note }) => (
  <div className="med-row">
    <div className="med-icon"><IconPill size={16} /></div>
    <div>
      <div className="med-name">{name}</div>
      <div className="med-dose">{dose}{note && <> — <em>{note}</em></>}</div>
    </div>
  </div>
);

// ── Timeline item ─────────────────────────────────────────────────────────────
const TimelineItem = ({ date, summary, tone, last = false }) => (
  <div className="timeline-item">
    <div className="tl-track">
      <div className={`tl-dot tl-dot-${tone}`} />
      {!last && <div className="tl-line" />}
    </div>
    <div className="tl-body">
      <div className="tl-date">{date}</div>
      <div className="tl-row">
        <Badge label={summary.label} tone={tone} />
        <span className="tl-summary">{summary.text}</span>
      </div>
    </div>
  </div>
);

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ value, label, icon }) => (
  <div className="stat-card">
    {icon && <div className="stat-icon">{icon}</div>}
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
  </div>
);

// ── Language pill ─────────────────────────────────────────────────────────────
const LangPill = ({ active, setActive }) => {
  const langs = ['EN', 'हिं', 'தமி', 'తె'];
  return (
    <div className="lang-pill">
      {langs.map(l => (
        <button key={l} className={`lang-opt${active === l ? ' active' : ''}`} onClick={() => setActive(l)}>
          {l}
        </button>
      ))}
    </div>
  );
};

// ── Skeleton shimmer ──────────────────────────────────────────────────────────
const Skeleton = ({ h = 20, w = '100%', r = 8 }) => (
  <div className="skeleton" style={{ height: h, width: w, borderRadius: r }} />
);

// ── Trust badge row ───────────────────────────────────────────────────────────
const TrustBadge = ({ icon, label }) => (
  <div className="trust-badge">
    {icon}
    <span>{label}</span>
  </div>
);

// ── Specialty card ────────────────────────────────────────────────────────────
const SpecialtyCard = ({ name, sub }) => (
  <div className="specialty-card">
    <div className="specialty-icon"><IconHospital size={18} /></div>
    <div>
      <div className="specialty-name">{name}</div>
      <div className="specialty-sub">{sub}</div>
    </div>
    <IconChevronRight size={16} className="specialty-arrow" />
  </div>
);

// ── Nav bar (mobile bottom) ───────────────────────────────────────────────────
const BottomNav = ({ active = 'home' }) => {
  const items = [
    { id: 'home', icon: <IconHeartPulse size={20} />, label: 'Check' },
    { id: 'history', icon: <IconHistory size={20} />, label: 'History' },
    { id: 'reports', icon: <IconFileText size={20} />, label: 'Reports' },
    { id: 'profile', icon: <IconUser size={20} />, label: 'Profile' },
  ];
  return (
    <nav className="bottom-nav">
      {items.map(it => (
        <div key={it.id} className={`bottom-nav-item${active === it.id ? ' active' : ''}`}>
          {it.icon}
          <span>{it.label}</span>
        </div>
      ))}
    </nav>
  );
};

// ── Top app bar ───────────────────────────────────────────────────────────────
const TopBar = ({ title, back = false, action }) => (
  <div className="top-bar">
    {back
      ? <button className="top-bar-back"><IconArrowLeft size={20} /></button>
      : <div className="top-bar-logo"><span className="logo-mark">M</span></div>
    }
    <span className="top-bar-title">{title}</span>
    <div className="top-bar-action">{action}</div>
  </div>
);

// ── Mic button with pulse rings ───────────────────────────────────────────────
const MicBtn = ({ listening = false }) => (
  <div className={`mic-btn-wrap${listening ? ' listening' : ''}`}>
    {listening && <>
      <div className="pulse-ring pulse-ring-1" />
      <div className="pulse-ring pulse-ring-2" />
    </>}
    <button className="mic-btn" aria-label="Speak symptoms">
      <IconMic size={28} />
    </button>
  </div>
);

Object.assign(window, {
  Btn, Badge, Card, SectionLabel, Step, SeverityHero,
  Bubble, ThinkingDots, ProgressBar, CheckItem, MedRow,
  TimelineItem, StatCard, LangPill, Skeleton, TrustBadge,
  SpecialtyCard, BottomNav, TopBar, MicBtn,
});
