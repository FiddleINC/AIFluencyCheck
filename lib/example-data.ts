import type { AuditFormData, UseCaseType } from "@/lib/types";

export const STORAGE_KEY = "ai-fluency-check-result";
export const FORM_STORAGE_KEY = "ai-fluency-check-form";
export const AI_INSIGHTS_STORAGE_KEY = "ai-fluency-check-ai-insights";
export const PROMPT_CHALLENGE_STORAGE_KEY = "ai-fluency-check-prompt-challenge";

export const useCaseOptions: UseCaseType[] = [
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
];

export const defaultAuditFormValues: AuditFormData = {
  name: "Maya Chen",
  role: "Product Manager",
  yearsExperience: "7",
  industry: "B2B SaaS",
  usageFrequency: "few_times_a_week",
  tools: "ChatGPT, Claude, Notion AI",
  useCases: [
    "PRD drafting",
    "User research synthesis",
    "Meeting note summarization",
    "Project planning",
    "Decision memo drafting",
  ],
  primaryUseCase: "PRD drafting",
  promptingConfidence: 3,
  repeatableWorkflows: false,
  reviewHabit: 4,
  improvementGoal: "Create more repeatable PM workflows and communicate decisions faster.",
  promptExamples:
    "1. Turn these meeting notes into a decision summary with risks and owners.\n2. Synthesize these interview notes into themes and user pains.\n3. Draft a v1 PRD with goals, scope, and open questions.",
  resumeText:
    "Product Manager with 7 years of experience across growth and platform teams. I lead discovery, partner with engineering and design, and translate customer insight into roadmap decisions.",
};
