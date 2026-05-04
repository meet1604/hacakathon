import { z } from "zod";

export const SeverityEnum = z.enum([
  "emergency",
  "clinic_today",
  "clinic_soon",
  "self_care",
]);
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
export type FollowupQuestion = z.infer<typeof FollowupQuestionSchema>;

export const RedFlagSchema = z.object({
  category: z.string(),
  description: z.string(),
});
export type RedFlag = z.infer<typeof RedFlagSchema>;

export const OTCSuggestionSchema = z.object({
  name: z.string(),
  purpose: z.string(),
  caution: z.string(),
});
export type OTCSuggestion = z.infer<typeof OTCSuggestionSchema>;

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

export const MemberContextSchema = z.object({
  nickname: z.string(),
  ageBand: z.string().optional(),
  knownConditions: z.string().optional(),
});
export type MemberContext = z.infer<typeof MemberContextSchema>;

export const TriageInputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(20),
  language: z.string().default("English"),
  sessionId: z.string().uuid().optional(),
  memberContext: MemberContextSchema.optional(),
});
export type TriageInput = z.infer<typeof TriageInputSchema>;
