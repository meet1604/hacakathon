"use client";

import { useActionState, useState, useEffect, useRef, useTransition } from "react";
import { addFamilyMember, editFamilyMember, deleteFamilyMember } from "@/lib/auth/family-actions";
import type { FamilyMemberRow } from "@/lib/db/queries";
import { useToast } from "@/components/ui/Toast";

const AGE_BANDS = [
  { value: "child", label: "Child (under 12)" },
  { value: "teen", label: "Teen (12–17)" },
  { value: "adult", label: "Adult (18–60)" },
  { value: "elderly", label: "Elderly (60+)" },
] as const;

const RELATIONS = ["Parent", "Child", "Spouse", "Sibling", "Grandparent", "Other"];

// ── Inline member form ────────────────────────────────────────────
function MemberForm({
  initial,
  action,
  onCancel,
  onSuccess,
  submitLabel,
}: {
  initial?: FamilyMemberRow;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (prev: any, fd: FormData) => Promise<{ error: string | null }>;
  onCancel: () => void;
  onSuccess?: () => void;
  submitLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(action, { error: null });
  const prevPending = useRef(false);

  useEffect(() => {
    if (prevPending.current && !isPending && !state.error) {
      onSuccess?.();
    }
    prevPending.current = isPending;
  }, [isPending, state.error, onSuccess]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {initial && <input type="hidden" name="id" value={initial.id} />}

      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="nickname" className="text-[14px] font-medium text-text-1">
          Name / nickname <span className="text-emergency" aria-hidden>*</span>
        </label>
        <input
          id="nickname"
          name="nickname"
          required
          defaultValue={initial?.nickname}
          placeholder="e.g. Mom, Ravi"
          className="h-11 rounded-xl border border-border bg-bg px-4 text-[15px] text-text-1 placeholder:text-text-3 focus:border-primary-mid focus:outline-none focus:ring-[3px] focus:ring-primary/10"
        />
      </div>

      {/* Relation + Age band */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="relation" className="text-[14px] font-medium text-text-1">
            Relation
          </label>
          <select
            id="relation"
            name="relation"
            defaultValue={initial?.relation ?? ""}
            className="h-11 rounded-xl border border-border bg-bg px-3 text-[15px] text-text-1 focus:border-primary-mid focus:outline-none focus:ring-[3px] focus:ring-primary/10"
          >
            <option value="">Select…</option>
            {RELATIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="age_band" className="text-[14px] font-medium text-text-1">
            Age group
          </label>
          <select
            id="age_band"
            name="age_band"
            defaultValue={initial?.age_band ?? ""}
            className="h-11 rounded-xl border border-border bg-bg px-3 text-[15px] text-text-1 focus:border-primary-mid focus:outline-none focus:ring-[3px] focus:ring-primary/10"
          >
            <option value="">Select…</option>
            {AGE_BANDS.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Known conditions */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="known_conditions" className="text-[14px] font-medium text-text-1">
          Known conditions <span className="text-text-3 font-normal">(optional)</span>
        </label>
        <textarea
          id="known_conditions"
          name="known_conditions"
          rows={2}
          defaultValue={initial?.known_conditions ?? ""}
          placeholder="e.g. diabetes, hypertension…"
          className="resize-none rounded-xl border border-border bg-bg px-4 py-3 text-[15px] text-text-1 placeholder:text-text-3 focus:border-primary-mid focus:outline-none focus:ring-[3px] focus:ring-primary/10"
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded-xl border border-emergency/30 bg-emergency-bg px-4 py-3 text-[14px] text-emergency">
          {state.error}
        </p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-border py-2.5 text-[14px] font-medium text-text-2 transition-colors hover:bg-bg-tint"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex-1 rounded-xl bg-primary py-2.5 text-[14px] font-medium text-white shadow-sm transition-all hover:bg-primary-dark disabled:opacity-50"
        >
          {isPending ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

// ── Member card ───────────────────────────────────────────────────
function MemberCard({ member }: { member: FamilyMemberRow }) {
  const [editing, setEditing] = useState(false);
  const [isDeleting, startDelete] = useTransition();
  const { toast } = useToast();

  const ageBand = AGE_BANDS.find((b) => b.value === member.age_band);

  function handleDelete() {
    startDelete(async () => {
      const fd = new FormData();
      fd.set("id", member.id);
      const result = await deleteFamilyMember(fd);
      if (result.error) {
        toast({ type: "error", title: "Error", message: result.error });
      } else {
        toast({ type: "success", title: `${member.nickname} removed` });
      }
    });
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-primary/30 bg-surface p-4 shadow-sm">
        <p className="mb-4 text-[12px] font-semibold uppercase tracking-[.07em] text-text-3">
          Edit member
        </p>
        <MemberForm
          initial={member}
          action={editFamilyMember}
          onCancel={() => setEditing(false)}
          onSuccess={() => {
            setEditing(false);
            toast({ type: "success", title: `${member.nickname} updated` });
          }}
          submitLabel="Save changes"
        />
      </div>
    );
  }

  return (
    <div className="flex items-start gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm">
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-white">
        {member.nickname[0].toUpperCase()}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium text-text-1">{member.nickname}</p>
        <div className="mt-0.5 flex flex-wrap items-center gap-2">
          {member.relation && (
            <span className="text-[13px] text-text-2">{member.relation}</span>
          )}
          {ageBand && (
            <span className="rounded-full border border-border bg-bg px-2 py-0.5 text-[11px] text-text-3">
              {ageBand.label}
            </span>
          )}
        </div>
        {member.known_conditions && (
          <p className="mt-1 text-[12px] text-text-3 line-clamp-1">
            {member.known_conditions}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => setEditing(true)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-2 transition-colors hover:bg-bg-tint"
          aria-label={`Edit ${member.nickname}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-2 transition-colors hover:border-emergency/40 hover:bg-emergency-bg hover:text-emergency disabled:opacity-50"
          aria-label={`Remove ${member.nickname}`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Main manager ──────────────────────────────────────────────────
export function FamilyMemberManager({ members }: { members: FamilyMemberRow[] }) {
  const [adding, setAdding] = useState(false);
  const { toast } = useToast();

  return (
    <div className="flex flex-col gap-4">
      {/* Add form */}
      {adding ? (
        <div className="rounded-xl border border-primary/30 bg-surface p-4 shadow-sm">
          <p className="mb-4 text-[12px] font-semibold uppercase tracking-[.07em] text-text-3">
            Add member
          </p>
          <MemberForm
            action={addFamilyMember}
            onCancel={() => setAdding(false)}
            onSuccess={() => {
              setAdding(false);
              toast({ type: "success", title: "Family member added" });
            }}
            submitLabel="Add member"
          />
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-selfcare-bg text-[14px] font-medium text-primary transition-colors hover:border-primary hover:bg-selfcare-bg/80"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add family member
        </button>
      )}

      {/* Member list */}
      {members.length === 0 && !adding ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface px-6 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bg-tint">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-text-3" aria-hidden="true">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <p className="text-[15px] font-medium text-text-1">No family members yet</p>
            <p className="mt-0.5 max-w-xs text-[14px] text-text-2">
              Add a member to run symptom checks for them — AI tailors guidance per age group.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {members.map((m) => (
            <MemberCard key={m.id} member={m} />
          ))}
        </div>
      )}

      {/* Age band info */}
      {members.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Child (under 12)", note: "OTC suggestions avoided" },
            { label: "Elderly (60+)", note: "Higher urgency thresholds" },
          ].map(({ label, note }) => (
            <div key={label} className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-[12px] text-text-3">
              <span className="font-medium text-text-2">{label}</span>
              <span>·</span>
              <span>{note}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
