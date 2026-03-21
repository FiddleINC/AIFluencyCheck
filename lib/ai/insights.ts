import type {
  AuditFormData,
  AuditResult,
  GeneratedReport,
  ProjectIdea,
  ScoreCategory,
} from "@/lib/types";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

function trimText(value: string, maxLength: number) {
  const normalized = value.trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength)}...`;
}

const EXPECTED_CATEGORY_NAMES = ["Adoption", "Prompting", "Workflow", "Judgment"] as const;

function getCategoryBand(score: number) {
  if (score <= 39) return "low";
  if (score <= 69) return "developing";
  if (score <= 89) return "strong";
  return "fully established";
}

function getCategoryInterpretation(name: string, score: number) {
  const band = getCategoryBand(score);

  if (name === "Adoption") {
    if (band === "low") return "AI usage is still inconsistent or not yet well matched to the user's role.";
    if (band === "developing") return "AI is used regularly, but role-fit and consistency are still uneven.";
    if (band === "strong") return "AI is used consistently in role-relevant ways.";
    return "AI usage is highly consistent and strongly aligned with the work that matters most in the role.";
  }

  if (name === "Prompting") {
    if (band === "low") return "Prompting is still basic and likely produces uneven outputs.";
    if (band === "developing") return "Prompting is functional but could be sharper and more structured.";
    if (band === "strong") return "Prompting is clear and usually produces structured results.";
    return "Prompting is highly structured and reliably shapes strong outputs.";
  }

  if (name === "Workflow") {
    if (band === "low") return "No repeatable workflows are really in place yet.";
    if (band === "developing") return "Some workflow habits exist, but they are not reliable or repeatable yet.";
    if (band === "strong") return "Useful repeatable workflows are in place for important tasks.";
    return "Fully repeatable workflows are already in place.";
  }

  if (band === "low") return "AI outputs are not being reviewed critically enough yet.";
  if (band === "developing") return "Review habits exist, but quality checks are still inconsistent.";
  if (band === "strong") return "Outputs are usually reviewed with healthy judgment.";
  return "Outputs are reviewed critically and consistently before use.";
}

function getCategoryWhyItMatters(name: string) {
  if (name === "Adoption") return "Shows whether AI is actually part of the user's working habits and role-relevant tasks.";
  if (name === "Prompting") return "Shows how well the user can steer AI toward useful, structured outputs.";
  if (name === "Workflow") return "Shows whether AI is being turned into repeatable systems instead of one-off usage.";
  return "Shows whether the user applies judgment and review before trusting AI outputs.";
}

function buildProjectPrompt(form: AuditFormData, project: ProjectIdea) {
  return [
    `You are helping a ${form.role} in ${form.industry}.`,
    `Create a practical output for this mini project: ${project.title}.`,
    `Project description: ${project.description}`,
    `Current AI use cases: ${form.useCases.join(", ") || "Not provided"}.`,
    `Main improvement goal: ${form.improvementGoal}`,
    `Tools they use: ${form.tools}`,
    "Return a first working version with clear assumptions, steps, and a concise output format.",
  ].join("\n");
}

function buildInsightPayload(form: AuditFormData, result: AuditResult) {
  return {
    person: {
      role: form.role,
      yearsExperience: form.yearsExperience,
      industry: form.industry,
    },
    aiUsage: {
      usageFrequency: form.usageFrequency,
      tools: form.tools,
      useCases: form.useCases,
      primaryUseCase: form.primaryUseCase,
      promptingConfidence: form.promptingConfidence,
      repeatableWorkflows: form.repeatableWorkflows,
      criticalReviewHabit: form.reviewHabit,
      improvementGoal: form.improvementGoal,
      promptExamples: trimText(form.promptExamples, 1600),
      resumeText: trimText(form.resumeText, 1600),
    },
    deterministicBaseline: {
      overallScore: result.overallScore,
      scoreLabel: result.scoreLabel,
      categories: result.categories.map((category) => ({
        ...category,
        band: getCategoryBand(category.score),
        interpretation: getCategoryInterpretation(category.name, category.score),
        whyItMatters: getCategoryWhyItMatters(category.name),
      })),
      strengths: result.strengths,
      blindSpots: result.blindSpots,
      recommendations: result.recommendations,
      thirtyDayPlan: result.thirtyDayPlan,
      projectIdeas: result.projectIdeas,
    },
  };
}

function buildMessages(form: AuditFormData, result: AuditResult) {
  const payload = buildInsightPayload(form, result);

  return [
    {
      role: "system",
      content:
        "You are an AI workflow assessor. Produce a complete AI fluency report in strict JSON only. Score from 0 to 100 using this rubric: frequency of AI use, role alignment of selected use cases, prompting confidence, repeatable workflow maturity, and critical review habit. Use the deterministic baseline as evidence, not as a required final answer. Reason from the category scores, category bands, and category interpretations before writing blind spots or recommendations. Blind spots should only address areas where the score or interpretation indicates a real gap. Do not invent weaknesses in areas marked strong or fully established. Recommendations must directly respond to the weakest evidenced areas first. Return JSON only with keys: overallScore, scoreLabel, categories, strengths, blindSpots, recommendations, thirtyDayPlan, projectIdeas, narrativeSummary, sanityChecks. categories must contain exactly 4 items named Adoption, Prompting, Workflow, Judgment with scores 0-100. strengths 3 items. blindSpots 3 items. recommendations 3 items. thirtyDayPlan 4 items. projectIdeas 2 items; each item must include title, description, promptTitle, promptText. narrativeSummary should be 2-3 concise sentences. sanityChecks should contain exactly 2 concise bullets. Ground everything in the provided input. Do not invent credentials, achievements, or tools. Keep language practical and specific.",
    },
    {
      role: "user",
      content: `Generate the report for this audit payload:\n${JSON.stringify(payload, null, 2)}`,
    },
  ];
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function sanitizeCategory(category: ScoreCategory) {
  return {
    name: category.name,
    score: clampScore(category.score),
  } satisfies ScoreCategory;
}

function enrichProjectIdea(form: AuditFormData, project: ProjectIdea): ProjectIdea {
  return {
    ...project,
    promptTitle: project.promptTitle || `Prompt for ${project.title}`,
    promptText: project.promptText || buildProjectPrompt(form, project),
  };
}

export function buildDeterministicGeneratedReport(
  form: AuditFormData,
  result: AuditResult,
  fallbackReason?: string,
): GeneratedReport {
  return {
    ...result,
    projectIdeas: result.projectIdeas.map((project) => enrichProjectIdea(form, project)),
    narrativeSummary: result.scoreLabel,
    sanityChecks: result.blindSpots.slice(0, 2),
    source: "deterministic",
    fallbackReason,
  };
}

function asStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeToCount(items: string[], fallback: string[], count: number) {
  const merged = [...items];

  for (const item of fallback) {
    if (merged.length >= count) {
      break;
    }

    if (!merged.includes(item)) {
      merged.push(item);
    }
  }

  return merged.slice(0, count);
}

function withGenericFillers(items: string[], count: number, fillerPrefix: string) {
  const merged = [...items];

  while (merged.length < count) {
    merged.push(`${fillerPrefix} ${merged.length + 1}.`);
  }

  return merged.slice(0, count);
}

function normalizeCategories(value: unknown, fallback: ScoreCategory[]) {
  const provided = Array.isArray(value)
    ? value.filter(
        (item): item is { name?: unknown; score?: unknown } =>
          Boolean(item) && typeof item === "object",
      )
    : [];

  return EXPECTED_CATEGORY_NAMES.map((name, index) => {
    const match = provided.find((item) => item.name === name);

    if (match && typeof match.score === "number") {
      return sanitizeCategory({ name, score: match.score });
    }

    return sanitizeCategory(fallback[index] ?? { name, score: 0 });
  });
}

function normalizeProjectIdeas(form: AuditFormData, value: unknown, fallback: ProjectIdea[]) {
  const provided = Array.isArray(value)
    ? value.filter(
        (item): item is Partial<ProjectIdea> => Boolean(item) && typeof item === "object",
      )
    : [];

  const normalized = provided
    .map((project, index) => {
      const fallbackProject = fallback[index];
      const title = typeof project.title === "string" ? project.title.trim() : fallbackProject?.title;
      const description =
        typeof project.description === "string"
          ? project.description.trim()
          : fallbackProject?.description;

      if (!title || !description) {
        return null;
      }

      return enrichProjectIdea(form, {
        title,
        description,
        promptTitle:
          typeof project.promptTitle === "string" ? project.promptTitle.trim() : undefined,
        promptText:
          typeof project.promptText === "string" ? project.promptText.trim() : undefined,
      });
    })
    .filter((project): project is ProjectIdea => Boolean(project));

  while (normalized.length < 2 && fallback[normalized.length]) {
    normalized.push(enrichProjectIdea(form, fallback[normalized.length]));
  }

  return normalized.slice(0, 2);
}

function normalizeGeneratedReport(
  form: AuditFormData,
  result: AuditResult,
  value: unknown,
): GeneratedReport | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<GeneratedReport>;
  const overallScore =
    typeof candidate.overallScore === "number" ? clampScore(candidate.overallScore) : result.overallScore;
  const scoreLabel =
    typeof candidate.scoreLabel === "string" && candidate.scoreLabel.trim()
      ? candidate.scoreLabel.trim()
      : result.scoreLabel;
  const narrativeSummary =
    typeof candidate.narrativeSummary === "string" && candidate.narrativeSummary.trim()
      ? candidate.narrativeSummary.trim()
      : scoreLabel;

  const strengths = normalizeToCount(asStringArray(candidate.strengths), result.strengths, 3);
  const blindSpots = normalizeToCount(asStringArray(candidate.blindSpots), result.blindSpots, 3);
  const recommendations = normalizeToCount(
    asStringArray(candidate.recommendations),
    result.recommendations,
    3,
  );
  const thirtyDayPlan = normalizeToCount(
    asStringArray(candidate.thirtyDayPlan),
    result.thirtyDayPlan,
    4,
  );
  const sanityChecks = normalizeToCount(
    asStringArray(candidate.sanityChecks),
    result.blindSpots.slice(0, 2),
    2,
  );
  const projectIdeas = normalizeProjectIdeas(form, candidate.projectIdeas, result.projectIdeas);

  const ensuredStrengths = withGenericFillers(
    strengths,
    3,
    "Keep building a stronger repeatable AI workflow area",
  );
  const ensuredBlindSpots = withGenericFillers(
    blindSpots,
    3,
    "Pressure-test an area where your AI workflow is still inconsistent",
  );
  const ensuredRecommendations = withGenericFillers(
    recommendations,
    3,
    "Choose one practical AI improvement step",
  );
  const ensuredThirtyDayPlan = withGenericFillers(
    thirtyDayPlan,
    4,
    "Take one concrete weekly action to improve AI fluency",
  );
  const ensuredSanityChecks = withGenericFillers(
    sanityChecks,
    2,
    "Validate one important assumption in this report",
  );

  if (projectIdeas.length === 0) {
    return null;
  }

  return {
    ...result,
    overallScore,
    scoreLabel,
    categories: normalizeCategories(candidate.categories, result.categories),
    strengths: ensuredStrengths,
    blindSpots: ensuredBlindSpots,
    recommendations: ensuredRecommendations,
    thirtyDayPlan: ensuredThirtyDayPlan,
    projectIdeas,
    narrativeSummary,
    sanityChecks: ensuredSanityChecks,
    source: "ai",
  } satisfies GeneratedReport;
}

export async function generateAiReport(form: AuditFormData, result: AuditResult) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY.");
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
  const response = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: buildMessages(form, result),
    }),
    signal: AbortSignal.timeout(25000),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorBody}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string | null;
      };
    }>;
  };

  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  const parsed = JSON.parse(content) as unknown;
  const normalizedReport = normalizeGeneratedReport(form, result, parsed);

  if (!normalizedReport) {
    throw new Error("OpenAI response did not match the expected report shape.");
  }

  return normalizedReport;
}
