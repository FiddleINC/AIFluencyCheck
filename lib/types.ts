export type UsageFrequency =
  | "daily"
  | "few_times_a_week"
  | "weekly"
  | "rarely";

export type RoleType =
  | "Product Manager"
  | "Software Engineer"
  | "Designer"
  | "Marketer"
  | "Consultant"
  | "Finance / Analyst"
  | "Operations Manager"
  | "Sales / BD"
  | "HR / People"
  | "General";

export type UseCaseType =
  | "PRD drafting"
  | "User research synthesis"
  | "Code generation"
  | "Data analysis"
  | "Brainstorming ideas"
  | "Meeting note summarization"
  | "Project planning"
  | "Spreadsheet or data cleanup"
  | "Client or stakeholder communication"
  | "Visual or design exploration"
  | "Email drafting"
  | "Presentation or slide drafting"
  | "Decision memo drafting"
  | "Proposal drafting"
  | "Report writing"
  | "Process or SOP documentation"
  | "Outreach personalization"
  | "CRM or account notes"
  | "Interview preparation"
  | "Policy or people documentation"
  | "Day-to-day task support";

export type AuditFormData = {
  name: string;
  role: RoleType;
  yearsExperience: string;
  industry: string;
  usageFrequency: UsageFrequency;
  tools: string;
  useCases: UseCaseType[];
  primaryUseCase: UseCaseType;
  promptingConfidence: number;
  repeatableWorkflows: boolean;
  reviewHabit: number;
  improvementGoal: string;
  promptExamples: string;
  resumeText: string;
};

export type ScoreCategory = {
  name: string;
  score: number;
};

export type ProjectIdea = {
  title: string;
  description: string;
  promptTitle?: string;
  promptText?: string;
};

export type ResourceItem = {
  title: string;
  description: string;
  url: string;
};

export type ResourceSection = {
  category: "Free courses" | "Tools to try" | "Reads";
  items: ResourceItem[];
};

export type FluencyBadge = {
  label: "AI Observer" | "AI Practitioner" | "AI Strategist" | "AI Leader";
  emoji: string;
};

export type AuditResult = AuditFormData & {
  overallScore: number;
  scoreLabel: string;
  categories: ScoreCategory[];
  strengths: string[];
  blindSpots: string[];
  recommendations: string[];
  thirtyDayPlan: string[];
  projectIdeas: ProjectIdea[];
  frequencyLabel: string;
};

export type AiInsights = {
  summary: string;
  patterns: string[];
  sanityChecks: string[];
  nextStep: string;
};

export type ReportSource = "ai" | "deterministic";

export type GeneratedReport = AuditResult & {
  narrativeSummary: string;
  sanityChecks: string[];
  resources?: ResourceSection[];
  source: ReportSource;
  fallbackReason?: string;
};

export type InsightsRequest = {
  form: AuditFormData;
};

export type InsightsResponse = {
  report: GeneratedReport | null;
  error?: string;
};

export type PromptRewriteCriterion = {
  label: string;
  hit: boolean;
  detail: string;
};

export type PromptRewriteResult = {
  score: number;
  criteria: PromptRewriteCriterion[];
};

export type PromptRewriteState = {
  role: RoleType;
  badPrompt: string;
  rewrittenPrompt: string;
  result: PromptRewriteResult;
};
