import type { Severity } from "./schema";

export const SEVERITY_LABEL: Record<Severity, string> = {
  emergency: "Emergency",
  clinic_today: "See a Doctor Today",
  clinic_soon: "See a Doctor Soon",
  self_care: "Self-Care at Home",
};

export const SEVERITY_COLOR: Record<Severity, string> = {
  emergency: "text-severity-emergency",
  clinic_today: "text-severity-urgent",
  clinic_soon: "text-severity-soon",
  self_care: "text-severity-self",
};

export const SEVERITY_BG: Record<Severity, string> = {
  emergency: "bg-red-50 border-red-200",
  clinic_today: "bg-amber-50 border-amber-200",
  clinic_soon: "bg-yellow-50 border-yellow-200",
  self_care: "bg-green-50 border-green-200",
};

export const SEVERITY_ICON: Record<Severity, string> = {
  emergency: "🚨",
  clinic_today: "⚠️",
  clinic_soon: "📅",
  self_care: "✅",
};

export const SEVERITY_ACTION_LABEL: Record<Severity, string> = {
  emergency: "Call 108 Now",
  clinic_today: "Find Nearest Clinic",
  clinic_soon: "Schedule Appointment",
  self_care: "View Home Care Tips",
};

export const SEVERITY_ORDER: Severity[] = [
  "emergency",
  "clinic_today",
  "clinic_soon",
  "self_care",
];

export function isHigherSeverity(a: Severity, b: Severity): boolean {
  return SEVERITY_ORDER.indexOf(a) < SEVERITY_ORDER.indexOf(b);
}
