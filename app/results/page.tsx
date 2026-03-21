"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";
import { ProgressBar } from "@/components/progress-bar";
import { ResultCard } from "@/components/result-card";
import { getBadPromptForRole, isPromptRewriteState } from "@/lib/prompt-rewrite";
import { getBadge } from "@/lib/scoring";
import {
  AI_INSIGHTS_STORAGE_KEY,
  FORM_STORAGE_KEY,
  PROMPT_CHALLENGE_STORAGE_KEY,
  STORAGE_KEY,
} from "@/lib/example-data";
import type {
  AuditResult,
  GeneratedReport,
  InsightsResponse,
  PromptRewriteState,
} from "@/lib/types";

const categoryHints: Record<string, string> = {
  Adoption: "How consistently you use AI and how well your use cases match the work that matters in your role.",
  Prompting: "How clearly you instruct AI and shape the output you want.",
  Workflow: "How well you turn AI usage into repeatable systems instead of one-off asks.",
  Judgment: "How critically you review AI outputs before using them in real work.",
};

export default function ResultsPage() {
  const router = useRouter();
  const [baseResult, setBaseResult] = useState<AuditResult | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [reportStatus, setReportStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [copiedScore, setCopiedScore] = useState(false);
  const [challengeState, setChallengeState] = useState<PromptRewriteState | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  useEffect(() => {
    startTransition(() => {
      const storedResult = readStoredResult();
      setBaseResult(storedResult);
      setChallengeState(readStoredChallengeState(storedResult));
      setHasLoaded(true);
    });
  }, []);

  const reportSignature = useMemo(() => {
    if (!baseResult) {
      return null;
    }

    return createReportSignature(baseResult);
  }, [baseResult]);

  useEffect(() => {
    if (!baseResult || !reportSignature) {
      return;
    }

    const currentResult = baseResult;

    const currentSignature = reportSignature;
    const cached = refreshToken === 0 ? readStoredGeneratedReport(currentSignature) : null;

    if (cached) {
      setReport(cached);
      setReportStatus("ready");
      setRefreshError(null);
      return;
    }

    let cancelled = false;
    setReportStatus("loading");

    async function loadReport() {
      try {
        const response = await fetch("/api/insights", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ form: extractForm(currentResult) }),
        });

        const payload = (await response.json()) as InsightsResponse;

        if (!response.ok || !payload.report) {
          throw new Error(payload.error || "Unable to generate the report.");
        }

        if (cancelled) {
          return;
        }

        writeStoredGeneratedReport(currentSignature, payload.report);
        setReport(payload.report);
        setReportStatus("ready");
        setRefreshError(null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setReportStatus("error");
        setRefreshError("Couldn’t refresh the report right now. Showing your last result.");
        console.error("Failed to load generated report", error);
      }
    }

    void loadReport();

    return () => {
      cancelled = true;
    };
  }, [baseResult, reportSignature, refreshToken]);

  useEffect(() => {
    if (!copiedPrompt) {
      return;
    }

    const timeout = window.setTimeout(() => setCopiedPrompt(null), 1600);
    return () => window.clearTimeout(timeout);
  }, [copiedPrompt]);

  useEffect(() => {
    if (!copiedScore) {
      return;
    }

    const timeout = window.setTimeout(() => setCopiedScore(false), 1600);
    return () => window.clearTimeout(timeout);
  }, [copiedScore]);

  function handleStartOver() {
    window.sessionStorage.removeItem(FORM_STORAGE_KEY);
    window.sessionStorage.removeItem(AI_INSIGHTS_STORAGE_KEY);
    window.sessionStorage.removeItem(PROMPT_CHALLENGE_STORAGE_KEY);
    window.sessionStorage.removeItem(STORAGE_KEY);
    router.push("/");
  }

  async function handleCopyPrompt(title: string, promptText?: string) {
    if (!promptText) {
      return;
    }

    await navigator.clipboard.writeText(promptText);
    setCopiedPrompt(title);
  }

  async function handleCopyScore(reportToCopy: GeneratedReport) {
    const badge = getBadge(reportToCopy.overallScore);
    const scoreText = [
      `${badge.emoji} ${badge.label}`,
      `AI Fluency Check score: ${reportToCopy.overallScore}/100`,
      `Role: ${reportToCopy.role}`,
      reportToCopy.scoreLabel,
      `Top next step: ${reportToCopy.recommendations[0] || reportToCopy.thirtyDayPlan[0]}`,
    ].join("\n");

    await navigator.clipboard.writeText(scoreText);
    setCopiedScore(true);
  }

  function handleRegenerateReport() {
    if (!baseResult) {
      return;
    }

    window.sessionStorage.removeItem(AI_INSIGHTS_STORAGE_KEY);
    setReportStatus("loading");
    setRefreshError(null);
    setRefreshToken((current) => current + 1);
  }

  if (!hasLoaded) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-16 sm:px-10">
        <section className="card w-full p-8 text-center sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
            Loading report
          </p>
          <h1 className="mt-3 font-display text-4xl text-slate-900">
            Pulling your latest local results.
          </h1>
        </section>
      </main>
    );
  }

  if (!baseResult) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-16 sm:px-10">
        <section className="card w-full p-8 text-center sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
            No report yet
          </p>
          <h1 className="mt-3 font-display text-4xl text-slate-900">
            Run the audit first.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-600">
            This page reads the latest result from session storage, so start with
            the form and generate a report first.
          </p>
          <Link
            href="/audit"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            Go to audit
          </Link>
        </section>
      </main>
    );
  }

  if (reportStatus === "loading" && !report) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-16 sm:px-10">
        <section className="card w-full p-8 text-center sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
            Generating report
          </p>
          <h1 className="mt-3 font-display text-4xl text-slate-900">
            Building your AI fluency report.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-600">
            This can take a few seconds while the app generates your score,
            recommendations, plan, and project ideas.
          </p>
        </section>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-16 sm:px-10">
        <section className="card w-full p-8 text-center sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
            Report unavailable
          </p>
          <h1 className="mt-3 font-display text-4xl text-slate-900">
            We could not build your report.
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-600">
            Please go back to the audit and try again.
          </p>
          <Link
            href="/audit"
            className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            Back to audit
          </Link>
        </section>
      </main>
    );
  }

  const displayReport = report;
  const badge = getBadge(displayReport.overallScore);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:px-10">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--accent-strong)]">
            Results
          </p>
          <h1 className="mt-2 font-display text-4xl text-slate-900">
            {displayReport.name}&apos;s AI fluency report
          </h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            {displayReport.role} in {displayReport.industry} · {displayReport.yearsExperience} years of
            experience
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleRegenerateReport}
            disabled={reportStatus === "loading"}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--border)] px-5 text-sm font-semibold text-slate-700 transition hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {reportStatus === "loading" ? "Regenerating..." : "Regenerate report"}
          </button>
          <Link
            href="/audit"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[var(--border)] px-5 text-sm font-semibold text-slate-700 transition hover:bg-white/70"
          >
            Edit answers
          </Link>
          <button
            type="button"
            onClick={handleStartOver}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
          >
            Start over
          </button>
        </div>
      </div>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <ResultCard title="Overall score" description="A fast snapshot of your current AI fluency.">
          <div className="mb-5 inline-flex items-center gap-3 rounded-full border border-[var(--border)] bg-[var(--panel-soft)] px-4 py-2 text-sm font-semibold text-slate-800">
            <span className="text-lg" aria-hidden="true">
              {badge.emoji}
            </span>
            <span>{badge.label}</span>
          </div>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-end gap-3">
              <p className="font-display text-6xl text-slate-900">{displayReport.overallScore}</p>
              <p className="pb-2 text-lg text-slate-500">/ 100</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{displayReport.scoreLabel}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => handleCopyScore(displayReport)}
              className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
            >
              {copiedScore ? "Copied score" : "Copy score"}
            </button>
          </div>
          <div className="mt-6 space-y-4">
            {displayReport.categories.map((category) => (
              <ProgressBar
                key={category.name}
                label={category.name}
                value={category.score}
                hint={categoryHints[category.name]}
              />
            ))}
          </div>
          {reportStatus === "loading" ? (
            <p className="mt-4 text-sm text-slate-500">
              Refreshing the AI report with your current answers.
            </p>
          ) : null}
          {refreshError ? <p className="mt-4 text-sm text-slate-500">{refreshError}</p> : null}
        </ResultCard>

        <ResultCard
          title="What this means"
          description="A tailored interpretation of your current AI fluency profile."
        >
          <p className="text-sm leading-7 text-slate-700">{displayReport.narrativeSummary}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Strengths
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                {displayReport.strengths.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                Blind spots
              </h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
                {displayReport.blindSpots.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </ResultCard>
      </section>

      <section className="mt-6">
        <ResultCard
          title="Prompt Rewriting Challenge"
          description="Optional bonus round: rewrite one weak prompt and see whether you added context, format, and constraints."
        >
          <div className="flex flex-col gap-4 rounded-[1.25rem] border border-[var(--border)] bg-white/75 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm leading-6 text-slate-700">
                Think you can prompt? Prove it.
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {challengeState
                  ? `Last challenge score: ${challengeState.result.score} / 3`
                  : "Take a fast deterministic prompt rewrite challenge tailored to your role."}
              </p>
            </div>
            <Link
              href="/challenge"
              className="inline-flex h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
            >
              {challengeState ? "Retry challenge" : "Start challenge"}
            </Link>
          </div>
        </ResultCard>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <ResultCard title="3 recommendations" description="Most useful next moves for the next few weeks.">
          <ol className="space-y-4 text-sm leading-6 text-slate-700">
            {displayReport.recommendations.map((item, index) => (
              <li key={item} className="flex gap-3">
                <span className="pill h-fit min-w-8 justify-center text-xs font-semibold text-slate-700">
                  {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </ResultCard>

        <ResultCard title="30-day plan" description="A compact weekly sequence to build better habits.">
          <ol className="space-y-4 text-sm leading-6 text-slate-700">
            {displayReport.thirtyDayPlan.map((item, index) => (
              <li key={item} className="flex gap-3">
                <span className="pill h-fit shrink-0 whitespace-nowrap justify-center text-xs font-semibold uppercase tracking-[0.14em] text-slate-700">
                  Week {index + 1}
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
        </ResultCard>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <ResultCard title="Mini project ideas" description="Small exercises to turn AI usage into repeatable value.">
          <div className="grid gap-4">
            {displayReport.projectIdeas.map((item) => (
              <div key={item.title} className="rounded-[1.25rem] border border-[var(--border)] bg-white/75 p-5">
                <h2 className="text-lg font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.description}</p>
                {item.promptText ? (
                  <details className="mt-4 rounded-[1rem] border border-[var(--border)] bg-[var(--panel-soft)] p-4">
                    <summary className="cursor-pointer text-sm font-semibold text-slate-800">
                      {item.promptTitle || "Copy-paste prompt"}
                    </summary>
                    <div className="mt-4 space-y-3">
                      <pre className="overflow-x-auto whitespace-pre-wrap rounded-[0.9rem] bg-white/85 p-4 text-xs leading-6 text-slate-700">
                        {item.promptText}
                      </pre>
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(item.title, item.promptText)}
                        className="inline-flex h-10 items-center justify-center rounded-full bg-[var(--accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
                      >
                        {copiedPrompt === item.title ? "Copied" : "Copy prompt"}
                      </button>
                    </div>
                  </details>
                ) : null}
              </div>
            ))}
          </div>
        </ResultCard>

        <ResultCard title="Inputs used" description="The report uses your latest local form submission only.">
          <div className="flex flex-wrap gap-2 text-sm text-slate-700">
            <span className="pill">Frequency: {displayReport.frequencyLabel}</span>
            <span className="pill">Prompt confidence: {displayReport.promptingConfidence}/5</span>
            <span className="pill">Critical review: {displayReport.reviewHabit}/5</span>
            <span className="pill">
              Repeatable workflows: {displayReport.repeatableWorkflows ? "Yes" : "No"}
            </span>
            <span className="pill">Primary use case: {displayReport.primaryUseCase}</span>
            <span className="pill">Use cases selected: {displayReport.useCases.length}</span>
          </div>
          <p className="mt-5 text-sm leading-6 text-slate-600">
            Tools listed: {displayReport.tools || "None provided"}
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Improvement goal: {displayReport.improvementGoal}
          </p>
          {displayReport.promptExamples ? (
            <div className="mt-5 rounded-[1.25rem] border border-[var(--border)] bg-white/75 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                Prompt examples
              </h3>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
                {displayReport.promptExamples}
              </p>
            </div>
          ) : null}
          {displayReport.resumeText ? (
            <div className="mt-4 rounded-[1.25rem] border border-[var(--border)] bg-white/75 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                Resume context
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {displayReport.resumeText}
              </p>
            </div>
          ) : null}
        </ResultCard>
      </section>

    </main>
  );
}

function extractForm(result: AuditResult) {
  return {
    name: result.name,
    role: result.role,
    yearsExperience: result.yearsExperience,
    industry: result.industry,
    usageFrequency: result.usageFrequency,
    tools: result.tools,
    useCases: result.useCases,
    primaryUseCase: result.primaryUseCase,
    promptingConfidence: result.promptingConfidence,
    repeatableWorkflows: result.repeatableWorkflows,
    reviewHabit: result.reviewHabit,
    improvementGoal: result.improvementGoal,
    promptExamples: result.promptExamples,
    resumeText: result.resumeText,
  };
}

function createReportSignature(result: AuditResult) {
  return JSON.stringify({
    name: result.name,
    role: result.role,
    yearsExperience: result.yearsExperience,
    industry: result.industry,
    usageFrequency: result.usageFrequency,
    tools: result.tools,
    useCases: result.useCases,
    primaryUseCase: result.primaryUseCase,
    promptingConfidence: result.promptingConfidence,
    repeatableWorkflows: result.repeatableWorkflows,
    reviewHabit: result.reviewHabit,
    improvementGoal: result.improvementGoal,
    promptExamples: result.promptExamples,
    resumeText: result.resumeText,
  });
}

function readStoredGeneratedReport(signature: string): GeneratedReport | null {
  const saved = window.sessionStorage.getItem(AI_INSIGHTS_STORAGE_KEY);

  if (!saved) {
    return null;
  }

  try {
    const parsed = JSON.parse(saved) as {
      signature?: string;
      report?: unknown;
    };

    if (parsed.signature !== signature || !isGeneratedReport(parsed.report)) {
      return null;
    }

    if (parsed.report.source !== "ai") {
      return null;
    }

    return parsed.report;
  } catch {
    return null;
  }
}

function writeStoredGeneratedReport(signature: string, report: GeneratedReport) {
  if (report.source !== "ai") {
    return;
  }

  window.sessionStorage.setItem(
    AI_INSIGHTS_STORAGE_KEY,
    JSON.stringify({ signature, report }),
  );
}

function readStoredResult(): AuditResult | null {
  if (typeof window === "undefined") {
    return null;
  }

  const saved = window.sessionStorage.getItem(STORAGE_KEY);

  if (!saved) {
    return null;
  }

  try {
    const parsed = JSON.parse(saved);

    if (!isAuditResult(parsed)) {
      window.sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function isAuditResult(value: unknown): value is AuditResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AuditResult>;

  return (
    typeof candidate.name === "string" &&
    typeof candidate.role === "string" &&
    typeof candidate.overallScore === "number" &&
    typeof candidate.frequencyLabel === "string" &&
    Array.isArray(candidate.categories) &&
    Array.isArray(candidate.strengths) &&
    Array.isArray(candidate.blindSpots) &&
    Array.isArray(candidate.recommendations) &&
    Array.isArray(candidate.thirtyDayPlan) &&
    Array.isArray(candidate.projectIdeas) &&
    Array.isArray(candidate.useCases) &&
    typeof candidate.primaryUseCase === "string"
  );
}

function isGeneratedReport(value: unknown): value is GeneratedReport {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<GeneratedReport>;

  return (
    isAuditResult(value) &&
    typeof candidate.narrativeSummary === "string" &&
    typeof candidate.source === "string" &&
    Array.isArray(candidate.sanityChecks) &&
    candidate.sanityChecks.every((item) => typeof item === "string")
  );
}

function readStoredChallengeState(result?: AuditResult | null): PromptRewriteState | null {
  if (typeof window === "undefined") {
    return null;
  }

  const saved = window.sessionStorage.getItem(PROMPT_CHALLENGE_STORAGE_KEY);

  if (!saved) {
    return null;
  }

  try {
    const parsed = JSON.parse(saved);

    if (
      result &&
      !isPromptRewriteState(parsed, result.role, getBadPromptForRole(result.role))
    ) {
      window.sessionStorage.removeItem(PROMPT_CHALLENGE_STORAGE_KEY);
      return null;
    }

    return parsed as PromptRewriteState;
  } catch {
    window.sessionStorage.removeItem(PROMPT_CHALLENGE_STORAGE_KEY);
    return null;
  }
}
