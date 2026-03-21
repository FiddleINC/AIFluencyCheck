import type {
  AuditFormData,
  PromptRewriteCriterion,
  PromptRewriteResult,
  PromptRewriteState,
  RoleType,
} from "@/lib/types";

const badPromptsByRole: Record<RoleType, string> = {
  "Product Manager": "Write me a PRD for a new AI feature.",
  "Software Engineer": "Build this feature for me.",
  Designer: "Design a better onboarding flow.",
  Marketer: "Make a marketing plan for this product.",
  Consultant: "Help me make this client project better.",
  "Finance / Analyst": "Look at these numbers and tell me what matters.",
  "Operations Manager": "Fix this process and make the team more efficient.",
  "Sales / BD": "Write something to help me win this deal.",
  "HR / People": "Help with this people issue.",
  General: "Help me use AI better at work.",
};

const contextSignals = [
  "user",
  "customer",
  "audience",
  "for",
  "because",
  "goal",
  "background",
  "context",
  "industry",
  "product",
  "team",
  "role",
];

const formatSignals = [
  "bullet",
  "table",
  "json",
  "outline",
  "section",
  "step-by-step",
  "format",
  "template",
  "list",
];

const constraintSignals = [
  "limit",
  "max",
  "minimum",
  "must",
  "should",
  "do not",
  "avoid",
  "only",
  "tone",
  "deadline",
  "success criteria",
  "constraint",
];

const roleContextSignals: Record<RoleType, string[]> = {
  "Product Manager": ["user", "stakeholder", "metric", "roadmap", "prd"],
  "Software Engineer": ["api", "code", "test", "performance", "bug"],
  Designer: ["user", "screen", "flow", "ux", "accessibility"],
  Marketer: ["audience", "campaign", "channel", "positioning", "conversion"],
  Consultant: ["client", "proposal", "deck", "workshop", "recommendation"],
  "Finance / Analyst": ["variance", "forecast", "numbers", "model", "report"],
  "Operations Manager": ["process", "handoff", "sop", "team", "status"],
  "Sales / BD": ["prospect", "deal", "buyer", "outreach", "objection"],
  "HR / People": ["policy", "candidate", "employee", "interview", "manager"],
  General: ["task", "workflow", "document", "meeting", "priority"],
};

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function hasSignal(prompt: string, signals: string[]) {
  return signals.some((signal) => prompt.includes(signal));
}

function wordCount(prompt: string) {
  return normalize(prompt).split(/\s+/).filter(Boolean).length;
}

export function getBadPromptForRole(role: RoleType) {
  return badPromptsByRole[role] ?? badPromptsByRole.General;
}

export function scorePromptRewrite(
  role: RoleType,
  badPrompt: string,
  rewrittenPrompt: string,
): PromptRewriteResult {
  const prompt = normalize(rewrittenPrompt);
  const words = wordCount(rewrittenPrompt);
  const nearCopy = prompt === normalize(badPrompt) || words < 5;

  const contextHit =
    !nearCopy &&
    words >= 10 &&
    (hasSignal(prompt, contextSignals) || hasSignal(prompt, roleContextSignals[role]));
  const formatHit = !nearCopy && hasSignal(prompt, formatSignals);
  const constraintHit =
    !nearCopy &&
    (hasSignal(prompt, constraintSignals) ||
      /(under|within|exactly|at most|no more than|less than)\s+\d+/.test(prompt));

  const criteria: PromptRewriteCriterion[] = [
    {
      label: "Added context",
      hit: contextHit,
      detail: contextHit
        ? "You gave the model more background, audience, or goal context."
        : "Add who this is for, the goal, or key background so the model has context.",
    },
    {
      label: "Specified format",
      hit: formatHit,
      detail: formatHit
        ? "You asked for a clearer output format or structure."
        : "Ask for a format like bullets, sections, JSON, outline, or a table.",
    },
    {
      label: "Added constraints",
      hit: constraintHit,
      detail: constraintHit
        ? "You added useful limits, rules, or success criteria."
        : "Add constraints like length, tone, must-have sections, or what to avoid.",
    },
  ];

  return {
    score: criteria.filter((item) => item.hit).length,
    criteria,
  };
}

export function extractChallengeRole(form: AuditFormData) {
  return form.role;
}

export function isPromptRewriteState(
  value: unknown,
  expectedRole?: RoleType,
  expectedBadPrompt?: string,
): value is PromptRewriteState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<PromptRewriteState>;

  return (
    typeof candidate.role === "string" &&
    (!expectedRole || candidate.role === expectedRole) &&
    typeof candidate.badPrompt === "string" &&
    (!expectedBadPrompt || candidate.badPrompt === expectedBadPrompt) &&
    typeof candidate.rewrittenPrompt === "string" &&
    candidate.result !== undefined &&
    typeof candidate.result === "object" &&
    candidate.result !== null &&
    typeof candidate.result.score === "number" &&
    Array.isArray(candidate.result.criteria)
  );
}
