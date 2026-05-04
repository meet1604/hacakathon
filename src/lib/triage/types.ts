export type {
  Severity,
  Message,
  FollowupQuestion,
  RedFlag,
  OTCSuggestion,
  TriageResponse,
  TriageInput,
} from "./schema";

export type TriageAction = "ask_followup" | "triage";

export type TriageAskFollowup = Extract<
  import("./schema").TriageResponse,
  { action: "ask_followup" }
>;

export type TriageDecision = Extract<
  import("./schema").TriageResponse,
  { action: "triage" }
>;
