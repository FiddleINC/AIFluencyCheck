import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16 sm:px-10">
      <section className="grid gap-10 rounded-[2rem] border border-white/70 bg-white/80 p-8 shadow-[0_24px_80px_rgba(28,32,48,0.08)] backdrop-blur md:grid-cols-[1.2fr_0.8fr] md:p-12">
        <div className="space-y-6">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--accent-strong)]">
            AI Fluency Check
          </p>
          <div className="space-y-4">
            <h1 className="max-w-2xl font-display text-5xl leading-tight text-slate-900 sm:text-6xl">
              A quick AI usage audit for modern teams.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-slate-600">
              Answer a few practical questions about how you use AI today and get
              a lightweight report with your score, strengths, gaps, and next
              steps.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/audit"
              className="inline-flex h-12 w-fit items-center justify-center whitespace-nowrap rounded-full bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
            >
              Start the audit
            </Link>
            <p className="inline-flex items-center text-sm text-slate-500">
              Prefilled example included so you can test it in under a minute.
            </p>
          </div>
        </div>

        <div className="grid gap-4 rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(245,242,236,0.92))] p-6">
          <div className="rounded-3xl border border-[var(--border)] bg-white p-5">
            <p className="text-sm font-medium text-slate-500">What you get</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              <li>- AI fluency score out of 100</li>
              <li>- Four practical score categories</li>
              <li>- Strengths, blind spots, and role-based recommendations</li>
              <li>- A simple 30-day plan and two mini project ideas</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--panel-soft)] p-5">
            <p className="text-sm font-medium text-slate-500">Private by default</p>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              Your form and report are stored in this browser session only, and AI
              report generation is sent server-side when enabled. No account needed.
              Takes about 2 minutes.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
