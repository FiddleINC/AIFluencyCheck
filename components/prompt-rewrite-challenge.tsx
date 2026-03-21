"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FORM_STORAGE_KEY,
  PROMPT_CHALLENGE_STORAGE_KEY,
  STORAGE_KEY,
} from "@/lib/example-data";
import {
  extractChallengeRole,
  getBadPromptForRole,
  isPromptRewriteState,
  scorePromptRewrite,
} from "@/lib/prompt-rewrite";
import type { AuditFormData, PromptRewriteState } from "@/lib/types";

type PromptRewriteChallengeProps = {
  form: AuditFormData;
};

export function PromptRewriteChallenge({ form }: PromptRewriteChallengeProps) {
  const role = extractChallengeRole(form);
  const badPrompt = useMemo(() => getBadPromptForRole(role), [role]);
  const [rewrittenPrompt, setRewrittenPrompt] = useState("");
  const [challengeState, setChallengeState] = useState<PromptRewriteState | null>(null);

  useEffect(() => {
    const saved = readChallengeState(role, badPrompt);

    startTransition(() => {
      setChallengeState(saved);
      setRewrittenPrompt(saved?.rewrittenPrompt ?? "");
    });
  }, [role, badPrompt]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = scorePromptRewrite(role, badPrompt, rewrittenPrompt);
    const nextState: PromptRewriteState = {
      role,
      badPrompt,
      rewrittenPrompt,
      result,
    };

    window.sessionStorage.setItem(
      PROMPT_CHALLENGE_STORAGE_KEY,
      JSON.stringify(nextState),
    );
    setChallengeState(nextState);
  }

  return (
    <div className="grid gap-6">
      <section className="card p-6 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
          Prompt Challenge
        </p>
        <h1 className="mt-3 font-display text-4xl text-slate-900">
          Think you can prompt? Prove it.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
          Rewrite this intentionally weak prompt for a {role.toLowerCase()}. Your goal
          is to improve it by adding context, specifying the format, and adding clear
          constraints.
        </p>
        <div className="mt-5 rounded-[1.25rem] border border-[var(--border)] bg-white/75 p-5">
          <p className="text-sm font-semibold text-slate-800">Why this matters</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Anthropic&apos;s AI Fluency Index, published in February 2026 and based on
            9,830 real Claude conversations, found that iteration behavior is the
            strongest predictor of fluency. This challenge is a small way to practice
            that skill directly.
          </p>
        </div>
      </section>

      <section className="card p-6 sm:p-8">
        <h2 className="text-lg font-semibold text-slate-900">Bad prompt</h2>
        <div className="mt-4 rounded-[1.25rem] border border-[var(--border)] bg-white/75 p-5">
          <p className="text-sm leading-7 text-slate-700">{badPrompt}</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <label className="block">
            <span className="mb-3 block text-sm font-semibold text-slate-800">
              Your rewrite
            </span>
            <textarea
              className="field min-h-40"
              value={rewrittenPrompt}
              onChange={(event) => setRewrittenPrompt(event.target.value)}
              placeholder="Rewrite the prompt with better context, structure, and constraints..."
              required
            />
          </label>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm leading-6 text-slate-500">
              Deterministic scoring only. No API calls are used for this challenge.
            </p>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
            >
              Score my rewrite
            </button>
          </div>
        </form>
      </section>

      {challengeState ? (
        <section className="card p-6 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Challenge result
              </p>
              <h2 className="mt-2 font-display text-4xl text-slate-900">
                {challengeState.result.score} / 3
              </h2>
            </div>
            <Link
              href="/results"
              className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--border)] px-5 text-sm font-semibold text-slate-700 transition hover:bg-white/70"
            >
              Back to results
            </Link>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[1.25rem] border border-[var(--border)] bg-white/75 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                Criteria hit
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                {challengeState.result.criteria
                  .filter((criterion) => criterion.hit)
                  .map((criterion) => (
                    <li key={criterion.label}>- {criterion.label}: {criterion.detail}</li>
                  ))}
              </ul>
            </div>

            <div className="rounded-[1.25rem] border border-[var(--border)] bg-white/75 p-5">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                Criteria missed
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                {challengeState.result.criteria
                  .filter((criterion) => !criterion.hit)
                  .map((criterion) => (
                    <li key={criterion.label}>- {criterion.label}: {criterion.detail}</li>
                  ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function readChallengeState(role: AuditFormData["role"], badPrompt: string): PromptRewriteState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const saved = window.sessionStorage.getItem(PROMPT_CHALLENGE_STORAGE_KEY);

  if (!saved) {
    return null;
  }

  try {
    const parsed = JSON.parse(saved);

    if (!isPromptRewriteState(parsed, role, badPrompt)) {
      window.sessionStorage.removeItem(PROMPT_CHALLENGE_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    window.sessionStorage.removeItem(PROMPT_CHALLENGE_STORAGE_KEY);
    return null;
  }
}

export function readStoredFormForChallenge(): AuditFormData | null {
  if (typeof window === "undefined") {
    return null;
  }

  const saved = window.sessionStorage.getItem(FORM_STORAGE_KEY);

  if (saved) {
    try {
      const parsed = JSON.parse(saved);

      if (isAuditFormData(parsed)) {
        return parsed;
      }

      window.sessionStorage.removeItem(FORM_STORAGE_KEY);
    } catch {
      window.sessionStorage.removeItem(FORM_STORAGE_KEY);
    }
  }

  const savedResult = window.sessionStorage.getItem(STORAGE_KEY);

  if (!savedResult) {
    return null;
  }

  try {
    const parsed = JSON.parse(savedResult);

    if (isAuditFormData(parsed)) {
      return parsed;
    }

    window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function isAuditFormData(value: unknown): value is AuditFormData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AuditFormData>;

  return (
    typeof candidate.name === "string" &&
    typeof candidate.role === "string" &&
    typeof candidate.yearsExperience === "string" &&
    typeof candidate.industry === "string" &&
    typeof candidate.usageFrequency === "string" &&
    typeof candidate.tools === "string" &&
    Array.isArray(candidate.useCases) &&
    typeof candidate.primaryUseCase === "string" &&
    typeof candidate.promptingConfidence === "number" &&
    typeof candidate.repeatableWorkflows === "boolean" &&
    typeof candidate.reviewHabit === "number" &&
    typeof candidate.improvementGoal === "string" &&
    typeof candidate.promptExamples === "string" &&
    typeof candidate.resumeText === "string"
  );
}
