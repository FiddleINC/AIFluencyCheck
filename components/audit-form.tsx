"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FORM_STORAGE_KEY,
  STORAGE_KEY,
  defaultAuditFormValues,
  useCaseOptions,
} from "@/lib/example-data";
import { buildAuditResult, getUseCaseMatchFeedback } from "@/lib/scoring";
import type { AuditFormData } from "@/lib/types";

const frequencyOptions = [
  { label: "Daily", value: "daily" },
  { label: "Few times a week", value: "few_times_a_week" },
  { label: "Weekly", value: "weekly" },
  { label: "Rarely", value: "rarely" },
] as const;

const roleOptions = [
  "Product Manager",
  "Software Engineer",
  "Designer",
  "Marketer",
  "Consultant",
  "Finance / Analyst",
  "Operations Manager",
  "Sales / BD",
  "HR / People",
  "General",
] as const;

export function AuditForm() {
  const router = useRouter();
  const [form, setForm] = useState<AuditFormData>(defaultAuditFormValues);
  const useCaseMatch = getUseCaseMatchFeedback(
    form.role,
    form.primaryUseCase,
    form.useCases,
  );

  useEffect(() => {
    const saved = window.sessionStorage.getItem(FORM_STORAGE_KEY);

    if (!saved) {
      return;
    }

    try {
      const parsed = JSON.parse(saved);

      if (isAuditFormData(parsed)) {
        setForm(parsed);
      }
    } catch {
      window.sessionStorage.removeItem(FORM_STORAGE_KEY);
    }
  }, []);

  function updateField<K extends keyof AuditFormData>(
    key: K,
    value: AuditFormData[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleUseCase(useCase: AuditFormData["primaryUseCase"]) {
    setForm((current) => {
      const exists = current.useCases.includes(useCase);
      const nextUseCases = exists
        ? current.useCases.filter((item) => item !== useCase)
        : [...current.useCases, useCase];

      if (nextUseCases.length === 0) {
        return current;
      }

      return {
        ...current,
        useCases: nextUseCases,
        primaryUseCase: exists && current.primaryUseCase === useCase
          ? (nextUseCases[0] ?? defaultAuditFormValues.primaryUseCase)
          : current.primaryUseCase,
      };
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const result = buildAuditResult(form);
    window.sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(form));
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
    router.push("/results");
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 sm:p-8">
      <div className="grid gap-6 md:grid-cols-2">

        {/* Section 1: About you */}
        <div className="md:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">About you</p>
        </div>

        <Field label="Name">
          <input
            className="field"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Your name"
            required
          />
        </Field>

        <Field label="Role">
          <select
            className="field"
            value={form.role}
            onChange={(event) =>
              updateField("role", event.target.value as AuditFormData["role"])
            }
          >
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Years of experience">
          <input
            className="field"
            type="number"
            min="0"
            max="50"
            value={form.yearsExperience}
            onChange={(event) => updateField("yearsExperience", event.target.value)}
            required
          />
        </Field>

        <Field label="Industry">
          <input
            className="field"
            value={form.industry}
            onChange={(event) => updateField("industry", event.target.value)}
            placeholder="SaaS, healthcare, media..."
            required
          />
        </Field>

        {/* Section 2: How you use AI */}
        <div className="md:col-span-2 border-t border-[var(--border)] pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">How you use AI</p>
        </div>

        <Field label="How often do you use AI?">
          <select
            className="field"
            value={form.usageFrequency}
            onChange={(event) =>
              updateField(
                "usageFrequency",
                event.target.value as AuditFormData["usageFrequency"],
              )
            }
          >
            {frequencyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Which AI tools do you use?">
          <input
            className="field"
            value={form.tools}
            onChange={(event) => updateField("tools", event.target.value)}
            placeholder="ChatGPT, Claude, Perplexity, Cursor"
            required
          />
        </Field>

        <div className="md:col-span-2">
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-slate-800">
              Which of these do you use AI for?
            </legend>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {useCaseOptions.map((option) => {
                const checked = form.useCases.includes(option);

                return (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                      checked
                        ? "border-[var(--accent)] bg-[rgba(177,93,63,0.08)]"
                        : "border-[var(--border)] bg-white/70 hover:bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checked}
                      onChange={() => toggleUseCase(option)}
                    />
                    <span className="leading-6 text-slate-700">{option}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
          <div className="mt-4 rounded-[1.25rem] border border-[var(--border)] bg-white/75 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Use-case match: {formatMatchLevel(useCaseMatch.matchLevel)}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{useCaseMatch.reason}</p>
              </div>
              <div className="sm:max-w-xs">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Recommended for your role
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {useCaseMatch.recommendedUseCases.map((useCase) => (
                    <span key={useCase} className="pill text-xs text-slate-700">
                      {useCase}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Habits & goals */}
        <div className="md:col-span-2 border-t border-[var(--border)] pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--accent-strong)]">Habits &amp; goals</p>
        </div>

        <Field label="What's your primary use case?">
          <select
            className="field"
            value={form.primaryUseCase}
            onChange={(event) =>
              setForm((current) => {
                const primaryUseCase = event.target.value as AuditFormData["primaryUseCase"];

                return {
                  ...current,
                  primaryUseCase,
                  useCases: current.useCases.includes(primaryUseCase)
                    ? current.useCases
                    : [...current.useCases, primaryUseCase],
                };
              })
            }
          >
            {useCaseOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </Field>

        <Field label="How confident are you with prompting?">
          <select
            className="field"
            value={form.promptingConfidence}
            onChange={(event) =>
              updateField("promptingConfidence", Number(event.target.value))
            }
          >
            <option value={1}>1 – Just starting out</option>
            <option value={2}>2 – Basic prompts only</option>
            <option value={3}>3 – Getting consistent results</option>
            <option value={4}>4 – Structured and effective</option>
            <option value={5}>5 – Advanced, multi-step prompts</option>
          </select>
        </Field>

        <Field label="Do you use AI for repeatable workflows?">
          <select
            className="field"
            value={form.repeatableWorkflows ? "yes" : "no"}
            onChange={(event) =>
              updateField("repeatableWorkflows", event.target.value === "yes")
            }
          >
            <option value="yes">Yes – I have defined workflows I reuse</option>
            <option value="no">No – mostly one-off prompts</option>
          </select>
        </Field>

        <Field label="Do you critically review AI outputs?">
          <select
            className="field"
            value={form.reviewHabit}
            onChange={(event) => updateField("reviewHabit", Number(event.target.value))}
          >
            <option value={1}>1 – I usually accept as-is</option>
            <option value={2}>2 – Light skimming</option>
            <option value={3}>3 – I check key facts</option>
            <option value={4}>4 – I review carefully</option>
            <option value={5}>5 – I always verify and edit</option>
          </select>
        </Field>

        <Field label="What do you want to improve with AI?">
          <input
            className="field"
            value={form.improvementGoal}
            onChange={(event) => updateField("improvementGoal", event.target.value)}
            placeholder="Save time, write better docs, automate analysis..."
            required
          />
        </Field>

        <div className="md:col-span-2">
          <Field label="Optional: paste 3 example prompts you often use">
            <textarea
              className="field min-h-32"
              value={form.promptExamples}
              onChange={(event) => updateField("promptExamples", event.target.value)}
              placeholder="1. Summarize user interview notes..."
            />
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field label="Optional: paste short resume text">
            <textarea
              className="field min-h-32"
              value={form.resumeText}
              onChange={(event) => updateField("resumeText", event.target.value)}
              placeholder="Short profile or role summary"
            />
          </Field>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-4 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-slate-500">
          Your answers stay in your browser. Nothing is saved to a server.
        </p>
        <button
          type="submit"
          className="inline-flex h-12 items-center justify-center rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
        >
          Generate report
        </button>
      </div>
    </form>
  );
}

function formatMatchLevel(matchLevel: "strong" | "adjacent" | "off-role") {
  if (matchLevel === "strong") return "Strong";
  if (matchLevel === "adjacent") return "Adjacent";
  return "Off-role";
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

function Field({
  label,
  children,
}: Readonly<{ label: string; children: React.ReactNode }>) {
  return (
    <label className="block">
      <span className="mb-3 block text-sm font-semibold text-slate-800">{label}</span>
      {children}
    </label>
  );
}
