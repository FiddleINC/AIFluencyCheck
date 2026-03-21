import type { ProjectIdea, RoleType } from "@/lib/types";

type RecommendationTier = "low" | "medium" | "high";

type RoleTemplate = {
  recommendations: string[];
  projectIdeas: ProjectIdea[];
};

type RoleMap = Record<RecommendationTier, RoleTemplate>;

const templates: Record<string, RoleMap> = {
  product_manager: {
    low: {
      recommendations: [
        "Use AI to turn one messy input each week into a structured PM artifact, like a PRD outline, interview synthesis, or release update.",
        "Create a repeatable prompting template for roadmap communication so stakeholder updates stop starting from a blank page.",
        "Add a review checklist for every AI draft: verify assumptions, data sources, edge cases, and owner names before sharing.",
      ],
      projectIdeas: [
        {
          title: "PRD starter kit",
          description:
            "Build a reusable prompt + doc template that converts feature notes into a v0 PRD with goals, scope, risks, and open questions.",
        },
        {
          title: "Interview synthesis assistant",
          description:
            "Create a simple workflow that groups 5 to 10 interview notes into themes, pain points, and recommended next actions.",
        },
      ],
    },
    medium: {
      recommendations: [
        "Turn your best prompts for research synthesis, meeting summaries, and stakeholder updates into reusable PM playbooks.",
        "Move one recurring PM task into a repeatable workflow, such as weekly experiment ideas or roadmap status reporting.",
        "Ask AI for structured tradeoff analysis, then pressure-test the output against customer evidence and team constraints.",
      ],
      projectIdeas: [
        {
          title: "Roadmap update copilot",
          description:
            "Use AI to convert sprint notes and decision logs into a concise stakeholder update with progress, risks, and asks.",
        },
        {
          title: "Experiment backlog generator",
          description:
            "Create a prompt workflow that turns funnel issues or customer pain points into ranked experiment concepts.",
        },
      ],
    },
    high: {
      recommendations: [
        "Standardize a PM operating system around AI for PRDs, research synthesis, and executive-ready communication.",
        "Use AI to compare options in a structured way, but keep human judgment on prioritization, sequencing, and tradeoffs.",
        "Document your strongest workflows so your team can reuse them for notes, analysis, and experiment planning.",
      ],
      projectIdeas: [
        {
          title: "PM workflow library",
          description:
            "Package your best prompts and review checklists into a shared set of templates for PRDs, updates, and customer insight synthesis.",
        },
        {
          title: "Decision memo generator",
          description:
            "Build a repeatable prompt set that transforms raw context into a balanced decision memo with options, evidence, and recommendation.",
        },
      ],
    },
  },
  software_engineer: {
    low: {
      recommendations: [
        "Start with narrow tasks like debugging, test case generation, and documentation before using AI for larger implementation work.",
        "Save one reusable prompt for code review and one for breaking down a feature into smaller engineering tasks.",
        "Always verify generated code for edge cases, security issues, and correctness before trusting it.",
      ],
      projectIdeas: [
        {
          title: "Bug triage helper",
          description:
            "Turn stack traces and issue summaries into likely root causes, reproduction steps, and a shortlist of fixes.",
        },
        {
          title: "Test coverage booster",
          description:
            "Use AI to suggest missing edge cases and draft unit test outlines for one module you own.",
        },
      ],
    },
    medium: {
      recommendations: [
        "Push beyond one-off coding help and define repeatable AI workflows for debugging, refactoring, and test writing.",
        "Use richer context in prompts, including constraints, interfaces, and failure cases, to improve output quality.",
        "Compare AI suggestions against your architecture and coding standards before merging them into real work.",
      ],
      projectIdeas: [
        {
          title: "Refactor planner",
          description:
            "Create a prompt workflow that turns a messy file into a stepwise refactor plan with tests and rollback notes.",
        },
        {
          title: "PR review companion",
          description:
            "Use AI to summarize a pull request, surface risky areas, and suggest targeted review questions.",
        },
      ],
    },
    high: {
      recommendations: [
        "Codify your strongest engineering prompts into team-ready patterns for design reviews, implementation planning, and test generation.",
        "Use AI to speed up exploration, but keep final judgment on architecture, security, and maintainability with humans.",
        "Measure where AI genuinely saves engineering time so you can expand the workflows that prove reliable.",
      ],
      projectIdeas: [
        {
          title: "Engineering prompt cookbook",
          description:
            "Build a shared library of prompts for debugging, planning, code review, and test generation across your team.",
        },
        {
          title: "Change impact mapper",
          description:
            "Create a lightweight workflow that summarizes how a code change might affect dependencies, tests, and release risk.",
        },
      ],
    },
  },
  designer: {
    low: {
      recommendations: [
        "Use AI for structured exploration first, such as research summaries, content variants, and critique prompts.",
        "Create a prompt pattern that asks for alternatives, rationale, and tradeoffs instead of one-shot solutions.",
        "Review outputs for tone, accessibility, and product context before using them in design work.",
      ],
      projectIdeas: [
        {
          title: "Research recap generator",
          description:
            "Turn usability notes into themes, friction points, and next design questions.",
        },
        {
          title: "UX copy explorer",
          description:
            "Use AI to generate multiple UI copy options for one flow, then compare them for clarity and tone.",
        },
      ],
    },
    medium: {
      recommendations: [
        "Move from ad hoc ideation into repeatable workflows for critique, synthesis, and content iteration.",
        "Prompt AI with audience, constraints, and product context so outputs feel grounded in real design decisions.",
        "Use AI as a sparring partner for alternatives, but keep final calls rooted in research and design principles.",
      ],
      projectIdeas: [
        {
          title: "Design critique assistant",
          description:
            "Build a workflow that reviews a concept against goals, usability heuristics, and edge cases.",
        },
        {
          title: "Persona summary tool",
          description:
            "Turn research notes into concise persona snapshots with needs, motivations, and friction points.",
        },
      ],
    },
    high: {
      recommendations: [
        "Package your best research and critique prompts into a lightweight design ops library for the team.",
        "Use AI to accelerate exploration and articulation, while reserving taste, prioritization, and experience quality for human judgment.",
        "Expand from individual use to shared workflows for synthesis, copy, and critique.",
      ],
      projectIdeas: [
        {
          title: "Design ops prompt set",
          description:
            "Create a shared prompt collection for synthesis, critique, and UX writing that other designers can adopt quickly.",
        },
        {
          title: "Journey gap finder",
          description:
            "Use AI to review a flow and surface likely moments of friction, missing states, and accessibility concerns.",
        },
      ],
    },
  },
  marketer: {
    low: {
      recommendations: [
        "Start with AI on repeatable marketing tasks like campaign briefs, headline variations, and summary drafts.",
        "Write prompts that include audience, offer, channel, and desired tone so outputs are more usable.",
        "Review every draft for brand accuracy, factual claims, and differentiation before publishing.",
      ],
      projectIdeas: [
        {
          title: "Campaign brief generator",
          description:
            "Use AI to convert rough goals into a simple campaign brief with audience, message, and channel ideas.",
        },
        {
          title: "Content remix workflow",
          description:
            "Turn one webinar or blog post into channel-ready snippets for email, social, and landing page updates.",
        },
      ],
    },
    medium: {
      recommendations: [
        "Build repeatable workflows for campaign ideation, content repurposing, and performance recap drafting.",
        "Use AI to produce options, then compare them against your brand voice and business goals.",
        "Add a simple review loop for claims, positioning, and clarity before content goes live.",
      ],
      projectIdeas: [
        {
          title: "Weekly performance recap",
          description:
            "Create a workflow that turns channel metrics into a readable weekly summary with wins, misses, and next tests.",
        },
        {
          title: "Persona message map",
          description:
            "Use AI to turn audience notes into messaging angles, objections, and proof points.",
        },
      ],
    },
    high: {
      recommendations: [
        "Standardize your strongest AI marketing workflows for briefs, repurposing, and reporting.",
        "Use AI to widen the option set, but keep final judgment on strategy, positioning, and voice with the team.",
        "Document where AI improves throughput without lowering quality, then scale those workflows first.",
      ],
      projectIdeas: [
        {
          title: "Marketing workflow library",
          description:
            "Package your best prompts for campaign briefs, content refreshes, and reporting into a reusable team kit.",
        },
        {
          title: "Test idea engine",
          description:
            "Build a simple flow that turns weak-performing campaigns into fresh message and creative test ideas.",
        },
      ],
    },
  },
  consultant: {
    low: {
      recommendations: [
        "Use AI to turn meeting notes into clean follow-up emails, action lists, and proposal inputs.",
        "Draft first-pass client documents faster by giving AI past proposals, scopes, and report structures.",
        "Prepare for client calls with AI-generated question lists, risk prompts, and summary briefs.",
      ],
      projectIdeas: [
        {
          title: "Proposal starter workflow",
          description:
            "Build a reusable prompt set for proposal outlines, workshop agendas, and client recap emails.",
        },
        {
          title: "Weekly client update drafter",
          description:
            "Create a workflow that turns notes and status inputs into a polished weekly client summary.",
        },
      ],
    },
    medium: {
      recommendations: [
        "Standardize AI support for proposals, discovery summaries, and executive-ready recommendation decks.",
        "Use AI to compare interview notes, spot recurring themes, and surface risks across workstreams.",
        "Create role-based prompt templates so teams produce more consistent client-facing material.",
      ],
      projectIdeas: [
        {
          title: "AI-assisted proposal process",
          description:
            "Pilot an AI-assisted proposal process with review checkpoints for tone, accuracy, and compliance.",
        },
        {
          title: "Project insight tracker",
          description:
            "Set up a workflow that converts team notes into issue logs, themes, and recommended next steps.",
        },
      ],
    },
    high: {
      recommendations: [
        "Embed AI into core delivery workflows for diagnostics, reporting, and client communication at scale.",
        "Create a shared knowledge base of proven prompts, case examples, and reusable consulting outputs.",
        "Track time saved and quality gains so AI use is tied to turnaround and client value.",
      ],
      projectIdeas: [
        {
          title: "Consulting AI playbook",
          description:
            "Launch a playbook that maps where AI supports discovery, analysis, and recommendation writing.",
        },
        {
          title: "Steering update generator",
          description:
            "Run a pilot that uses AI to produce draft readouts and steering updates from project inputs.",
        },
      ],
    },
  },
  finance_analyst: {
    low: {
      recommendations: [
        "Use AI to turn raw notes or spreadsheet findings into short report commentary and stakeholder updates.",
        "Draft budget summaries, variance explanations, and monthly review notes in plain business language.",
        "Prepare faster for review meetings with AI-generated questions, talking points, and summary tables.",
      ],
      projectIdeas: [
        {
          title: "Commentary prompt set",
          description:
            "Create prompts for monthly variance write-ups, forecast commentary, and finance update emails.",
        },
        {
          title: "Executive summary helper",
          description:
            "Build a process that converts recurring finance packs into one-page executive summaries.",
        },
      ],
    },
    medium: {
      recommendations: [
        "Standardize AI support for management reporting, forecast narratives, and board-ready summaries.",
        "Use AI to compare prior and current period commentary and highlight changes worth reviewing.",
        "Improve cross-team communication by using AI to tailor finance messages for non-finance audiences.",
      ],
      projectIdeas: [
        {
          title: "Month-end commentary workflow",
          description:
            "Pilot an AI-assisted month-end commentary workflow with clear human review before distribution.",
        },
        {
          title: "Finance writing library",
          description:
            "Create a reusable library for budget notes, performance updates, and business case summaries.",
        },
      ],
    },
    high: {
      recommendations: [
        "Embed AI into recurring reporting cycles to reduce manual drafting across planning and performance work.",
        "Create approved prompt standards for reporting, scenario summaries, and executive briefing notes.",
        "Measure impact through faster reporting turnaround, clearer commentary, and fewer rewrite cycles.",
      ],
      projectIdeas: [
        {
          title: "Reporting assistant workflow",
          description:
            "Launch a workflow that drafts first-pass commentary from report inputs each month.",
        },
        {
          title: "Decision support pilot",
          description:
            "Run a finance business-partner pilot focused on clearer AI-shaped summaries for decision making.",
        },
      ],
    },
  },
  operations_manager: {
    low: {
      recommendations: [
        "Use AI to turn meeting notes into action trackers, status updates, and clear owner-based follow-ups.",
        "Draft standard operating procedures, process notes, and handover documents from existing materials.",
        "Prepare faster for cross-team meetings with AI-generated agendas, risks, and dependency summaries.",
      ],
      projectIdeas: [
        {
          title: "Ops template pack",
          description:
            "Create prompt templates for SOP drafts, project updates, and issue escalation messages.",
        },
        {
          title: "Weekly ops summary",
          description:
            "Build a workflow that turns team inputs into a concise weekly leadership update.",
        },
      ],
    },
    medium: {
      recommendations: [
        "Standardize AI use for process documentation, incident summaries, and operational review packs.",
        "Use AI to identify repeated blockers, missed handoffs, and communication gaps across team updates.",
        "Improve consistency by giving teams shared prompts for updates, requests, and escalation notes.",
      ],
      projectIdeas: [
        {
          title: "SOP refresh pilot",
          description:
            "Pilot an AI-assisted SOP refresh for one core process with owner review and sign-off.",
        },
        {
          title: "Ops reporting workflow",
          description:
            "Set up a workflow that drafts weekly risks, actions, and decisions from team notes.",
        },
      ],
    },
    high: {
      recommendations: [
        "Embed AI into core operating rhythms such as review meetings, issue management, and documentation upkeep.",
        "Create an internal operations playbook with approved prompts for updates, process changes, and incident write-ups.",
        "Track value through reduced admin time, clearer ownership, and faster cross-team coordination.",
      ],
      projectIdeas: [
        {
          title: "Operations documentation system",
          description:
            "Launch a centralized workflow for AI-assisted process documentation across major operational activities.",
        },
        {
          title: "Leadership action dashboard",
          description:
            "Run a pilot that converts recurring team updates into leadership-ready summaries and action dashboards.",
        },
      ],
    },
  },
  sales_bd: {
    low: {
      recommendations: [
        "Use AI to draft outreach emails, follow-up notes, and meeting recaps based on account context.",
        "Prepare for calls with AI-generated discovery questions, objection prompts, and account summaries.",
        "Turn scattered notes into cleaner proposals, next-step emails, and internal handoff updates.",
      ],
      projectIdeas: [
        {
          title: "Prospecting prompt kit",
          description:
            "Create prompt templates for prospecting emails, call prep briefs, and post-meeting follow-ups.",
        },
        {
          title: "Deal summary workflow",
          description:
            "Build a workflow that turns sales notes into a first-pass proposal or scope summary.",
        },
      ],
    },
    medium: {
      recommendations: [
        "Standardize AI support for outreach sequences, proposal drafting, and account planning updates.",
        "Use AI to tailor messaging by industry, buyer type, and deal stage without rewriting from scratch.",
        "Improve sales-to-delivery handoffs by using AI to summarize client needs, risks, and commitments.",
      ],
      projectIdeas: [
        {
          title: "Outbound pilot",
          description:
            "Pilot an AI-assisted outbound process for one segment with approved messaging and review checks.",
        },
        {
          title: "Deal brief format",
          description:
            "Create a reusable deal summary format that turns call notes into internal briefs and client recaps.",
        },
      ],
    },
    high: {
      recommendations: [
        "Embed AI into the full deal workflow from prospect research to proposal support and account reviews.",
        "Create a shared library of proven prompts, messaging patterns, and proposal building blocks.",
        "Measure impact through faster response times, better message consistency, and stronger handoff quality.",
      ],
      projectIdeas: [
        {
          title: "Sales AI playbook",
          description:
            "Launch a team playbook for AI-supported outreach, meeting prep, and proposal drafting.",
        },
        {
          title: "Account brief generator",
          description:
            "Run a pilot that generates account briefs and follow-up content from CRM notes and meeting inputs.",
        },
      ],
    },
  },
  hr_people: {
    low: {
      recommendations: [
        "Use AI to draft policy updates, internal announcements, and manager communications more quickly.",
        "Turn notes from interviews or employee meetings into clean summaries, themes, and follow-up actions.",
        "Prepare faster for people meetings with AI-generated question guides, agenda drafts, and recap notes.",
      ],
      projectIdeas: [
        {
          title: "People docs prompt set",
          description:
            "Create prompt templates for policy drafts, job descriptions, and employee communication emails.",
        },
        {
          title: "Listening session summary",
          description:
            "Build a workflow that turns listening session notes into a clear summary with themes and next steps.",
        },
      ],
    },
    medium: {
      recommendations: [
        "Standardize AI use for policy writing, performance cycle communications, and people program updates.",
        "Use AI to compare feedback themes across teams and surface repeated concerns for HR review.",
        "Improve manager support with shared prompts for feedback conversations, team updates, and documentation.",
      ],
      projectIdeas: [
        {
          title: "Policy refresh workflow",
          description:
            "Pilot an AI-assisted policy refresh process with review steps for tone, clarity, and compliance.",
        },
        {
          title: "People communications library",
          description:
            "Create a library for announcements, FAQ drafts, and manager briefing notes.",
        },
      ],
    },
    high: {
      recommendations: [
        "Embed AI into recurring people workflows such as policy maintenance, employee communications, and program reporting.",
        "Create approved prompt standards for sensitive writing so outputs stay clear, consistent, and appropriate.",
        "Track value through faster document turnaround, stronger manager adoption, and reduced drafting effort.",
      ],
      projectIdeas: [
        {
          title: "HR writing playbook",
          description:
            "Launch a playbook covering policies, manager guidance, and employee-facing communications.",
        },
        {
          title: "Program summary pilot",
          description:
            "Run a pilot that turns program updates, survey themes, and meeting notes into leadership-ready summaries.",
        },
      ],
    },
  },
  general: {
    low: {
      recommendations: [
        "Start small with one or two clear, repeatable tasks so you can build trust in how AI helps your work.",
        "Use more specific prompts with context, goals, and constraints instead of asking for generic help.",
        "Review outputs carefully for mistakes, missing context, and overconfident claims.",
      ],
      projectIdeas: [
        {
          title: "Weekly work summary helper",
          description:
            "Use AI to convert raw notes into a clear weekly update with progress, blockers, and priorities.",
        },
        {
          title: "Template builder",
          description:
            "Create a reusable prompt for one document or recurring task you produce often.",
        },
      ],
    },
    medium: {
      recommendations: [
        "Turn your best ad hoc uses into reusable workflows with saved prompts and a clear review step.",
        "Use AI across more than one use case so you can build broader fluency, not just familiarity.",
        "Compare AI outputs against real business context before acting on them.",
      ],
      projectIdeas: [
        {
          title: "Meeting notes to action plan",
          description:
            "Build a small workflow that turns raw notes into actions, owners, and deadlines.",
        },
        {
          title: "Decision memo draft",
          description:
            "Use AI to convert a problem statement and constraints into a basic decision memo.",
        },
      ],
    },
    high: {
      recommendations: [
        "Document your strongest AI workflows so they can be reused consistently instead of reinvented each time.",
        "Use AI to accelerate synthesis and drafting, but keep final decisions grounded in judgment and context.",
        "Expand from personal productivity gains into simple shared workflows for your team.",
      ],
      projectIdeas: [
        {
          title: "Team prompt kit",
          description:
            "Package a few proven prompts and review steps into a starter toolkit for colleagues.",
        },
        {
          title: "Reusable analysis workflow",
          description:
            "Create a prompt sequence that turns raw notes or inputs into a clear structured analysis.",
        },
      ],
    },
  },
};

function normalizeRole(role: RoleType): string {
  return role.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export function getRoleRecommendations(role: RoleType, score: number) {
  const tier: RecommendationTier = score < 45 ? "low" : score < 70 ? "medium" : "high";
  const normalized = normalizeRole(role);
  const roleTemplates = templates[normalized] ?? templates.general;

  return roleTemplates[tier];
}

export function getThirtyDayPlan(role: RoleType, score: number): string[] {
  const normalized = normalizeRole(role);

  if (normalized === "product_manager") {
    return [
      "Pick one PM workflow to improve with AI, such as PRD drafting, research synthesis, or stakeholder updates, and save your best baseline prompt.",
      "Run that workflow twice with real work, then tighten the prompt structure so outputs are more reliable and easier to review.",
      "Add a simple QA checklist for evidence, assumptions, tradeoffs, and owner clarity before sharing AI-assisted work.",
      score < 70
        ? "Turn the workflow into a reusable template and use it for one live roadmap, research, or meeting-summary task."
        : "Document the workflow as a repeatable team template for roadmap communication, note summarization, or structured analysis.",
    ];
  }

  return [
    "Choose one recurring task where AI can help and write down the exact prompt you want to improve.",
    "Use the workflow on real work twice this week and note where the output is strong or weak.",
    "Add a review habit so you check facts, assumptions, and missing context before using the result.",
    score < 70
      ? "Turn your best version into a reusable template for the next month."
      : "Package the workflow so a teammate could reuse it with minimal guidance.",
  ];
}
