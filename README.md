# AI Fluency Check

Small MVP web app built with Next.js, TypeScript, Tailwind CSS, and the App Router.

It lets a user fill out a short audit about their AI usage, then generates a lightweight local report showing:

- AI fluency score
- 4 score categories
- strengths
- blind spots
- 3 recommendations
- 30-day plan
- 2 mini project ideas

No auth or database. Core scoring is local and deterministic, with an optional OpenAI-powered insights layer.

The app now also supports optional AI-generated insights using the OpenAI API, while keeping the main score deterministic.

## Run locally

Using Bun:

```bash
bun install
bun run dev
```

Using npm:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## OpenAI setup

Create a `.env.local` file or `.env` file with:

```bash
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4.1-mini
```

Notes:

- The deterministic score still works without OpenAI.
- The extra `AI insights` card on the results page requires the API key.
- The API key is only used server-side through `app/api/insights/route.ts`.

## Project structure

```text
app/
  layout.tsx        Root layout and metadata
  page.tsx          Home page
  audit/page.tsx    Audit form page
  results/page.tsx  Results page
  api/insights/     OpenAI-backed insights route

components/
  audit-form.tsx    Main client-side form
  progress-bar.tsx  Simple score bar
  result-card.tsx   Reusable results card

lib/
  example-data.ts      Prefilled default example + shared constants
  recommendations.ts   Role-based recommendations and mini project templates
  scoring.ts           Deterministic scoring logic
  ai/insights.ts       OpenAI prompt builder and response parsing
  types.ts             Shared TypeScript types
```

## How scoring works

Scoring is fully deterministic and based only on these five inputs:

- usage frequency
- use case breadth
- prompting confidence
- workflow maturity
- review habit

Each area contributes a fixed number of points:

- frequency: up to 20
- breadth: up to 20
- prompting confidence: up to 20
- repeatable workflows: up to 20
- critical review habit: up to 20

Total score = 100 max.

The app also groups those inputs into 4 display categories:

- Adoption
- Prompting
- Workflow
- Judgment

## How AI insights work

- The score and core report remain deterministic.
- When the user clicks `Generate AI insights`, the app posts the saved form input to `app/api/insights/route.ts`.
- The server recomputes the deterministic result, sends the form + score context to OpenAI, and asks for structured JSON.
- The UI renders the AI output as an extra interpretation layer with:
  - narrative takeaway
  - patterns noticed
  - sanity-check prompts
  - one concrete next step

## Where to edit role-based recommendations

Edit `lib/recommendations.ts`.

That file contains hardcoded recommendation and mini-project templates for:

- Product Manager
- Software Engineer
- Designer
- Marketer
- General

Recommendations are selected by score tier:

- low
- medium
- high

## Notes

- The audit form includes a prefilled Product Manager example so the app is easy to test.
- Results are stored in `sessionStorage`, so everything stays local to the browser session.
