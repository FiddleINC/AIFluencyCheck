import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type SubmissionPayload = {
  role: string;
  industry: string;
  years_experience: number;
  frequency: string;
  use_cases: string[];
  primary_use_case: string;
  prompting_confidence: number;
  repeatable_workflows: boolean;
  critical_review_habit: number;
};

const MAX_BODY_LENGTH = 5_000;
const MAX_TEXT_LENGTH = 200;
const MAX_USE_CASES = 25;
const VALID_ROLES = new Set([
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
]);
const VALID_FREQUENCIES = new Set([
  "daily",
  "few_times_a_week",
  "weekly",
  "rarely",
]);
const VALID_USE_CASES = new Set([
  "PRD drafting",
  "User research synthesis",
  "Code generation",
  "Data analysis",
  "Brainstorming ideas",
  "Meeting note summarization",
  "Project planning",
  "Spreadsheet or data cleanup",
  "Client or stakeholder communication",
  "Visual or design exploration",
  "Email drafting",
  "Presentation or slide drafting",
  "Decision memo drafting",
  "Proposal drafting",
  "Report writing",
  "Process or SOP documentation",
  "Outreach personalization",
  "CRM or account notes",
  "Interview preparation",
  "Policy or people documentation",
  "Day-to-day task support",
]);

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    if (rawBody.length > MAX_BODY_LENGTH) {
      return NextResponse.json({ ok: true });
    }

    const body = JSON.parse(rawBody) as Partial<Record<keyof SubmissionPayload, unknown>>;
    const payload = sanitizeSubmission(body);

    if (!payload) {
      return NextResponse.json({ ok: true });
    }

    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("Missing DATABASE_URL");
    }

    const sql = neon(databaseUrl);

    await sql`
      INSERT INTO submissions (
        role,
        industry,
        years_experience,
        frequency,
        use_cases,
        primary_use_case,
        prompting_confidence,
        repeatable_workflows,
        critical_review_habit
      ) VALUES (
        ${payload.role},
        ${payload.industry},
        ${payload.years_experience},
        ${payload.frequency},
        ${payload.use_cases},
        ${payload.primary_use_case},
        ${payload.prompting_confidence},
        ${payload.repeatable_workflows},
        ${payload.critical_review_habit}
      )
    `;
  } catch (error) {
    console.error("Anonymous tracking failed", error);
  }

  return NextResponse.json({ ok: true });
}

function sanitizeSubmission(
  value: Partial<Record<keyof SubmissionPayload, unknown>>,
): SubmissionPayload | null {
  const role = sanitizeText(value.role);
  const industry = sanitizeText(value.industry);
  const frequency = sanitizeText(value.frequency);
  const primaryUseCase = sanitizeText(value.primary_use_case);
  const yearsExperience = sanitizeSmallInt(value.years_experience, 0, 50);
  const promptingConfidence = sanitizeSmallInt(value.prompting_confidence, 1, 5);
  const criticalReviewHabit = sanitizeSmallInt(value.critical_review_habit, 1, 5);

  if (
    !role
    || !industry
    || !frequency
    || !primaryUseCase
    || yearsExperience === null
    || promptingConfidence === null
    || criticalReviewHabit === null
    || typeof value.repeatable_workflows !== "boolean"
  ) {
    return null;
  }

  if (
    !VALID_ROLES.has(role)
    || !VALID_FREQUENCIES.has(frequency)
    || !VALID_USE_CASES.has(primaryUseCase)
  ) {
    return null;
  }

  if (!Array.isArray(value.use_cases) || value.use_cases.length === 0 || value.use_cases.length > MAX_USE_CASES) {
    return null;
  }

  const useCases = value.use_cases
    .map((item) => sanitizeText(item))
    .filter((item): item is string => item !== null);

  if (
    useCases.length !== value.use_cases.length
    || useCases.some((item) => !VALID_USE_CASES.has(item))
  ) {
    return null;
  }

  return {
    role,
    industry,
    years_experience: yearsExperience,
    frequency,
    use_cases: useCases,
    primary_use_case: primaryUseCase,
    prompting_confidence: promptingConfidence,
    repeatable_workflows: value.repeatable_workflows,
    critical_review_habit: criticalReviewHabit,
  };
}

function sanitizeText(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed || trimmed.length > MAX_TEXT_LENGTH) {
    return null;
  }

  return trimmed;
}

function sanitizeSmallInt(value: unknown, min: number, max: number) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    return null;
  }

  return value;
}
