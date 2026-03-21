import {
  getRoleRecommendations,
  getThirtyDayPlan,
} from "@/lib/recommendations";
import type {
  AuditFormData,
  AuditResult,
  FluencyBadge,
  RoleType,
  ScoreCategory,
  UseCaseType,
  UsageFrequency,
} from "@/lib/types";

type UseCaseMatchLevel = "strong" | "adjacent" | "off-role";

const frequencyScores: Record<UsageFrequency, number> = {
  daily: 20,
  few_times_a_week: 15,
  weekly: 10,
  rarely: 5,
};

const frequencyLabels: Record<UsageFrequency, string> = {
  daily: "Daily",
  few_times_a_week: "Few times a week",
  weekly: "Weekly",
  rarely: "Rarely",
};

export const roleUseCases: Record<RoleType, { strong: UseCaseType[]; adjacent: UseCaseType[] }> = {
  "Product Manager": {
    strong: [
      "PRD drafting",
      "User research synthesis",
      "Meeting note summarization",
      "Project planning",
      "Decision memo drafting",
      "Client or stakeholder communication",
    ],
    adjacent: ["Brainstorming ideas", "Presentation or slide drafting", "Email drafting"],
  },
  "Software Engineer": {
    strong: [
      "Code generation",
      "Data analysis",
      "Spreadsheet or data cleanup",
      "Project planning",
      "Meeting note summarization",
    ],
    adjacent: ["Decision memo drafting", "Day-to-day task support"],
  },
  Designer: {
    strong: [
      "Visual or design exploration",
      "User research synthesis",
      "Brainstorming ideas",
      "Presentation or slide drafting",
      "Meeting note summarization",
    ],
    adjacent: ["Client or stakeholder communication", "Project planning"],
  },
  Marketer: {
    strong: [
      "Email drafting",
      "Client or stakeholder communication",
      "Brainstorming ideas",
      "Proposal drafting",
      "Report writing",
      "Presentation or slide drafting",
    ],
    adjacent: ["User research synthesis", "Project planning"],
  },
  Consultant: {
    strong: [
      "Proposal drafting",
      "Client or stakeholder communication",
      "Presentation or slide drafting",
      "User research synthesis",
      "Data analysis",
      "Meeting note summarization",
    ],
    adjacent: ["Decision memo drafting", "Project planning"],
  },
  "Finance / Analyst": {
    strong: [
      "Data analysis",
      "Spreadsheet or data cleanup",
      "Report writing",
      "Decision memo drafting",
      "Meeting note summarization",
    ],
    adjacent: ["Presentation or slide drafting", "Project planning"],
  },
  "Operations Manager": {
    strong: [
      "Process or SOP documentation",
      "Project planning",
      "Meeting note summarization",
      "Client or stakeholder communication",
      "Report writing",
    ],
    adjacent: ["Spreadsheet or data cleanup", "Decision memo drafting"],
  },
  "Sales / BD": {
    strong: [
      "Outreach personalization",
      "CRM or account notes",
      "Client or stakeholder communication",
      "Proposal drafting",
      "Email drafting",
      "Interview preparation",
    ],
    adjacent: ["Presentation or slide drafting", "User research synthesis"],
  },
  "HR / People": {
    strong: [
      "Policy or people documentation",
      "Interview preparation",
      "Email drafting",
      "Client or stakeholder communication",
      "Meeting note summarization",
      "Report writing",
    ],
    adjacent: ["Project planning", "User research synthesis"],
  },
  General: {
    strong: [
      "Email drafting",
      "Meeting note summarization",
      "Project planning",
      "Day-to-day task support",
      "Decision memo drafting",
    ],
    adjacent: ["Report writing", "Brainstorming ideas", "Client or stakeholder communication"],
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function scoreRoleMatchedUseCases(role: RoleType, primaryUseCase: UseCaseType, useCases: UseCaseType[]) {
  const config = roleUseCases[role] ?? roleUseCases.General;
  let score = 0;

  if (config.strong.includes(primaryUseCase)) {
    score += 10;
  } else if (config.adjacent.includes(primaryUseCase)) {
    score += 5;
  }

  const remaining = useCases.filter((item) => item !== primaryUseCase).slice(0, 4);

  for (const useCase of remaining) {
    if (config.strong.includes(useCase)) {
      score += 3;
    } else if (config.adjacent.includes(useCase)) {
      score += 1;
    }
  }

  const alignedCount = [primaryUseCase, ...remaining].filter(
    (useCase) => config.strong.includes(useCase) || config.adjacent.includes(useCase),
  ).length;

  if (alignedCount >= 2) {
    score += 2;
  }

  return clamp(score, 0, 20);
}

export function getUseCaseMatchFeedback(
  role: RoleType,
  primaryUseCase: UseCaseType,
  useCases: UseCaseType[],
): {
  matchLevel: UseCaseMatchLevel;
  reason: string;
  recommendedUseCases: UseCaseType[];
} {
  const config = roleUseCases[role] ?? roleUseCases.General;
  const scoredUseCases = useCases.filter((item) => item !== primaryUseCase).slice(0, 4);
  const alignedCount = [primaryUseCase, ...scoredUseCases].filter(
    (useCase) => config.strong.includes(useCase) || config.adjacent.includes(useCase),
  ).length;

  if (config.strong.includes(primaryUseCase)) {
    return {
      matchLevel: "strong",
      reason: `${primaryUseCase} is a core use case for ${role}.`,
      recommendedUseCases: config.strong.slice(0, 3),
    };
  }

  if (config.adjacent.includes(primaryUseCase) || alignedCount >= 2) {
    return {
      matchLevel: "adjacent",
      reason: `${primaryUseCase} can help in ${role}, but there are more role-aligned use cases to build toward.`,
      recommendedUseCases: config.strong.slice(0, 3),
    };
  }

  return {
    matchLevel: "off-role",
    reason: `${primaryUseCase} is not one of the strongest leverage areas for ${role} in this scoring model.`,
    recommendedUseCases: config.strong.slice(0, 3),
  };
}

function scoreConfidence(value: number) {
  return clamp(value, 1, 5) * 4;
}

function scoreWorkflow(repeatableWorkflows: boolean) {
  return repeatableWorkflows ? 20 : 8;
}

function scoreReviewHabit(value: number) {
  return clamp(value, 1, 5) * 4;
}

function getScoreLabel(score: number) {
  if (score >= 80) return "Strong fluency. You already use AI with consistency and judgment.";
  if (score >= 60) return "Solid working fluency. You have useful habits and clear room to level up.";
  if (score >= 41) return "Early but promising fluency. You use AI, but the workflow is not stable yet.";
  return "Foundational fluency. Start with a few reliable workflows before expanding.";
}

export function getBadge(score: number): FluencyBadge {
  if (score <= 40) return { label: "AI Observer", emoji: "👀" };
  if (score <= 65) return { label: "AI Practitioner", emoji: "🛠️" };
  if (score <= 85) return { label: "AI Strategist", emoji: "🧭" };
  return { label: "AI Leader", emoji: "🚀" };
}

function buildCategories(parts: {
  frequency: number;
  useCaseFit: number;
  prompting: number;
  workflow: number;
  review: number;
}): ScoreCategory[] {
  return [
    {
      name: "Adoption",
      score: Math.round(((parts.frequency + parts.useCaseFit) / 40) * 100),
    },
    {
      name: "Prompting",
      score: Math.round((parts.prompting / 20) * 100),
    },
    {
      name: "Workflow",
      score: Math.round((parts.workflow / 20) * 100),
    },
    {
      name: "Judgment",
      score: Math.round((parts.review / 20) * 100),
    },
  ];
}

function buildStrengths(parts: {
  frequency: number;
  useCaseFit: number;
  prompting: number;
  workflow: number;
  review: number;
}) {
  const strengths: string[] = [];

  if (parts.frequency >= 15) strengths.push("You use AI often enough for habits to stick.");
  if (parts.useCaseFit >= 14) strengths.push("Your AI use cases are well aligned with the highest-value work in your role.");
  if (parts.prompting >= 16) strengths.push("Your prompting confidence is strong enough to get more structured outputs.");
  if (parts.workflow >= 20) strengths.push("You already think in repeatable workflows instead of isolated prompts.");
  if (parts.review >= 16) strengths.push("You show healthy skepticism and review AI output critically.");

  return strengths.slice(0, 3);
}

function buildBlindSpots(parts: {
  frequency: number;
  useCaseFit: number;
  prompting: number;
  workflow: number;
  review: number;
}) {
  const blindSpots: string[] = [];

  if (parts.frequency <= 10) blindSpots.push("Your usage is still infrequent, which makes it harder to build reliable AI habits.");
  if (parts.useCaseFit <= 8) blindSpots.push("Your current AI use cases are not strongly matched to the highest-value work in your role yet.");
  if (parts.prompting <= 12) blindSpots.push("Prompting confidence is still developing, which can limit output quality and consistency.");
  if (parts.workflow < 20) blindSpots.push("You are not yet turning AI into repeatable workflows that save time consistently.");
  if (parts.review <= 12) blindSpots.push("Critical review habits need work so low-quality output does not slip into real decisions.");

  return blindSpots.slice(0, 3);
}

export function buildAuditResult(form: AuditFormData): AuditResult {
  // Keep scoring deliberately simple for the MVP. Each input maps to a fixed,
  // deterministic score so the report is transparent and easy to tweak.
  const frequency = frequencyScores[form.usageFrequency];
  const useCaseFit = scoreRoleMatchedUseCases(form.role, form.primaryUseCase, form.useCases);
  const prompting = scoreConfidence(form.promptingConfidence);
  const workflow = scoreWorkflow(form.repeatableWorkflows);
  const review = scoreReviewHabit(form.reviewHabit);

  // Total score is capped at 100 and only uses the five requested dimensions.
  const overallScore = frequency + useCaseFit + prompting + workflow + review;
  const roleOutputs = getRoleRecommendations(form.role, overallScore);
  const strengths = buildStrengths({
    frequency,
    useCaseFit,
    prompting,
    workflow,
    review,
  });
  const blindSpots = buildBlindSpots({
    frequency,
    useCaseFit,
    prompting,
    workflow,
    review,
  });

  return {
    ...form,
    overallScore,
    scoreLabel: getScoreLabel(overallScore),
    categories: buildCategories({
      frequency,
      useCaseFit,
      prompting,
      workflow,
      review,
    }),
    strengths:
      strengths.length > 0
        ? strengths
        : ["You already have a base to build on; the next step is making your best use case more repeatable."],
    blindSpots:
      blindSpots.length > 0
        ? blindSpots
        : ["Your main opportunity is packaging strong habits into repeatable workflows and reusable templates."],
    recommendations: roleOutputs.recommendations.slice(0, 3),
    thirtyDayPlan: getThirtyDayPlan(form.role, overallScore),
    projectIdeas: roleOutputs.projectIdeas.slice(0, 2),
    frequencyLabel: frequencyLabels[form.usageFrequency],
  };
}
