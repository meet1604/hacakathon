
// MediTriage Icon Library — Lucide-style, 1.5px stroke, 24×24 grid
const SVG = ({ size = 20, children, className = '' }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24"
    fill="none" stroke="currentColor"
    strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >{children}</svg>
);

const IconStethoscope = ({ size }) => <SVG size={size}><path d="M6 3v3M18 3v3M6 6a6 6 0 0 0 12 0"/><path d="M12 12v5"/><circle cx="15" cy="19" r="3"/></SVG>;
const IconHeartPulse = ({ size }) => <SVG size={size}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/><path d="M3.22 12H9.5l1.5-3 2 6 1.5-4 1.5 1H21.8"/></SVG>;
const IconShieldCheck = ({ size }) => <SVG size={size}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></SVG>;
const IconMic = ({ size }) => <SVG size={size}><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></SVG>;
const IconPhone = ({ size }) => <SVG size={size}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></SVG>;
const IconCheck = ({ size }) => <SVG size={size}><polyline points="20 6 9 17 4 12"/></SVG>;
const IconAlertTriangle = ({ size }) => <SVG size={size}><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></SVG>;
const IconClock = ({ size }) => <SVG size={size}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></SVG>;
const IconFileText = ({ size }) => <SVG size={size}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></SVG>;
const IconUser = ({ size }) => <SVG size={size}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></SVG>;
const IconActivity = ({ size }) => <SVG size={size}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></SVG>;
const IconPill = ({ size }) => <SVG size={size}><path d="m10.5 20.5-7-7a5 5 0 1 1 7-7l7 7a5 5 0 0 1-7 7Z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></SVG>;
const IconDownload = ({ size }) => <SVG size={size}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></SVG>;
const IconPlus = ({ size }) => <SVG size={size}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></SVG>;
const IconChevronRight = ({ size }) => <SVG size={size}><polyline points="9 18 15 12 9 6"/></SVG>;
const IconChevronLeft = ({ size }) => <SVG size={size}><polyline points="15 18 9 12 15 6"/></SVG>;
const IconMoon = ({ size }) => <SVG size={size}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></SVG>;
const IconSun = ({ size }) => <SVG size={size}><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></SVG>;
const IconX = ({ size }) => <SVG size={size}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></SVG>;
const IconArrowLeft = ({ size }) => <SVG size={size}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></SVG>;
const IconHistory = ({ size }) => <SVG size={size}><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 3"/><polyline points="12 7 12 12 14.5 14.5"/></SVG>;
const IconCalendar = ({ size }) => <SVG size={size}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></SVG>;
const IconSparkles = ({ size }) => <SVG size={size}><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3 4 6l-3 1 3 1 1 3 1-3 3-1-3-1-1-3z"/><path d="M19 13l-.5 1.5L17 15l1.5.5.5 1.5.5-1.5L21 15l-1.5-.5-.5-1.5z"/></SVG>;
const IconMapPin = ({ size }) => <SVG size={size}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></SVG>;
const IconLoader = ({ size, className = '' }) => <SVG size={size} className={className}><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></SVG>;
const IconWifi = ({ size }) => <SVG size={size}><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></SVG>;
const IconInfo = ({ size }) => <SVG size={size}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></SVG>;
const IconHospital = ({ size }) => <SVG size={size}><path d="M12 6v4M10 8h4"/><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></SVG>;
const IconClipboard = ({ size }) => <SVG size={size}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></SVG>;
const IconTrendingUp = ({ size }) => <SVG size={size}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></SVG>;
const IconStar = ({ size }) => <SVG size={size}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></SVG>;
const IconBell = ({ size }) => <SVG size={size}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></SVG>;
const IconSettings = ({ size }) => <SVG size={size}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></SVG>;

Object.assign(window, {
  IconStethoscope, IconHeartPulse, IconShieldCheck, IconMic, IconPhone,
  IconCheck, IconAlertTriangle, IconClock, IconFileText, IconUser,
  IconActivity, IconPill, IconDownload, IconPlus, IconChevronRight,
  IconChevronLeft, IconMoon, IconSun, IconX, IconArrowLeft,
  IconHistory, IconCalendar, IconSparkles, IconMapPin, IconLoader,
  IconWifi, IconInfo, IconHospital, IconClipboard, IconTrendingUp,
  IconStar, IconBell, IconSettings,
});
