import { NextResponse } from "next/server";
import { buildDeterministicGeneratedReport, generateAiReport } from "@/lib/ai/insights";
import { buildAuditResult } from "@/lib/scoring";
import type { AuditFormData, InsightsRequest, InsightsResponse } from "@/lib/types";

export const runtime = "nodejs";
const MAX_BODY_LENGTH = 25_000;

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();

    if (rawBody.length > MAX_BODY_LENGTH) {
      return NextResponse.json<InsightsResponse>(
        {
          report: null,
          error: "Request is too large.",
        },
        { status: 413 },
      );
    }

    const body = JSON.parse(rawBody) as Partial<InsightsRequest>;

    if (!isAuditFormData(body.form)) {
      return NextResponse.json<InsightsResponse>(
        {
          report: null,
          error: "Invalid audit form payload.",
        },
        { status: 400 },
      );
    }

    const result = buildAuditResult(body.form);

    try {
      const report = await generateAiReport(body.form, result);

      return NextResponse.json<InsightsResponse>({ report });
    } catch (error) {
      console.error("AI report generation failed, using deterministic fallback", error);
      const fallbackReason = getClientSafeError(error);
      const report = buildDeterministicGeneratedReport(
        body.form,
        result,
        fallbackReason,
      );

      return NextResponse.json<InsightsResponse>({ report });
    }
  } catch (error) {
    console.error("AI insights route error", error);

    return NextResponse.json<InsightsResponse>(
      {
        report: null,
        error: getClientSafeError(error),
      },
      { status: 500 },
    );
  }
}

function getClientSafeError(error: unknown) {
  if (error instanceof SyntaxError) {
    return "Invalid request body.";
  }

  if (error instanceof Error) {
    if (error.message.includes("Missing OPENAI_API_KEY")) {
      return "AI insights are not configured on the server.";
    }

    if (error.message.includes("OpenAI request failed")) {
      return "The AI provider request failed. Please try again.";
    }

    if (error.message.includes("expected report shape")) {
      return "The AI response could not be parsed, so a deterministic fallback was used.";
    }

    if (error.message.includes("OpenAI returned an empty response")) {
      return "The AI response was empty, so a deterministic fallback was used.";
    }
  }

  return "Unable to generate AI insights right now.";
}

function isAuditFormData(value: unknown): value is AuditFormData {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AuditFormData>;
  const validUsageFrequencies = [
    "daily",
    "few_times_a_week",
    "weekly",
    "rarely",
  ];
  const validRoles = [
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
  ];

  return (
    typeof candidate.name === "string" &&
    candidate.name.length <= 200 &&
    typeof candidate.role === "string" &&
    validRoles.includes(candidate.role) &&
    typeof candidate.yearsExperience === "string" &&
    candidate.yearsExperience.length <= 20 &&
    typeof candidate.industry === "string" &&
    candidate.industry.length <= 200 &&
    typeof candidate.usageFrequency === "string" &&
    validUsageFrequencies.includes(candidate.usageFrequency) &&
    typeof candidate.tools === "string" &&
    candidate.tools.length <= 500 &&
    Array.isArray(candidate.useCases) &&
    candidate.useCases.length <= 25 &&
    candidate.useCases.every((item) => typeof item === "string") &&
    typeof candidate.primaryUseCase === "string" &&
    typeof candidate.promptingConfidence === "number" &&
    candidate.promptingConfidence >= 1 &&
    candidate.promptingConfidence <= 5 &&
    typeof candidate.repeatableWorkflows === "boolean" &&
    typeof candidate.reviewHabit === "number" &&
    candidate.reviewHabit >= 1 &&
    candidate.reviewHabit <= 5 &&
    typeof candidate.improvementGoal === "string" &&
    candidate.improvementGoal.length <= 500 &&
    typeof candidate.promptExamples === "string" &&
    candidate.promptExamples.length <= 5_000 &&
    typeof candidate.resumeText === "string"
    && candidate.resumeText.length <= 5_000
  );
}
